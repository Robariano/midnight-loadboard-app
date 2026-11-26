// Simulator tests for the Nightlane driver proof ("this driver is on the
// policy"). Runs the compiled contract in memory: every assert in the circuits
// is enforced exactly as it would be when proving.
//
//   npm run compile:driver:fast && npm run test:driver
import * as crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {
  createConstructorContext,
  createCircuitContext,
  sampleContractAddress,
  ecMulGenerator,
  encodeCoinPublicKey,
} from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import { Contract, ledger, pureCircuits } from '../contract/managed/driver-proof/contract/index.js';

const JUBJUB_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;
const reduce = (x) => ((x % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;
const randomScalar = () => BigInt('0x' + crypto.randomBytes(32).toString('hex')) % JUBJUB_ORDER;
const randomField = () => BigInt('0x' + crypto.randomBytes(31).toString('hex'));
const DAY = 86_400;
const now = () => Math.floor(Date.now() / 1000);

// A driver name as the circuit sees it: upper case, single spaces, ASCII,
// zero-padded to 32 bytes.
export function nameBytes(name) {
  const v = String(name).normalize('NFKD').replace(/[^\x20-\x7e]/g, '').trim().replace(/\s+/g, ' ').toUpperCase();
  if (v.length < 2 || v.length > 32) throw new Error(`Driver name must be 2 to 32 characters: ${name}`);
  const out = new Uint8Array(32);
  out.set(Buffer.from(v, 'ascii'));
  return out;
}

function attestorKeyPair() {
  const sk = randomScalar();
  return { sk, pk: ecMulGenerator(sk) };
}
function signAttestation(attestorSk, att, nonce, carrierPk) {
  const sk = reduce(attestorSk);
  const pk = ecMulGenerator(sk);
  const msg = pureCircuits.attestationMessage(att, nonce, carrierPk);
  const k = randomScalar();
  const R = ecMulGenerator(k);
  const c = pureCircuits.driverChallenge(R.x, R.y, pk.x, pk.y, msg) % TWO_248;
  return { announcement: R, response: reduce(k + c * sk) };
}

const witnesses = {
  getSecretKey: ({ privateState }) => [privateState, privateState.secretKey],
  getDriverAttestation: ({ privateState }) => {
    const a = privateState.attestation;
    if (!a) throw new Error('No driver attestation in private state');
    return [privateState, [a.driver, a.nonce, a.signature, a.attestorId]];
  },
  getSchnorrReduction: ({ privateState }, challengeHash) => [privateState, [challengeHash / TWO_248, challengeHash % TWO_248]],
};

class Sim {
  static async create(adminSecret) {
    const s = new Sim();
    s.contract = new Contract(witnesses);
    s.address = sampleContractAddress();
    s.coinPk = encodeCoinPublicKey(Buffer.from('nightlane-admin').toString('hex').padStart(64, '0'));
    const r = await s.contract.initialState(createConstructorContext({ secretKey: adminSecret, attestation: null }, s.coinPk));
    s.state = r.currentContractState.data;
    s.zswap = r.currentZswapLocalState;
    return s;
  }
  async run(name, privateState, call) {
    const ctx = createCircuitContext({
      circuitId: name,
      contractAddress: this.address,
      coinPublicKeyOrZswapState: this.zswap,
      contractState: this.state,
      privateState,
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
      proveDriver: (req, nC, through) => this.run('proveDriver', ps, (x) => c.proveDriver(x, req, nC, through)),
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

// ---- Setup: Nightlane attests that one driver (sample name) is on a
// carrier's policy for a year. Sample data only.
const adminSecret = secret();
const nightlane = attestorKeyPair();
const carrierSecret = secret();
const carrierPk = pureCircuits.deriveCarrierPublicKey(carrierSecret);
const VIN = 'Pat Sample';
const OTHER_VIN = 'Someone Else';
const driver = { dot: 3349902n, name: nameBytes(VIN), expiresAt: BigInt(now() + 365 * DAY) };
const nonce = randomField();
const attestation = { driver, nonce, signature: signAttestation(nightlane.sk, driver, nonce, carrierPk), attestorId: 1n };
const carrierState = { secretKey: carrierSecret, attestation };
const adminState = { secretKey: adminSecret, attestation: null };
const inAWeek = BigInt(now() + 7 * DAY);
const vinC = (v) => pureCircuits.nameCommitment(nameBytes(v));

async function freshSim() {
  const sim = await Sim.create(adminSecret);
  await sim.as(adminState).registerAttestor(1n, nightlane.pk);
  return sim;
}

console.log('Nightlane driver proof');

await test('carrier proves the attested driver is on the policy through next week', async () => {
  const sim = await freshSim();
  const l = await sim.as(carrierState).proveDriver(bytes('broker-1:load-1'), vinC(VIN), inAWeek);
  const p = l.proofs.lookup(bytes('broker-1:load-1'));
  assert.equal(p.dot, 3349902n);
  assert.deepEqual(Buffer.from(p.nameCommitment), Buffer.from(vinC(VIN)));
  assert.equal(p.coveredThrough, inAWeek);
  assert.equal(p.attestorId, 1n);
});

await test('name case and extra spaces give the same commitment', async () => {
  assert.deepEqual(Buffer.from(vinC('  pat   sample ')), Buffer.from(vinC(VIN)));
});

await test('the name itself and the real expiry never reach the public ledger', async () => {
  const sim = await freshSim();
  await sim.as(carrierState).proveDriver(bytes('r2'), vinC(VIN), inAWeek);
  const p = ledger(sim.state).proofs.lookup(bytes('r2'));
  const published = JSON.stringify(p, (_, v) => (typeof v === 'bigint' ? v.toString() : v instanceof Uint8Array ? Buffer.from(v).toString('hex') : v));
  assert.ok(!published.includes(Buffer.from(VIN.toUpperCase(), 'ascii').toString('hex')), 'raw name was published');
  assert.ok(!published.includes(String(driver.expiresAt)), 'real expiry was published');
});

await test('a driver who is NOT on the policy cannot be proven (the "no" answer)', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).proveDriver(bytes('r'), vinC(OTHER_VIN), inAWeek), 'not the one attested');
});

await test('rejects when coverage ends before the requested date', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).proveDriver(bytes('r'), vinC(VIN), BigInt(now() + 400 * DAY)), 'Coverage ends before');
});

