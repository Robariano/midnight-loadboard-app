// Simulator tests for the Nightlane coverage proof. Runs the compiled contract
// in memory (no network, no proof server): every assert in the circuits is
// enforced exactly as it would be when proving.
//
//   npm run compile:fast && npm test
import * as crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {
  createConstructorContext,
  createCircuitContext,
  sampleContractAddress,
  ecMulGenerator,
  encodeCoinPublicKey,
} from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import { Contract, ledger, pureCircuits } from '../contract/managed/coverage-proof/contract/index.js';

const JUBJUB_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;
const reduce = (x) => ((x % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;
const randomScalar = () => BigInt('0x' + crypto.randomBytes(32).toString('hex')) % JUBJUB_ORDER;
const randomField = () => BigInt('0x' + crypto.randomBytes(31).toString('hex'));
const DAY = 86_400;
const now = () => Math.floor(Date.now() / 1000);

// ---- Nightlane's off-chain attestor (what the server would run) ----
function attestorKeyPair() {
  const sk = randomScalar();
  return { sk, pk: ecMulGenerator(sk) };
}
function signAttestation(attestorSk, coverage, nonce, carrierPk) {
  const sk = reduce(attestorSk);
  const pk = ecMulGenerator(sk);
  const msg = pureCircuits.attestationMessage(coverage, nonce, carrierPk);
  const k = randomScalar();
  const R = ecMulGenerator(k);
  const c = pureCircuits.coverageChallenge(R.x, R.y, pk.x, pk.y, msg) % TWO_248;
  return { announcement: R, response: reduce(k + c * sk) };
}

// ---- Witnesses: what the carrier's (or admin's) own device supplies ----
const witnesses = {
  getSecretKey: ({ privateState }) => [privateState, privateState.secretKey],
  getCoverageAttestation: ({ privateState }) => {
    const a = privateState.attestation;
    if (!a) throw new Error('No coverage attestation in private state');
    return [privateState, [a.coverage, a.nonce, a.signature, a.attestorId]];
  },
  getSchnorrReduction: ({ privateState }, challengeHash) => [privateState, [challengeHash / TWO_248, challengeHash % TWO_248]],
};

class Sim {
  static async create(adminSecret) {
    const s = new Sim();
    s.contract = new Contract(witnesses);
    s.address = sampleContractAddress();
    s.coinPk = encodeCoinPublicKey(Buffer.from('nightlane-admin').toString('hex').padStart(64, '0'));
    s.privateState = { secretKey: adminSecret, attestation: null };
    const r = await s.contract.initialState(createConstructorContext(s.privateState, s.coinPk));
    s.state = r.currentContractState.data;
    s.zswap = r.currentZswapLocalState;
    return s;
  }
  async run(name, privateState, call, time) {
    const ctx = createCircuitContext({
      circuitId: name,
      contractAddress: this.address,
      coinPublicKeyOrZswapState: this.zswap,
      contractState: this.state,
      privateState,
      ...(time !== undefined ? { time } : {}),
    });
    const { context } = await call(ctx);
    this.state = context.callContext.currentQueryContext.state;
    this.zswap = context.callContext.currentZswapLocalState ?? this.zswap;
    return ledger(this.state);
  }
  as(ps) {
    const c = this.contract.impureCircuits;
    return {
      registerAttestor: (id, pk) => this.run('registerAttestor', ps, (x) => c.registerAttestor(x, id, pk)),
      revokeAttestation: (id) => this.run('revokeAttestation', ps, (x) => c.revokeAttestation(x, id)),
      proveCoverage: (req, minL, minC, through, time) =>
        this.run('proveCoverage', ps, (x) => c.proveCoverage(x, req, minL, minC, through), time),
    };
  }
}

const bytes = (s) => new Uint8Array(crypto.createHash('sha256').update(s).digest());
const secret = () => new Uint8Array(crypto.randomBytes(32));

let passed = 0;
async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    console.log(`  FAIL ${name}\n       ${e.message}`);
    process.exitCode = 1;
  }
}
async function rejects(promise, text) {
  await assert.rejects(promise, (e) => {
    assert.match(String(e.message), new RegExp(text), `expected "${text}", got "${e.message}"`);
    return true;
  });
}

// ---- Setup: Nightlane deploys, registers itself as attestor 1, and attests
// a carrier with $2,000,000 liability and $150,000 cargo, good for a year.
const adminSecret = secret();
const nightlane = attestorKeyPair();
const carrierSecret = secret();
const carrierPk = pureCircuits.deriveCarrierPublicKey(carrierSecret);
const coverage = { dot: 3349902n, liability: 2_000_000n, cargo: 150_000n, expiresAt: BigInt(now() + 365 * DAY) };
const nonce = randomField();
const attestation = { coverage, nonce, signature: signAttestation(nightlane.sk, coverage, nonce, carrierPk), attestorId: 1n };
const carrierState = { secretKey: carrierSecret, attestation };
const adminState = { secretKey: adminSecret, attestation: null };
const inAWeek = BigInt(now() + 7 * DAY);

