// A carrier answers "is this van covered?" on Midnight.
//
//   npm run prove:vehicle -- --carrier elitegc --attestation attestations/vehicle-<file>.json \
//     --request "MC 123456 load 4471" --vin 1FTYR2CM5JKA12345 --through 2026-12-05 --network=mainnet
//
// Only the answer goes on-chain: this DOT's van (by VIN commitment) is covered
// through this date. Nightlane's wallet pays the fee.
import { existsSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledVehicleContract, vehicleLedger, vehiclePureCircuits as pc, vehicleZkConfigPath, vinBytes, type VehiclePrivateState } from '../contract/vehicle.js';
import { ROOT, NETWORK, endOfDay, logger, requestIdOf, reviveBigints } from '../src/common.js';
import { ledgerState } from '../src/providers.js';
import { openSession } from '../src/session.js';

const { values: a } = parseArgs({
  options: {
    carrier: { type: 'string' }, attestation: { type: 'string' }, request: { type: 'string' },
    vin: { type: 'string' }, through: { type: 'string' }, network: { type: 'string' },
  },
});
for (const k of ['carrier', 'attestation', 'request', 'vin', 'through'] as const) {
  if (!a[k]) {
    console.error(`Missing --${k}.\nUsage: npm run prove:vehicle -- --carrier <name> --attestation <file> --request "<text>" --vin <VIN> --through YYYY-MM-DD`);
    process.exit(1);
  }
}

const carrier = JSON.parse(readFileSync(`${ROOT}carriers/${a.carrier}.json`, 'utf8'));
const file = JSON.parse(readFileSync(`${ROOT}${a.attestation!.replace(/^\.\//, '')}`, 'utf8'));
if (file.kind !== 'vehicle') throw new Error('That file is not a vehicle attestation.');
const { carrierPublicKey, attestation: raw } = reviveBigints(file);
if (carrierPublicKey !== carrier.publicKey) throw new Error(`That attestation was issued to a different carrier key than "${a.carrier}".`);
// toJson stored the VIN bytes as hex; turn them back into bytes.
const attestation = { ...raw, vehicle: { ...raw.vehicle, vin: Uint8Array.from(Buffer.from(raw.vehicle.vin, 'hex')) } };

const requested = vinBytes(a.vin!);
const through = endOfDay(a.through!);
const requestId = requestIdOf(a.request!);

// Plain-English "no" before spending a proof.
if (!Buffer.from(attestation.vehicle.vin).equals(Buffer.from(requested))) {
  console.log(`Can't prove this request: that VIN is not the van on this attestation. Nothing was sent.`);
  process.exit(2);
}
if (attestation.vehicle.expiresAt < through) {
  console.log(`Can't prove this request: coverage ends before ${a.through}. Nothing was sent.`);
  process.exit(2);
}

const depFile = `${ROOT}deployments/${NETWORK}-vehicle.json`;
if (!existsSync(depFile)) throw new Error(`deployments/${NETWORK}-vehicle.json not found. Deploy the vehicle contract first.`);
const { contractAddress } = JSON.parse(readFileSync(depFile, 'utf8'));
const { providers, close } = await openSession(vehicleZkConfigPath);
try {
  const stateId = `vehicle-carrier-${a.carrier}`;
  const privateState: VehiclePrivateState = { secretKey: Uint8Array.from(Buffer.from(carrier.secretKey, 'hex')), attestation };
  await (providers.privateStateProvider as any).forContract(contractAddress).set(stateId, privateState);

  logger.info(`Proving the van is covered for "${a.request}" (building a zero-knowledge proof; give it a minute)...`);
  await submitCallTx(providers as any, {
    compiledContract: CompiledVehicleContract,
    contractAddress,
    privateStateId: stateId,
    circuitId: 'proveVehicle',
    args: [requestId, pc.vinCommitment(requested), through],
  } as any);

  const state = vehicleLedger(ledgerState(await providers.publicDataProvider.queryContractState(contractAddress)));
  const p = state.proofs.lookup(requestId);
  logger.info(`Proved on Midnight: DOT ${p.dot}'s van ...${a.vin!.slice(-6).toUpperCase()} is on the policy through ${a.through}.`);
} finally {
  await close();
}
process.exit(0);
