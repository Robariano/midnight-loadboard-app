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
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledCoverageContract, ledger } from '../contract/index.js';
import { CompiledDriverContract, driverLedger, driverPureCircuits, driverZkConfigPath, nameBytes, normalizeDriverName, type DriverAttestation, type DriverPrivateState } from '../contract/driver.js';
import { CompiledVehicleContract, vehicleLedger, vehiclePureCircuits, vehicleZkConfigPath, vinBytes, type VehicleAttestation, type VehiclePrivateState } from '../contract/vehicle.js';
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
  min_liability: number; min_cargo: number; covered_through: string; kind?: 'coverage' | 'vehicle' | 'driver'; vin?: string | null; driver_name?: string | null;
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

// The vehicle attestation for this DOT and VIN, and the carrier key it was issued to.
function vehicleCarrierFor(dot: string, vin: string): { name: string; secretKey: Uint8Array; attestation: VehicleAttestation } | null {
  const last6 = vin.slice(-6);
  const files = (() => { try { return readdirSync(`${ROOT}attestations`); } catch { return []; } })()
    .filter((f) => f === `vehicle-${dot}-${last6}.json`);
  const carriers = (() => { try { return readdirSync(`${ROOT}carriers`); } catch { return []; } })()
    .map((f) => JSON.parse(readFileSync(`${ROOT}carriers/${f}`, 'utf8')));
  for (const f of files) {
    const file = JSON.parse(readFileSync(`${ROOT}attestations/${f}`, 'utf8'));
    if (file.kind !== 'vehicle') continue;
    const { carrierPublicKey, attestation: raw } = reviveBigints(file);
    const attestation = { ...raw, vehicle: { ...raw.vehicle, vin: Uint8Array.from(Buffer.from(raw.vehicle.vin, 'hex')) } };
    if (Buffer.from(attestation.vehicle.vin).toString('ascii') !== vin) continue;
    const c = carriers.find((x) => x.publicKey === carrierPublicKey);
    if (c) return { name: c.name, secretKey: Uint8Array.from(Buffer.from(c.secretKey, 'hex')), attestation };
  }
  return null;
}

