// A carrier answers a broker's coverage request on Midnight.
//
//   npm run prove -- --carrier <name> --attestation attestations/<file>.json \
//     --request "MC 123456 load 4471" --liability 1000000 --cargo 100000 --through 2026-11-28
//
// The proof is built on this computer (proof server on port 6300) from the
// carrier's private attestation. Only the answer goes on-chain: this DOT met
// these minimums through this date. Nightlane's wallet pays the fee.
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledCoverageContract, ledger } from '../contract/index.js';
import type { CoveragePrivateState } from '../contract/witnesses.js';
import { ROOT, dollars, endOfDay, logger, readDeployment, requestIdOf, reviveBigints, usd } from '../src/common.js';
import { ledgerState } from '../src/providers.js';
import { openSession } from '../src/session.js';

const { values: a } = parseArgs({
  options: {
    carrier: { type: 'string' }, attestation: { type: 'string' }, request: { type: 'string' },
    liability: { type: 'string' }, cargo: { type: 'string' }, through: { type: 'string' }, network: { type: 'string' },
  },
});
for (const k of ['carrier', 'attestation', 'request', 'liability', 'cargo', 'through'] as const) {
  if (!a[k]) {
    console.error(`Missing --${k}.\nUsage: npm run prove -- --carrier <name> --attestation <file> --request "<text>" --liability <$> --cargo <$> --through YYYY-MM-DD`);
    process.exit(1);
  }
}

const carrier = JSON.parse(readFileSync(`${ROOT}carriers/${a.carrier}.json`, 'utf8'));
const { carrierPublicKey, attestation } = reviveBigints(JSON.parse(readFileSync(`${ROOT}${a.attestation!.replace(/^\.\//, '')}`, 'utf8')));
if (carrierPublicKey !== carrier.publicKey) throw new Error(`That attestation was issued to a different carrier key than "${a.carrier}".`);

const minLiability = dollars(a.liability!);
const minCargo = dollars(a.cargo!);
const through = endOfDay(a.through!);
const requestId = requestIdOf(a.request!);

// Check locally first, so a "no" is explained in plain English instead of a failed proof.
const problems: string[] = [];
if (attestation.coverage.liability < minLiability) problems.push(`liability is below ${usd(minLiability)}`);
if (attestation.coverage.cargo < minCargo) problems.push(`cargo coverage is below ${usd(minCargo)}`);
if (attestation.coverage.expiresAt < through) problems.push(`coverage ends before ${a.through}`);
if (problems.length) {
  console.log(`Can't prove this request: ${problems.join('; ')}. Nothing was sent.`);
  process.exit(2);
}

const deployment = readDeployment();
const { providers, close } = await openSession();
try {
  const stateId = `carrier-${a.carrier}`;
  const privateState: CoveragePrivateState = { secretKey: Uint8Array.from(Buffer.from(carrier.secretKey, 'hex')), attestation };
  await providers.privateStateProvider.forContract(deployment.contractAddress).set(stateId, privateState);

  logger.info(`Proving coverage for "${a.request}" (this builds a zero-knowledge proof; give it a minute)...`);
  await submitCallTx(providers, {
    compiledContract: CompiledCoverageContract,
    contractAddress: deployment.contractAddress,
    privateStateId: stateId,
    circuitId: 'proveCoverage',
    args: [requestId, minLiability, minCargo, through],
  } as any);

  const state = ledger(ledgerState(await providers.publicDataProvider.queryContractState(deployment.contractAddress)));
  const p = state.proofs.lookup(requestId);
  logger.info(`Proved on Midnight: DOT ${p.dot} has at least ${usd(p.minLiability)} liability and ${usd(p.minCargo)} cargo through ${a.through}.`);
  logger.info(`The broker can check it with: npm run check -- "${a.request}"`);
} finally {
  await close();
}
process.exit(0);
