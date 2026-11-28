// Deploys the Nightlane coverage-proof contract and registers Nightlane as
// attestor 1.
//
//   npm run deploy:preview
//
// Needs: `npm run compile` done, and a proof server on 127.0.0.1:6300
// (docker run -d --name midnight-proof-server -p 127.0.0.1:6300:6300
//  midnightntwrk/proof-server:9.0.2 midnight-proof-server).
//
// The first run creates .env.<network> with fresh secrets for this deployment:
// a deployer wallet seed, Nightlane's admin key, Nightlane's attestor key and
// the private-state password. Nothing is typed in or shared. The file is
// gitignored. Keep it: it is what lets you run the admin circuits later. These
// are test-network keys, never used for real funds.
//
// A new wallet has no tNIGHT, so the script prints the wallet's address and
// the faucet link and waits until the tNIGHT arrives, then registers it for
// DUST (Midnight's fee resource) and waits for DUST before deploying.
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import pino from 'pino';
import { validatePassword } from '@midnight-ntwrk/midnight-js-utils';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { ecMulGenerator } from '@midnight-ntwrk/midnight-js-protocol/v9/compact-runtime';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { getConfig } from '../src/config.js';
import { buildProviders, ledgerState } from '../src/providers.js';
import { MidnightWalletProvider, resolveWallet, syncWallet, waitForNightThenDust } from '../src/wallet.js';
import { CompiledCoverageContract, ledger, pureCircuits, zkConfigPath } from '../contract/index.js';
import { createCoveragePrivateState } from '../contract/witnesses.js';

// Required for GraphQL subscriptions in Node.js
// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

const logger = pino({ level: process.env['LOG_LEVEL'] ?? 'info', transport: { target: 'pino-pretty' } });

const networkArg = process.argv.find((a) => a.startsWith('--network='))?.split('=')[1];
if (networkArg) process.env['MIDNIGHT_NETWORK'] = networkArg;
const network = process.env['MIDNIGHT_NETWORK'] ?? 'preview';
if (network === 'local') throw new Error('Use preview, preprod or mainnet. This script is for a public network.');
const upper = network.toUpperCase();
const root = fileURLToPath(new URL('../', import.meta.url));
const envFile = `${root}.env.${network}`;

const JUBJUB_ORDER = 6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const hex = (n: number) => randomBytes(n).toString('hex');
const randomScalar = () => BigInt('0x' + hex(32)) % JUBJUB_ORDER;

// ---- 1. Secrets for this deployment, created once and kept in .env.<network>
function ensureSecrets() {
  const wanted: Record<string, () => string> = {
    [`MIDNIGHT_${upper}_ALICE_SEED`]: () => hex(32),
    NIGHTLANE_ADMIN_SECRET: () => hex(32),
    NIGHTLANE_ATTESTOR_SK: () => randomScalar().toString(),
    MIDNIGHT_PRIVATE_STATE_PASSWORD: () => `Nl-${hex(12)}-#!$`,
  };
  const existing = existsSync(envFile) ? readFileSync(envFile, 'utf8') : '';
  const missing = Object.keys(wanted).filter((k) => !new RegExp(`^${k}=`, 'm').test(existing));
  if (missing.length) {
    const header = existing ? '' : `# Nightlane coverage proof: ${network} deployment secrets. Keep this file. Never share or commit it.\n`;
    const sep = existing && !existing.endsWith('\n') ? '\n' : '';
    appendFileSync(envFile, sep + header + missing.map((k) => `${k}=${wanted[k]()}`).join('\n') + '\n', { mode: 0o600 });
    logger.info(`Created ${missing.length} new secret(s) in .env.${network} (kept on this computer only).`);
  }
  process.loadEnvFile(envFile);
}
ensureSecrets();

const adminSecret = Uint8Array.from(Buffer.from(process.env['NIGHTLANE_ADMIN_SECRET']!, 'hex'));
const attestorSk = BigInt(process.env['NIGHTLANE_ATTESTOR_SK']!);
const password = process.env['MIDNIGHT_PRIVATE_STATE_PASSWORD']!;
validatePassword(password);