// The driver attestation for this DOT and (normalized) driver name.
function driverCarrierFor(dot: string, name: string): { name: string; secretKey: Uint8Array; attestation: DriverAttestation } | null {
  const file = `driver-${dot}-${name.replace(/[^A-Z0-9]+/g, '_')}.json`;
  if (!existsSync(`${ROOT}attestations/${file}`)) return null;
  const carriers = (() => { try { return readdirSync(`${ROOT}carriers`); } catch { return []; } })()
    .map((f) => JSON.parse(readFileSync(`${ROOT}carriers/${f}`, 'utf8')));
  const data = JSON.parse(readFileSync(`${ROOT}attestations/${file}`, 'utf8'));
  if (data.kind !== 'driver') return null;
  const { carrierPublicKey, attestation: raw } = reviveBigints(data);
  const attestation = { ...raw, driver: { ...raw.driver, name: Uint8Array.from(Buffer.from(raw.driver.name, 'hex')) } };
  if (!Buffer.from(attestation.driver.name).equals(Buffer.from(nameBytes(name)))) return null;
  const c = carriers.find((x) => x.publicKey === carrierPublicKey);
  return c ? { name: c.name, secretKey: Uint8Array.from(Buffer.from(c.secretKey, 'hex')), attestation } : null;
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
const vehicleDepFile = `${ROOT}deployments/${NETWORK}-vehicle.json`;
const vehicleDeployment = existsSync(vehicleDepFile) ? JSON.parse(readFileSync(vehicleDepFile, 'utf8')) : null;
const { providers, providersFor, close } = await openSession();
const vehicleProviders = vehicleDeployment ? providersFor(vehicleZkConfigPath) : null;
const driverDepFile = `${ROOT}deployments/${NETWORK}-driver.json`;
const driverDeployment = existsSync(driverDepFile) ? JSON.parse(readFileSync(driverDepFile, 'utf8')) : null;
const driverProviders = driverDeployment ? providersFor(driverZkConfigPath) : null;
process.on('SIGINT', async () => { logger.info('Stopping worker...'); await close(); process.exit(0); });
logger.info(`Worker ready. Watching ${SITE} for approved coverage requests${once ? ' (once)' : ''}.`);

async function handleVehicle(r: QueuedRequest) {
  const label = `"${r.request_text}" (DOT ${r.dot_number}, van ...${String(r.vin || '').slice(-6)})`;
  if (!vehicleDeployment || !vehicleProviders) return report(r.id, 'failed', 'Van proofs are not set up on this computer yet.');
  let vin: Uint8Array;
  try { vin = vinBytes(String(r.vin || '')); } catch { return report(r.id, 'failed', 'That VIN is not valid.'); }
  const vinText = Buffer.from(vin).toString('ascii');
  const carrier = vehicleCarrierFor(r.dot_number, vinText);
  if (!carrier) {
    logger.info(`${label}: no attestation for this van.`);
    return report(r.id, 'failed', 'Nightlane has not confirmed this van on the carrier\'s policy.');
  }
  const through = endOfDay(r.covered_through);
  if (carrier.attestation.vehicle.expiresAt < through) return report(r.id, 'failed', `Can't prove: coverage on file ends before ${r.covered_through}.`);
  const requestId = requestIdOf(r.request_text);
  const before = vehicleLedger(ledgerState(await vehicleProviders.publicDataProvider.queryContractState(vehicleDeployment.contractAddress)));
  if (before.proofs.member(requestId)) {
    await report(r.id, 'proving');
    return report(r.id, 'proved');
  }
  await report(r.id, 'proving');
  try {
    const stateId = `vehicle-carrier-${carrier.name}`;
    const ps: VehiclePrivateState = { secretKey: carrier.secretKey, attestation: carrier.attestation };
    await (vehicleProviders.privateStateProvider as any).forContract(vehicleDeployment.contractAddress).set(stateId, ps);
    logger.info(`${label}: building the proof...`);
    await submitCallTx(vehicleProviders as any, {
      compiledContract: CompiledVehicleContract,
      contractAddress: vehicleDeployment.contractAddress,
      privateStateId: stateId,
      circuitId: 'proveVehicle',
      args: [requestId, vehiclePureCircuits.vinCommitment(vin), through],
    } as any);
    await report(r.id, 'proved');
    logger.info(`${label}: proved on Midnight.`);
  } catch (e: any) {
    const msg = String(e?.message || e).slice(0, 250);
    logger.error(`${label}: failed: ${msg}`);
    await report(r.id, 'failed', `Proof failed: ${msg}`).catch(() => {});
  }
}

async function handleDriver(r: QueuedRequest) {
  let name: string;
  try { name = normalizeDriverName(String(r.driver_name || '')); } catch { return report(r.id, 'failed', 'That driver name is not valid.'); }
  const label = `"${r.request_text}" (DOT ${r.dot_number}, driver ${name})`;
  if (!driverDeployment || !driverProviders) return report(r.id, 'failed', 'Driver proofs are not set up on this computer yet.');
  const carrier = driverCarrierFor(r.dot_number, name);
  if (!carrier) {
    logger.info(`${label}: no attestation for this driver.`);
    return report(r.id, 'failed', 'Nightlane has not confirmed this driver on the carrier\'s policy.');
  }
  const through = endOfDay(r.covered_through);
  if (carrier.attestation.driver.expiresAt < through) return report(r.id, 'failed', `Can't prove: coverage on file ends before ${r.covered_through}.`);
  const requestId = requestIdOf(r.request_text);
  const before = driverLedger(ledgerState(await driverProviders.publicDataProvider.queryContractState(driverDeployment.contractAddress)));
  if (before.proofs.member(requestId)) {
    await report(r.id, 'proving');
    return report(r.id, 'proved');
  }
  await report(r.id, 'proving');
  try {
    const stateId = `driver-carrier-${carrier.name}`;
    const ps: DriverPrivateState = { secretKey: carrier.secretKey, attestation: carrier.attestation };
    await (driverProviders.privateStateProvider as any).forContract(driverDeployment.contractAddress).set(stateId, ps);
    logger.info(`${label}: building the proof...`);
    await submitCallTx(driverProviders as any, {
      compiledContract: CompiledDriverContract,
      contractAddress: driverDeployment.contractAddress,
      privateStateId: stateId,
      circuitId: 'proveDriver',
      args: [requestId, driverPureCircuits.nameCommitment(nameBytes(name)), through],
    } as any);
    await report(r.id, 'proved');
    logger.info(`${label}: proved on Midnight.`);
  } catch (e: any) {
    const msg = String(e?.message || e).slice(0, 250);
    logger.error(`${label}: failed: ${msg}`);
    await report(r.id, 'failed', `Proof failed: ${msg}`).catch(() => {});
  }
}

async function handle(r: QueuedRequest) {
  if (r.kind === 'vehicle') return handleVehicle(r);
  if (r.kind === 'driver') return handleDriver(r);
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
