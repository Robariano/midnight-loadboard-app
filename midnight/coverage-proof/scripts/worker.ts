// Nightlane's proving worker for the Private Coverage Check pilot.
//
//   npm run worker            keep running, check for approved requests every 30s
//   npm run worker -- --once  handle what's waiting, then stop
//
// Brokers ask for proofs on nightlaneloads.com/coverage-check; the carrier
// approves from its private link; this worker (on Nightlane's computer, with
// the proof server running) builds each approved proof on Midnight and
// reports back. Carrier keys and attestations stay on this computer.
//
// It talks to the website with COVERAGE_WORKER_SECRET. The first run creates
// one in .env.<network> and prints what to put in Vercel.
import { randomBytes } from 'node:crypto';
import { appendFileSync, readdirSync, readFileSync } from 'node:fs';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledCoverageContract, ledger } from '../contract/index.js';
import type { CoverageAttestation, CoveragePrivateState } from '../contract/witnesses.js';
import { NETWORK, ROOT, endOfDay, loadSecrets, logger, readDeployment, requestIdOf, reviveBigints, usd } from '../src/common.js';
import { ledgerState } from '../src/providers.js';
import { openSession } from '../src/session.js';

const once = process.argv.includes('--once');
const POLL_MS = 30_000;

loadSecrets();
if (!process.env['COVERAGE_WORKER_SECRET']) {
  const secret = randomBytes(32).toString('hex');
  appendFileSync(`${ROOT}.env.${NETWORK}`, `COVERAGE_WORKER_SECRET=${secret}\n`, { mode: 0o600 });
  process.env['COVERAGE_WORKER_SECRET'] = secret;
  console.log('\nCreated COVERAGE_WORKER_SECRET in .env.' + NETWORK + '.');
  console.log('Add it to Vercel (Settings > Environment Variables, Production) under the same name, then redeploy.');
  console.log('See it with:  grep COVERAGE_WORKER_SECRET .env.' + NETWORK + '\n');
  process.exit(0);
}
const SITE = (process.env['NIGHTLANE_SITE'] || 'https://www.nightlaneloads.com').replace(/\/$/, '');
const auth = { Authorization: `Bearer ${process.env['COVERAGE_WORKER_SECRET']}` };

type QueuedRequest = {
  id: string; request_text: string; dot_number: string;
  min_liability: number; min_cargo: number; covered_through: string;
};

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${SITE}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...auth, ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path}: ${res.status} ${body.error || ''}`.trim());
  return body;
}
const report = (id: string, status: string, error?: string) =>
  api('/api/coverage-worker/update', { method: 'POST', body: JSON.stringify({ id, status, error }) });

// The newest attestation for this DOT and the carrier key it was issued to.
function carrierFor(dot: string): { name: string; secretKey: Uint8Array; attestation: CoverageAttestation } | null {
  const files = (() => { try { return readdirSync(`${ROOT}attestations`); } catch { return []; } })()
    .filter((f) => f.startsWith(`${dot}-`) && f.endsWith('.json')).sort().reverse();
  const carriers = (() => { try { return readdirSync(`${ROOT}carriers`); } catch { return []; } })()
    .map((f) => JSON.parse(readFileSync(`${ROOT}carriers/${f}`, 'utf8')));
  for (const f of files) {
    const { carrierPublicKey, attestation } = reviveBigints(JSON.parse(readFileSync(`${ROOT}attestations/${f}`, 'utf8')));
    const c = carriers.find((x) => x.publicKey === carrierPublicKey);
    if (c) return { name: c.name, secretKey: Uint8Array.from(Buffer.from(c.secretKey, 'hex')), attestation };
  }
  return null;
}

// Plain-English reason the carrier's attestation can't answer, or null.
function cannotProve(a: CoverageAttestation, r: QueuedRequest, through: bigint): string | null {
  const why: string[] = [];
  if (a.coverage.liability < BigInt(r.min_liability)) why.push(`liability is below ${usd(BigInt(r.min_liability))}`);
  if (a.coverage.cargo < BigInt(r.min_cargo)) why.push(`cargo coverage is below ${usd(BigInt(r.min_cargo))}`);
  if (a.coverage.expiresAt < through) why.push(`coverage on file ends before ${r.covered_through}`);
  return why.length ? `Can't prove: ${why.join('; ')}.` : null;
}

const deployment = readDeployment();
const { providers, close } = await openSession();
process.on('SIGINT', async () => { logger.info('Stopping worker...'); await close(); process.exit(0); });
logger.info(`Worker ready. Watching ${SITE} for approved coverage requests${once ? ' (once)' : ''}.`);

async function handle(r: QueuedRequest) {
  const label = `"${r.request_text}" (DOT ${r.dot_number})`;
  const carrier = carrierFor(r.dot_number);
  if (!carrier) {
    logger.warn(`${label}: no enrolled carrier for this DOT on this computer.`);
    return report(r.id, 'failed', 'This carrier is not enrolled with Nightlane yet.');
  }
  const through = endOfDay(r.covered_through);
  const reason = cannotProve(carrier.attestation, r, through);
  if (reason) {
    logger.info(`${label}: ${reason}`);
    return report(r.id, 'failed', reason);
  }
  const requestId = requestIdOf(r.request_text);
  const before = ledger(ledgerState(await providers.publicDataProvider.queryContractState(deployment.contractAddress)));
  if (before.proofs.member(requestId)) {
    logger.info(`${label}: already proved on Midnight.`);
    await report(r.id, 'proving');
    return report(r.id, 'proved');
  }

  await report(r.id, 'proving');
  try {
    const stateId = `carrier-${carrier.name}`;
    const ps: CoveragePrivateState = { secretKey: carrier.secretKey, attestation: carrier.attestation };
    await providers.privateStateProvider.forContract(deployment.contractAddress).set(stateId, ps);
    logger.info(`${label}: building the proof...`);
    await submitCallTx(providers, {
      compiledContract: CompiledCoverageContract,
      contractAddress: deployment.contractAddress,
      privateStateId: stateId,
      circuitId: 'proveCoverage',
      args: [requestId, BigInt(r.min_liability), BigInt(r.min_cargo), through],
    } as any);
    await report(r.id, 'proved');
    logger.info(`${label}: proved on Midnight.`);
  } catch (e: any) {
    const msg = String(e?.message || e).slice(0, 250);
    logger.error(`${label}: failed: ${msg}`);
    await report(r.id, 'failed', `Proof failed: ${msg}`).catch(() => {});
  }
}

for (;;) {
  try {
    const { requests } = (await api('/api/coverage-worker/queue')) as { requests: QueuedRequest[] };
    for (const r of requests) await handle(r);
  } catch (e: any) {
    logger.error(`Worker loop: ${e?.message || e}`);
  }
  if (once) break;
  await new Promise((res) => setTimeout(res, POLL_MS));
}
await close();
process.exit(0);
