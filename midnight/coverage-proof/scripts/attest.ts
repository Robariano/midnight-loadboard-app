// Nightlane signs a carrier's coverage, after confirming it with the carrier's
// insurance agent. Runs off-chain: no transaction, no fees.
//
//   npm run attest -- --carrier <name or public key hex> --dot 1234567 \
//     --liability 1000000 --cargo 100000 --expires 2027-06-30
//
// Writes attestations/<dot>-<date>.json for the carrier. That file holds the
// real limits, so it is private (gitignored): hand it to the carrier only.
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { ecMulGenerator } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import { pureCircuits } from '../contract/index.js';
import type { CoverageAttestation } from '../contract/witnesses.js';
import { ROOT, dollars, endOfDay, loadSecrets, readDeployment, toJson, usd } from '../src/common.js';

const JUBJUB_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;
const reduce = (x: bigint) => ((x % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;
const randomScalar = () => BigInt('0x' + randomBytes(32).toString('hex')) % JUBJUB_ORDER;

const { values: a } = parseArgs({
  options: {
    carrier: { type: 'string' }, dot: { type: 'string' }, liability: { type: 'string' },
    cargo: { type: 'string' }, expires: { type: 'string' }, network: { type: 'string' },
  },
});
for (const k of ['carrier', 'dot', 'liability', 'cargo', 'expires'] as const) {
  if (!a[k]) {
    console.error(`Missing --${k}.\nUsage: npm run attest -- --carrier <name> --dot <DOT> --liability <$> --cargo <$> --expires YYYY-MM-DD`);
    process.exit(1);
  }
}

loadSecrets();
const deployment = readDeployment();
const attestorSk = reduce(BigInt(process.env['NIGHTLANE_ATTESTOR_SK']!));
const attestorPk = ecMulGenerator(attestorSk);
if (attestorPk.x.toString() !== deployment.attestor.publicKey.x || attestorPk.y.toString() !== deployment.attestor.publicKey.y) {
  throw new Error('NIGHTLANE_ATTESTOR_SK does not match the attestor registered on the contract.');
}

const carrierFile = `${ROOT}carriers/${a.carrier}.json`;
const carrierPkHex = existsSync(carrierFile) ? JSON.parse(readFileSync(carrierFile, 'utf8')).publicKey : a.carrier!;
if (!/^[0-9a-f]{64}$/i.test(carrierPkHex)) throw new Error('--carrier must be a carrier name from carriers/ or a 64-character public key.');
const carrierPk = Uint8Array.from(Buffer.from(carrierPkHex, 'hex'));

const dot = BigInt(a.dot!.replace(/\D/g, ''));
const coverage = { dot, liability: dollars(a.liability!), cargo: dollars(a.cargo!), expiresAt: endOfDay(a.expires!) };
if (coverage.expiresAt * 1000n <= BigInt(Date.now())) throw new Error('That policy is already expired.');
const nonce = BigInt('0x' + randomBytes(31).toString('hex'));

const msg = pureCircuits.attestationMessage(coverage, nonce, carrierPk);
const k = randomScalar();
const R = ecMulGenerator(k);
const c = pureCircuits.coverageChallenge(R.x, R.y, attestorPk.x, attestorPk.y, msg) % TWO_248;
const attestation: CoverageAttestation = {
  coverage, nonce, signature: { announcement: { x: R.x, y: R.y }, response: reduce(k + c * attestorSk) }, attestorId: BigInt(deployment.attestor.id),
};

mkdirSync(`${ROOT}attestations`, { recursive: true });
const out = `attestations/${dot}-${a.expires}.json`;
writeFileSync(`${ROOT}${out}`, toJson({ carrierPublicKey: carrierPkHex, attestation }) + '\n', { mode: 0o600 });
const attId = Buffer.from(pureCircuits.attestationId(nonce)).toString('hex');
console.log(`Signed coverage for DOT ${dot}: liability ${usd(coverage.liability)}, cargo ${usd(coverage.cargo)}, through ${a.expires}.`);
console.log(`Saved ${out}. Private: give it to the carrier only.`);
console.log(`Attestation id (to revoke it later if the policy is cancelled): ${attId}`);