await test('rejects a requested date that is already in the past', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).proveDriver(bytes('r'), vinC(VIN), BigInt(now() - DAY)), 'already in the past');
});

await test("a stolen attestation is useless without the carrier's secret key", async () => {
  const sim = await freshSim();
  await rejects(sim.as({ secretKey: secret(), attestation }).proveDriver(bytes('r'), vinC(VIN), inAWeek), 'Invalid attestation signature');
});

await test('a carrier cannot swap in a different driver', async () => {
  const sim = await freshSim();
  const tampered = { ...carrierState, attestation: { ...attestation, driver: { ...driver, name: nameBytes(OTHER_VIN) } } };
  await rejects(sim.as(tampered).proveDriver(bytes('r'), vinC(OTHER_VIN), inAWeek), 'Invalid attestation signature');
});

await test('rejects an attestation signed by an unregistered attestor', async () => {
  const sim = await freshSim();
  const fake = attestorKeyPair();
  const forged = { ...attestation, signature: signAttestation(fake.sk, driver, nonce, carrierPk), attestorId: 2n };
  await rejects(sim.as({ ...carrierState, attestation: forged }).proveDriver(bytes('r'), vinC(VIN), inAWeek), 'Attestor not registered');
});

await test('a revoked attestation (driver removed from policy) can no longer prove anything', async () => {
  const sim = await freshSim();
  await sim.as(carrierState).proveDriver(bytes('before'), vinC(VIN), inAWeek);
  await sim.as(adminState).revokeAttestation(pureCircuits.attestationId(nonce));
  await rejects(sim.as(carrierState).proveDriver(bytes('after'), vinC(VIN), inAWeek), 'revoked');
});

await test('the same request can only be answered once', async () => {
  const sim = await freshSim();
  await sim.as(carrierState).proveDriver(bytes('once'), vinC(VIN), inAWeek);
  await rejects(sim.as(carrierState).proveDriver(bytes('once'), vinC(VIN), inAWeek), 'already answered');
});

await test('only the admin can register attestors or revoke', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).registerAttestor(9n, nightlane.pk), 'Only admin');
  await rejects(sim.as(carrierState).revokeAttestation(pureCircuits.attestationId(nonce)), 'Only admin');
});

console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`);