// ---- 2. Wallet: sync, then fund from the faucet if it is new
const config = getConfig();
const envConfig: EnvironmentConfiguration = {
  walletNetworkId: config.networkId,
  networkId: config.networkId,
  indexer: config.indexer,
  indexerWS: config.indexerWS,
  node: config.node,
  nodeWS: config.nodeWS,
  faucet: config.faucet,
  proofServer: config.proofServer,
};
// How long the wallet may go without any sync progress before the run gives up.
const syncTimeoutMs = Number(process.env['MIDNIGHT_SYNC_TIMEOUT_MS'] ?? 20 * 60_000);

const proof = await fetch(config.proofServer).catch(() => null);
if (!proof) throw new Error(`No proof server at ${config.proofServer}. Start it with Docker first (see the top of this file).`);

const setup = resolveWallet(network);
const wallet = await MidnightWalletProvider.build(logger, envConfig, setup.secret);
await wallet.start();
logger.info('Syncing the deployer wallet. The first sync can take a while; later runs are fast.');
await syncWallet(logger, wallet.wallet, syncTimeoutMs);
await waitForNightThenDust(logger, wallet.wallet, wallet.unshieldedKeystore, envConfig, config.faucet, { label: 'deployer' });

const providers = buildProviders(wallet, zkConfigPath, config, password);

// ---- 3. Deploy (the constructor makes NIGHTLANE_ADMIN_SECRET's key the admin)
const ADMIN_STATE_ID = 'nightlane-admin';
logger.info('Deploying the coverage-proof contract...');
const deployed = await deployContract(providers, {
  compiledContract: CompiledCoverageContract,
  privateStateId: ADMIN_STATE_ID,
  initialPrivateState: createCoveragePrivateState(adminSecret),
} as any);
const contractAddress = (deployed as any).deployTxData.public.contractAddress as string;
logger.info(`Deployed at ${contractAddress}`);

// ---- 4. Register Nightlane as attestor 1
const attestorPk = ecMulGenerator(attestorSk);
logger.info('Registering Nightlane as attestor 1...');
await submitCallTx(providers, {
  compiledContract: CompiledCoverageContract,
  contractAddress,
  privateStateId: ADMIN_STATE_ID,
  circuitId: 'registerAttestor',
  args: [1n, attestorPk],
} as any);

// ---- 5. Check the result on-chain and save a record
const state = ledger(ledgerState(await providers.publicDataProvider.queryContractState(contractAddress)));
const adminOk = Buffer.from(state.contractAdmin).equals(Buffer.from(pureCircuits.deriveAdminPublicKey(adminSecret)));
const attestorOk = state.attestors.member(1n);
const record = {
  network,
  contractAddress,
  deployedAt: new Date().toISOString(),
  admin: Buffer.from(state.contractAdmin).toString('hex'),
  attestor: { id: 1, publicKey: { x: attestorPk.x.toString(), y: attestorPk.y.toString() } },
  checks: { adminIsNightlane: adminOk, attestorRegistered: attestorOk },
};
mkdirSync(`${root}deployments`, { recursive: true });
// Keep the record of an earlier deployment (the website still reads its old proofs).
const depFile = `${root}deployments/${network}.json`;
if (existsSync(depFile)) {
  const prev = JSON.parse(readFileSync(depFile, 'utf8'));
  writeFileSync(`${root}deployments/${network}-${prev.contractAddress.slice(0, 8)}.json`, JSON.stringify(prev, null, 2) + '\n');
  logger.info(`Kept the earlier deployment record as deployments/${network}-${prev.contractAddress.slice(0, 8)}.json`);
}
writeFileSync(`${root}deployments/${network}.json`, JSON.stringify(record, null, 2) + '\n');
logger.info(`Saved deployments/${network}.json`);
logger.info(adminOk && attestorOk ? 'All checks passed. The contract is live.' : 'Deployed, but a check failed: see the record.');

await wallet.stop();
process.exit(0);
