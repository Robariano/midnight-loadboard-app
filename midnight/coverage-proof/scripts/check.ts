// A broker checks a carrier's coverage answer. Read-only: no wallet, no fees.
//
//   npm run check -- "MC 123456 load 4471"     one request
//   npm run check                              every answered request
import { WebSocket } from 'ws';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { ledger } from '../contract/index.js';
import { getConfig } from '../src/config.js';
import { ledgerState } from '../src/providers.js';
import { fromUnix, readDeployment, requestIdOf, usd } from '../src/common.js';

// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const config = getConfig();
const deployment = readDeployment();
const pdp = indexerPublicDataProvider(config.indexer, config.indexerWS);
const state = ledger(ledgerState(await pdp.queryContractState(deployment.contractAddress)));

const line = (p: { dot: bigint; minLiability: bigint; minCargo: bigint; coveredThrough: bigint; attestorId: bigint }) =>
  `DOT ${p.dot}: at least ${usd(p.minLiability)} liability and ${usd(p.minCargo)} cargo, covered through ${fromUnix(p.coveredThrough)} (verified by attestor ${p.attestorId}${p.attestorId === 1n ? ', Nightlane' : ''}).`;

const request = process.argv.slice(2).join(' ').trim();
console.log(`Nightlane coverage proofs on Midnight ${deployment.network} (contract ${deployment.contractAddress.slice(0, 12)}...)`);
if (request) {
  const id = requestIdOf(request);
  if (state.proofs.member(id)) {
    console.log(`YES for "${request}": ${line(state.proofs.lookup(id))}`);
  } else {
    console.log(`No answer yet for "${request}". (Check the exact wording, it must match.)`);
    process.exit(2);
  }
} else {
  let n = 0;
  for (const [, p] of state.proofs) {
    console.log(`- ${line(p)}`);
    n++;
  }
  console.log(n ? `${n} answered request(s).` : 'No requests answered yet.');
}
process.exit(0);