async function freshSim() {
  const sim = await Sim.create(adminSecret);
  await sim.as(adminState).registerAttestor(1n, nightlane.pk);
  return sim;
}

console.log('Nightlane coverage proof');

await test('carrier proves $1M liability / $100K cargo through next week', async () => {
  const sim = await freshSim();
  const l = await sim.as(carrierState).proveCoverage(bytes('broker-123:load-1'), 1_000_000n, 100_000n, inAWeek);
  const p = l.proofs.lookup(bytes('broker-123:load-1'));
  assert.equal(p.dot, 3349902n);
  assert.equal(p.minLiability, 1_000_000n);
  assert.equal(p.minCargo, 100_000n);
  assert.equal(p.coveredThrough, inAWeek);
  assert.equal(p.attestorId, 1n);
});

await test('the real limits and expiry never reach the public ledger', async () => {
  const sim = await freshSim();
  await sim.as(carrierState).proveCoverage(bytes('broker-123:load-2'), 1_000_000n, 100_000n, inAWeek);
  const l = ledger(sim.state);
  const p = l.proofs.lookup(bytes('broker-123:load-2'));
  const published = Object.values(p).map(String);
  for (const secretValue of [coverage.liability, coverage.cargo, coverage.expiresAt]) {
    assert.ok(!published.includes(String(secretValue)), `${secretValue} was published`);
  }
});

await test('rejects when liability is below what the broker asked for', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).proveCoverage(bytes('r'), 3_000_000n, 100_000n, inAWeek), 'Liability below');
});

await test('rejects when cargo coverage is below what the broker asked for', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).proveCoverage(bytes('r'), 1_000_000n, 250_000n, inAWeek), 'Cargo coverage below');
});

await test('rejects when coverage ends before the requested date', async () => {
  const sim = await freshSim();
  const later = BigInt(now() + 400 * DAY);
  await rejects(sim.as(carrierState).proveCoverage(bytes('r'), 1_000_000n, 100_000n, later), 'Coverage ends before');
});

await test('rejects a requested date that is already in the past', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).proveCoverage(bytes('r'), 1_000_000n, 100_000n, BigInt(now() - DAY)), 'already in the past');
});

await test('a stolen attestation is useless without the carrier\'s secret key', async () => {
  const sim = await freshSim();
  const thief = { secretKey: secret(), attestation };
  await rejects(sim.as(thief).proveCoverage(bytes('r'), 1_000_000n, 100_000n, inAWeek), 'Invalid attestation signature');
});

await test('rejects a carrier who edits their own limits upward', async () => {
  const sim = await freshSim();
  const tampered = { ...carrierState, attestation: { ...attestation, coverage: { ...coverage, liability: 5_000_000n } } };
  await rejects(sim.as(tampered).proveCoverage(bytes('r'), 4_000_000n, 100_000n, inAWeek), 'Invalid attestation signature');
});

await test('rejects an attestation signed by an unregistered attestor', async () => {
  const sim = await freshSim();
  const fake = attestorKeyPair();
  const forged = { ...attestation, signature: signAttestation(fake.sk, coverage, nonce, carrierPk), attestorId: 2n };
  await rejects(sim.as({ ...carrierState, attestation: forged }).proveCoverage(bytes('r'), 1_000_000n, 100_000n, inAWeek), 'Attestor not registered');
});

await test('a revoked attestation (policy cancelled) can no longer prove anything', async () => {
  const sim = await freshSim();
  await sim.as(carrierState).proveCoverage(bytes('before'), 1_000_000n, 100_000n, inAWeek);
  await sim.as(adminState).revokeAttestation(pureCircuits.attestationId(nonce));
  await rejects(sim.as(carrierState).proveCoverage(bytes('after'), 1_000_000n, 100_000n, inAWeek), 'revoked');
});

await test('the same request can only be answered once', async () => {
  const sim = await freshSim();
  await sim.as(carrierState).proveCoverage(bytes('once'), 1_000_000n, 100_000n, inAWeek);
  await rejects(sim.as(carrierState).proveCoverage(bytes('once'), 1_000_000n, 100_000n, inAWeek), 'already answered');
});

await test('only Nightlane (the admin) can register attestors or revoke', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).registerAttestor(9n, nightlane.pk), 'Only admin');
  await rejects(sim.as(carrierState).revokeAttestation(pureCircuits.attestationId(nonce)), 'Only admin');
});

console.log(`\n${passed} passed`);
