// Deploys the Nightlane VEHICLE-proof contract ("this van is on the policy")
// next to the coverage-proof contract, using the same .env.<network> secrets
// (same deployer wallet, same Nightlane admin and attestor keys), and
// registers Nightlane as attestor 1.
//
//   npm run compile:vehicle && npm run deploy:vehicle -- --network=mainnet
//
// Needs the coverage-proof deployment's .env.<network> already on this
// computer, and a proof server on 127.0.0.1:6300 (see scripts/deploy.ts).
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
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
import { CompiledVehicleContract, vehicleLedger as ledger, vehiclePureCircuits as pureCircuits, vehicleZkConfigPath as zkConfigPath, createVehiclePrivateState } from '../contract/vehicle.js';

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


// ---- 1. Secrets: reuse the coverage-proof deployment's .env.<network>
if (!existsSync(envFile)) throw new Error(`.env.${network} not found. Deploy the coverage-proof contract first (npm run deploy:${network}).`);
process.loadEnvFile(envFile);

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
const ADMIN_STATE_ID = 'nightlane-vehicle-admin';
logger.info('Deploying the vehicle-proof contract...');
const deployed = await deployContract(providers, {
  compiledContract: CompiledVehicleContract,
  privateStateId: ADMIN_STATE_ID,
  initialPrivateState: createVehiclePrivateState(adminSecret),
} as any);
const contractAddress = (deployed as any).deployTxData.public.contractAddress as string;
logger.info(`Deployed at ${contractAddress}`);

// ---- 4. Register Nightlane as attestor 1
const attestorPk = ecMulGenerator(attestorSk);
logger.info('Registering Nightlane as attestor 1...');
await submitCallTx(providers, {
  compiledContract: CompiledVehicleContract,
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
writeFileSync(`${root}deployments/${network}-vehicle.json`, JSON.stringify(record, null, 2) + '\n');
logger.info(`Saved deployments/${network}-vehicle.json`);
logger.info(adminOk && attestorOk ? 'All checks passed. The contract is live.' : 'Deployed, but a check failed: see the record.');

await wallet.stop();
process.exit(0);
