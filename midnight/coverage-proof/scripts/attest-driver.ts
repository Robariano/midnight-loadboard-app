// Nightlane signs "this driver is on the carrier's policy", after confirming
// it with the carrier's insurance agent. Runs off-chain: no transaction, no fees.
//
//   npm run attest:driver -- --carrier galvanized --dot 8835717 \
//     --name "Christopher Galvan" --expires 2027-07-23 --network=mainnet
//
// Writes attestations/driver-<dot>-<NAME>.json. Private (gitignored).
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { ecMulGenerator } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import { driverPureCircuits as pc, nameBytes, normalizeDriverName, type DriverAttestation } from '../contract/driver.js';
import { ROOT, NETWORK, endOfDay, loadSecrets, toJson } from '../src/common.js';

const JUBJUB_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;
const reduce = (x: bigint) => ((x % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;
const randomScalar = () => BigInt('0x' + randomBytes(32).toString('hex')) % JUBJUB_ORDER;

const { values: a } = parseArgs({
  options: { carrier: { type: 'string' }, dot: { type: 'string' }, name: { type: 'string' }, expires: { type: 'string' }, network: { type: 'string' } },
});
for (const k of ['carrier', 'dot', 'name', 'expires'] as const) {
  if (!a[k]) {
    console.error(`Missing --${k}.\nUsage: npm run attest:driver -- --carrier <carrier> --dot <DOT> --name "<driver name>" --expires YYYY-MM-DD`);
    process.exit(1);
  }
}

loadSecrets();
const depFile = `${ROOT}deployments/${NETWORK}-driver.json`;
if (!existsSync(depFile)) throw new Error(`deployments/${NETWORK}-driver.json not found. Run npm run deploy:driver -- --network=${NETWORK} first.`);
const deployment = JSON.parse(readFileSync(depFile, 'utf8'));
const attestorSk = reduce(BigInt(process.env['NIGHTLANE_ATTESTOR_SK']!));
const attestorPk = ecMulGenerator(attestorSk);
if (attestorPk.x.toString() !== deployment.attestor.publicKey.x || attestorPk.y.toString() !== deployment.attestor.publicKey.y) {
  throw new Error('NIGHTLANE_ATTESTOR_SK does not match the attestor registered on the driver contract.');
}

const carrierFile = `${ROOT}carriers/${a.carrier}.json`;
const carrierPkHex = existsSync(carrierFile) ? JSON.parse(readFileSync(carrierFile, 'utf8')).publicKey : a.carrier!;
if (!/^[0-9a-f]{64}$/i.test(carrierPkHex)) throw new Error('--carrier must be a carrier name from carriers/ or a 64-character public key.');
const carrierPk = Uint8Array.from(Buffer.from(carrierPkHex, 'hex'));

const dot = BigInt(a.dot!.replace(/\D/g, ''));
const name = nameBytes(a.name!);
const driver = { dot, name, expiresAt: endOfDay(a.expires!) };
if (driver.expiresAt * 1000n <= BigInt(Date.now())) throw new Error('That policy is already expired.');
const nonce = BigInt('0x' + randomBytes(31).toString('hex'));

const msg = pc.attestationMessage(driver, nonce, carrierPk);
const k = randomScalar();
const R = ecMulGenerator(k);
const c = pc.driverChallenge(R.x, R.y, attestorPk.x, attestorPk.y, msg) % TWO_248;
const attestation: DriverAttestation = {
  driver, nonce, signature: { announcement: { x: R.x, y: R.y }, response: reduce(k + c * attestorSk) }, attestorId: BigInt(deployment.attestor.id),
};

mkdirSync(`${ROOT}attestations`, { recursive: true });
const nameText = normalizeDriverName(a.name!);
const out = `attestations/driver-${dot}-${nameText.replace(/[^A-Z0-9]+/g, '_')}.json`;
writeFileSync(`${ROOT}${out}`, toJson({ carrierPublicKey: carrierPkHex, kind: 'driver', attestation }) + '\n', { mode: 0o600 });
console.log(`Signed: ${nameText} is a driver on DOT ${dot}'s policy through ${a.expires}.`);
console.log(`Name commitment (what brokers check against): ${Buffer.from(pc.nameCommitment(name)).toString('hex')}`);
console.log(`Saved ${out}. Private: keep it off any public place.`);
console.log(`Attestation id (to revoke if the driver comes off the policy): ${Buffer.from(pc.attestationId(nonce)).toString('hex')}`);
