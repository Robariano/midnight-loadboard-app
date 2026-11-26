// Nightlane signs "this van is on the carrier's policy", after confirming it
// with the carrier's insurance agent. Runs off-chain: no transaction, no fees.
//
//   npm run attest:vehicle -- --carrier elitegc --dot 4523542 \
//     --vin 1FTYR2CM5JKA12345 --expires 2027-09-08 --network=mainnet
//
// Writes attestations/vehicle-<dot>-<last 6 of VIN>.json. Private (gitignored):
// it stays with the carrier (or Nightlane's worker acting for the carrier).
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { ecMulGenerator } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import { vehiclePureCircuits as pc, vinBytes, type VehicleAttestation } from '../contract/vehicle.js';
import { ROOT, NETWORK, endOfDay, loadSecrets, toJson } from '../src/common.js';

const JUBJUB_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;
const reduce = (x: bigint) => ((x % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;
const randomScalar = () => BigInt('0x' + randomBytes(32).toString('hex')) % JUBJUB_ORDER;

const { values: a } = parseArgs({
  options: { carrier: { type: 'string' }, dot: { type: 'string' }, vin: { type: 'string' }, expires: { type: 'string' }, network: { type: 'string' } },
});
for (const k of ['carrier', 'dot', 'vin', 'expires'] as const) {
  if (!a[k]) {
    console.error(`Missing --${k}.\nUsage: npm run attest:vehicle -- --carrier <name> --dot <DOT> --vin <17-char VIN> --expires YYYY-MM-DD`);
    process.exit(1);
  }
}

loadSecrets();
const depFile = `${ROOT}deployments/${NETWORK}-vehicle.json`;
if (!existsSync(depFile)) throw new Error(`deployments/${NETWORK}-vehicle.json not found. Run npm run deploy:vehicle -- --network=${NETWORK} first.`);
const deployment = JSON.parse(readFileSync(depFile, 'utf8'));
const attestorSk = reduce(BigInt(process.env['NIGHTLANE_ATTESTOR_SK']!));
const attestorPk = ecMulGenerator(attestorSk);
if (attestorPk.x.toString() !== deployment.attestor.publicKey.x || attestorPk.y.toString() !== deployment.attestor.publicKey.y) {
  throw new Error('NIGHTLANE_ATTESTOR_SK does not match the attestor registered on the vehicle contract.');
}

const carrierFile = `${ROOT}carriers/${a.carrier}.json`;
const carrierPkHex = existsSync(carrierFile) ? JSON.parse(readFileSync(carrierFile, 'utf8')).publicKey : a.carrier!;
if (!/^[0-9a-f]{64}$/i.test(carrierPkHex)) throw new Error('--carrier must be a carrier name from carriers/ or a 64-character public key.');
const carrierPk = Uint8Array.from(Buffer.from(carrierPkHex, 'hex'));

const dot = BigInt(a.dot!.replace(/\D/g, ''));
const vin = vinBytes(a.vin!);
const vehicle = { dot, vin, expiresAt: endOfDay(a.expires!) };
if (vehicle.expiresAt * 1000n <= BigInt(Date.now())) throw new Error('That policy is already expired.');
const nonce = BigInt('0x' + randomBytes(31).toString('hex'));

const msg = pc.attestationMessage(vehicle, nonce, carrierPk);
const k = randomScalar();
const R = ecMulGenerator(k);
const c = pc.vehicleChallenge(R.x, R.y, attestorPk.x, attestorPk.y, msg) % TWO_248;
const attestation: VehicleAttestation = {
  vehicle, nonce, signature: { announcement: { x: R.x, y: R.y }, response: reduce(k + c * attestorSk) }, attestorId: BigInt(deployment.attestor.id),
};

mkdirSync(`${ROOT}attestations`, { recursive: true });
const vinText = Buffer.from(vin).toString('ascii');
const out = `attestations/vehicle-${dot}-${vinText.slice(-6)}.json`;
writeFileSync(`${ROOT}${out}`, toJson({ carrierPublicKey: carrierPkHex, kind: 'vehicle', attestation }) + '\n', { mode: 0o600 });
console.log(`Signed: VIN ...${vinText.slice(-6)} is on DOT ${dot}'s policy through ${a.expires}.`);
console.log(`VIN commitment (what brokers check against): ${Buffer.from(pc.vinCommitment(vin)).toString('hex')}`);
console.log(`Saved ${out}. Private: keep it off any public place.`);
console.log(`Attestation id (to revoke if the van comes off the policy): ${Buffer.from(pc.attestationId(nonce)).toString('hex')}`);
