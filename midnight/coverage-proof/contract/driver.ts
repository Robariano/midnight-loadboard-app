// Wires the compiled driver-proof contract to its witnesses for Midnight.js.
// Run `npm run compile:driver` first: it writes contract/managed/driver-proof.
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-js';
import type { WitnessContext } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Contract } from './managed/driver-proof/contract/index.js';
import type { Ledger } from './managed/driver-proof/contract/index.js';
import type { SchnorrSignature } from './witnesses.js';

export { Contract as DriverContract, ledger as driverLedger, pureCircuits as driverPureCircuits } from './managed/driver-proof/contract/index.js';

const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;

export type Driver = { dot: bigint; name: Uint8Array; expiresAt: bigint };
export type DriverAttestation = { driver: Driver; nonce: bigint; signature: SchnorrSignature; attestorId: bigint };
export type DriverPrivateState = { secretKey: Uint8Array; attestation: DriverAttestation | null };

export const createDriverPrivateState = (secretKey: Uint8Array): DriverPrivateState => ({ secretKey, attestation: null });

/** Normalized driver name: ASCII, upper case, single spaces, 2-32 chars. */
export function normalizeDriverName(name: string): string {
  const v = String(name).normalize('NFKD').replace(/[^\x20-\x7e]/g, '').trim().replace(/\s+/g, ' ').toUpperCase();
  if (v.length < 2 || v.length > 32) throw new Error(`Driver name must be 2 to 32 characters: ${name}`);
  return v;
}
/** The name as the circuit sees it: normalized, zero-padded to 32 bytes. */
export function nameBytes(name: string): Uint8Array {
  const out = new Uint8Array(32);
  out.set(Buffer.from(normalizeDriverName(name), 'ascii'));
  return out;
}

type Ctx = WitnessContext<Ledger, DriverPrivateState>;

export const driverWitnesses = {
  getSecretKey: ({ privateState }: Ctx): [DriverPrivateState, Uint8Array] => {
    if (!(privateState.secretKey instanceof Uint8Array) || privateState.secretKey.length !== 32) {
      throw new Error('Private state needs a 32-byte secretKey');
    }
    return [privateState, privateState.secretKey];
  },
  getDriverAttestation: ({ privateState }: Ctx): [DriverPrivateState, [Driver, bigint, SchnorrSignature, bigint]] => {
    const a = privateState.attestation;
    if (!a) throw new Error('No driver attestation in private state');
    return [privateState, [a.driver, a.nonce, a.signature, a.attestorId]];
  },
  getSchnorrReduction: ({ privateState }: Ctx, challengeHash: bigint): [DriverPrivateState, [bigint, bigint]] => [
    privateState,
    [challengeHash / TWO_248, challengeHash % TWO_248],
  ],
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const driverZkConfigPath = path.resolve(currentDir, 'managed', 'driver-proof');

export const CompiledDriverContract = CompiledContract.make('DriverProofContract', Contract).pipe(
  CompiledContract.withWitnesses(driverWitnesses),
  CompiledContract.withCompiledFileAssets(driverZkConfigPath),
);
