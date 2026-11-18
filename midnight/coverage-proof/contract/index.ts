// Wires the compiled coverage-proof contract to its witnesses for Midnight.js.
// Run `npm run compile` first: it writes contract/managed/coverage-proof.
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export {
  Contract,
  ledger,
  pureCircuits,
  type Witnesses,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/coverage-proof/contract/index.js';
import { Contract } from './managed/coverage-proof/contract/index.js';
import { witnesses } from './witnesses.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const zkConfigPath = path.resolve(currentDir, 'managed', 'coverage-proof');

export const CompiledCoverageContract = CompiledContract.make('CoverageProofContract', Contract).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);
