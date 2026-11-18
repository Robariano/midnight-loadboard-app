// The private side of the coverage proof: what each party's own device keeps.
// Nothing here is sent to the chain; the circuits only see it inside the proof.
import type { WitnessContext } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import type { Ledger } from './managed/coverage-proof/contract/index.js';

const TWO_248 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;

export type Coverage = { dot: bigint; liability: bigint; cargo: bigint; expiresAt: bigint };
export type SchnorrSignature = { announcement: { x: bigint; y: bigint }; response: bigint };
export type CoverageAttestation = {
  coverage: Coverage;
  nonce: bigint;
  signature: SchnorrSignature;
  attestorId: bigint;
};

export type CoveragePrivateState = {
  // A carrier's (or Nightlane admin's) 32-byte secret key.
  secretKey: Uint8Array;
  // Set on a carrier's device after Nightlane attests its coverage.
  attestation: CoverageAttestation | null;
};

export const createCoveragePrivateState = (secretKey: Uint8Array): CoveragePrivateState => ({
  secretKey,
  attestation: null,
});

type Ctx = WitnessContext<Ledger, CoveragePrivateState>;

export const witnesses = {
  getSecretKey: ({ privateState }: Ctx): [CoveragePrivateState, Uint8Array] => {
    if (!(privateState.secretKey instanceof Uint8Array) || privateState.secretKey.length !== 32) {
      throw new Error('Private state needs a 32-byte secretKey');
    }
    return [privateState, privateState.secretKey];
  },
  getCoverageAttestation: ({ privateState }: Ctx): [CoveragePrivateState, [Coverage, bigint, SchnorrSignature, bigint]] => {
    const a = privateState.attestation;
    if (!a) throw new Error('No coverage attestation in private state');
    return [privateState, [a.coverage, a.nonce, a.signature, a.attestorId]];
  },
  // Off-chain division the circuit only checks (see contract/schnorr.compact).
  getSchnorrReduction: ({ privateState }: Ctx, challengeHash: bigint): [CoveragePrivateState, [bigint, bigint]] => [
    privateState,
    [challengeHash / TWO_248, challengeHash % TWO_248],
  ],
};
