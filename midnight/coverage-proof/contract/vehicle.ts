// Wires the compiled vehicle-proof contract to its witnesses for Midnight.js.
// Run `npm run compile:vehicle` first: it writes contract/managed/vehicle-proof.
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-js';
import type { WitnessContext } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Contract } from './managed/vehicle-proof/contract/index.js';
import type { Ledger } from './managed/vehicle-proof/contract/index.js';
import type { SchnorrSignature } from './witnesses.js';

export { Contract as VehicleContract, ledger as vehicleLedger, pureCircuits as vehiclePureCircuits } from './managed/vehicle-proof/contract/index.js';

const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;

export type Vehicle = { dot: bigint; vin: Uint8Array; expiresAt: bigint };
export type VehicleAttestation = { vehicle: Vehicle; nonce: bigint; signature: SchnorrSignature; attestorId: bigint };
export type VehiclePrivateState = { secretKey: Uint8Array; attestation: VehicleAttestation | null };

export const createVehiclePrivateState = (secretKey: Uint8Array): VehiclePrivateState => ({ secretKey, attestation: null });

/** A VIN as the circuit sees it: 17 upper-case ASCII bytes (no I, O or Q). */
export function vinBytes(vin: string): Uint8Array {
  const v = String(vin).trim().toUpperCase();
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) throw new Error(`Not a valid 17-character VIN: ${vin}`);
  return new Uint8Array(Buffer.from(v, 'ascii'));
}

type Ctx = WitnessContext<Ledger, VehiclePrivateState>;

export const vehicleWitnesses = {
  getSecretKey: ({ privateState }: Ctx): [VehiclePrivateState, Uint8Array] => {
    if (!(privateState.secretKey instanceof Uint8Array) || privateState.secretKey.length !== 32) {
      throw new Error('Private state needs a 32-byte secretKey');
    }
    return [privateState, privateState.secretKey];
  },
  getVehicleAttestation: ({ privateState }: Ctx): [VehiclePrivateState, [Vehicle, bigint, SchnorrSignature, bigint]] => {
    const a = privateState.attestation;
    if (!a) throw new Error('No vehicle attestation in private state');
    return [privateState, [a.vehicle, a.nonce, a.signature, a.attestorId]];
  },
  getSchnorrReduction: ({ privateState }: Ctx, challengeHash: bigint): [VehiclePrivateState, [bigint, bigint]] => [
    privateState,
    [challengeHash / TWO_248, challengeHash % TWO_248],
  ],
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const vehicleZkConfigPath = path.resolve(currentDir, 'managed', 'vehicle-proof');

export const CompiledVehicleContract = CompiledContract.make('VehicleProofContract', Contract).pipe(
  CompiledContract.withWitnesses(vehicleWitnesses),
  CompiledContract.withCompiledFileAssets(vehicleZkConfigPath),
);
