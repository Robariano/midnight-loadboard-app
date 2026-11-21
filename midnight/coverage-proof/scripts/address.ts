// Print the deployer wallet's Midnight address without syncing.
// Usage: npm run address -- --network=mainnet
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import pino from 'pino';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { getConfig } from '../src/config.js';
import { MidnightWalletProvider, resolveWallet } from '../src/wallet.js';

const networkArg = process.argv.find((a) => a.startsWith('--network='))?.split('=')[1];
if (networkArg) process.env['MIDNIGHT_NETWORK'] = networkArg;
const network = process.env['MIDNIGHT_NETWORK'] ?? 'preview';
const envFile = `${fileURLToPath(new URL('../', import.meta.url))}.env.${network}`;
if (!existsSync(envFile)) throw new Error(`.env.${network} not found. Run npm run deploy:${network} first.`);
process.loadEnvFile(envFile);

const logger = pino({ level: 'warn' });
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
const wallet = await MidnightWalletProvider.build(logger, envConfig, resolveWallet(network).secret);
console.log(`\nNightlane deployer address on ${network}:\n${String(wallet.unshieldedKeystore.getBech32Address())}\n`);
process.exit(0);
