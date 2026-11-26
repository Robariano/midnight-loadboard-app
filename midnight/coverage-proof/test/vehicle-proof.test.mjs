// Simulator tests for the Nightlane vehicle proof ("this van is on the
// policy"). Runs the compiled contract in memory: every assert in the circuits
// is enforced exactly as it would be when proving.
//
//   npm run compile:vehicle:fast && npm run test:vehicle
import * as crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {
  createConstructorContext,
  createCircuitContext,
  sampleContractAddress,
  ecMulGenerator,
  encodeCoinPublicKey,
} from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import { Contract, ledger, pureCircuits } from '../contract/managed/vehicle-proof/contract/index.js';

const JUBJUB_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;
const reduce = (x) => ((x % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;
const randomScalar = () => BigInt('0x' + crypto.randomBytes(32).toString('hex')) % JUBJUB_ORDER;
const randomField = () => BigInt('0x' + crypto.randomBytes(31).toString('hex'));
const DAY = 86_400;
const now = () => Math.floor(Date.now() / 1000);

// A VIN as the circuit sees it: 17 upper-case ASCII bytes.
export function vinBytes(vin) {
  const v = String(vin).trim().toUpperCase();
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) throw new Error(`Not a valid 17-character VIN: ${vin}`);
  return new Uint8Array(Buffer.from(v, 'ascii'));
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
  const c = pureCircuits.vehicleChallenge(R.x, R.y, pk.x, pk.y, msg) % TWO_248;
  return { announcement: R, response: reduce(k + c * sk) };
}

const witnesses = {
  getSecretKey: ({ privateState }) => [privateState, privateState.secretKey],
  getVehicleAttestation: ({ privateState }) => {
    const a = privateState.attestation;
    if (!a) throw new Error('No vehicle attestation in private state');
    return [privateState, [a.vehicle, a.nonce, a.signature, a.attestorId]];
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
      proveVehicle: (req, vinC, through) => this.run('proveVehicle', ps, (x) => c.proveVehicle(x, req, vinC, through)),
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

// ---- Setup: Nightlane attests that one van (sample VIN) is on a carrier's
// policy for a year. Sample data only.
const adminSecret = secret();
const nightlane = attestorKeyPair();
const carrierSecret = secret();
const carrierPk = pureCircuits.deriveCarrierPublicKey(carrierSecret);
const VIN = '1FTYR2CM5JKA12345';
const OTHER_VIN = '3C6TRVDG0PE500000';
const vehicle = { dot: 3349902n, vin: vinBytes(VIN), expiresAt: BigInt(now() + 365 * DAY) };
const nonce = randomField();
const attestation = { vehicle, nonce, signature: signAttestation(nightlane.sk, vehicle, nonce, carrierPk), attestorId: 1n };
const carrierState = { secretKey: carrierSecret, attestation };
const adminState = { secretKey: adminSecret, attestation: null };
const inAWeek = BigInt(now() + 7 * DAY);
const vinC = (v) => pureCircuits.vinCommitment(vinBytes(v));

async function freshSim() {
  const sim = await Sim.create(adminSecret);
  await sim.as(adminState).registerAttestor(1n, nightlane.pk);
  return sim;
}

console.log('Nightlane vehicle proof');

await test('carrier proves the attested van is covered through next week', async () => {
  const sim = await freshSim();
  const l = await sim.as(carrierState).proveVehicle(bytes('broker-1:load-1'), vinC(VIN), inAWeek);
  const p = l.proofs.lookup(bytes('broker-1:load-1'));
  assert.equal(p.dot, 3349902n);
  assert.deepEqual(Buffer.from(p.vinCommitment), Buffer.from(vinC(VIN)));
  assert.equal(p.coveredThrough, inAWeek);
  assert.equal(p.attestorId, 1n);
});

await test('lower-case VIN gives the same commitment', async () => {
  assert.deepEqual(Buffer.from(vinC(VIN.toLowerCase())), Buffer.from(vinC(VIN)));
});

await test('the VIN itself and the real expiry never reach the public ledger', async () => {
  const sim = await freshSim();
  await sim.as(carrierState).proveVehicle(bytes('r2'), vinC(VIN), inAWeek);
  const p = ledger(sim.state).proofs.lookup(bytes('r2'));
  const published = JSON.stringify(p, (_, v) => (typeof v === 'bigint' ? v.toString() : v instanceof Uint8Array ? Buffer.from(v).toString('hex') : v));
  assert.ok(!published.includes(Buffer.from(VIN, 'ascii').toString('hex')), 'raw VIN was published');
  assert.ok(!published.includes(String(vehicle.expiresAt)), 'real expiry was published');
});

await test('a van that is NOT on the policy cannot be proven (the "no" answer)', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).proveVehicle(bytes('r'), vinC(OTHER_VIN), inAWeek), 'not the one attested');
});

await test('rejects when coverage ends before the requested date', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).proveVehicle(bytes('r'), vinC(VIN), BigInt(now() + 400 * DAY)), 'Coverage ends before');
});

await test('rejects a requested date that is already in the past', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).proveVehicle(bytes('r'), vinC(VIN), BigInt(now() - DAY)), 'already in the past');
});

await test("a stolen attestation is useless without the carrier's secret key", async () => {
  const sim = await freshSim();
  await rejects(sim.as({ secretKey: secret(), attestation }).proveVehicle(bytes('r'), vinC(VIN), inAWeek), 'Invalid attestation signature');
});

await test('a carrier cannot swap in a different VIN', async () => {
  const sim = await freshSim();
  const tampered = { ...carrierState, attestation: { ...attestation, vehicle: { ...vehicle, vin: vinBytes(OTHER_VIN) } } };
  await rejects(sim.as(tampered).proveVehicle(bytes('r'), vinC(OTHER_VIN), inAWeek), 'Invalid attestation signature');
});

await test('rejects an attestation signed by an unregistered attestor', async () => {
  const sim = await freshSim();
  const fake = attestorKeyPair();
  const forged = { ...attestation, signature: signAttestation(fake.sk, vehicle, nonce, carrierPk), attestorId: 2n };
  await rejects(sim.as({ ...carrierState, attestation: forged }).proveVehicle(bytes('r'), vinC(VIN), inAWeek), 'Attestor not registered');
});

await test('a revoked attestation (van removed from policy) can no longer prove anything', async () => {
  const sim = await freshSim();
  await sim.as(carrierState).proveVehicle(bytes('before'), vinC(VIN), inAWeek);
  await sim.as(adminState).revokeAttestation(pureCircuits.attestationId(nonce));
  await rejects(sim.as(carrierState).proveVehicle(bytes('after'), vinC(VIN), inAWeek), 'revoked');
});

await test('the same request can only be answered once', async () => {
  const sim = await freshSim();
  await sim.as(carrierState).proveVehicle(bytes('once'), vinC(VIN), inAWeek);
  await rejects(sim.as(carrierState).proveVehicle(bytes('once'), vinC(VIN), inAWeek), 'already answered');
});

await test('only the admin can register attestors or revoke', async () => {
  const sim = await freshSim();
  await rejects(sim.as(carrierState).registerAttestor(9n, nightlane.pk), 'Only admin');
  await rejects(sim.as(carrierState).revokeAttestation(pureCircuits.attestationId(nonce)), 'Only admin');
});

console.log(`\n${passed} passed${process.exitCode ? ', some FAILED' : ''}`);
