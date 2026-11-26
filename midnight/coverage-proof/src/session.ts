// Opens the deployer wallet and Midnight.js providers for a transaction.
// On the pilot, Nightlane's deployer wallet pays the DUST fees for carriers'
// proofs, so carriers don't need a Midnight wallet of their own.
import { WebSocket } from 'ws';
import { validatePassword } from '@midnight-ntwrk/midnight-js-utils';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { getConfig } from './config.js';
import { buildProviders, type CoverageProviders } from './providers.js';
import { MidnightWalletProvider, resolveWallet, syncWallet, waitForNightThenDust } from './wallet.js';
import { zkConfigPath } from '../contract/index.js';
import { NETWORK, logger, loadSecrets } from './common.js';

// Required for GraphQL subscriptions in Node.js
// @ts-expect-error WebSocket global assignment for apollo
globalThis.WebSocket = WebSocket;

/** zkPath: the compiled contract's assets (coverage-proof by default). */
export async function openSession(zkPath: string = zkConfigPath): Promise<{ providers: CoverageProviders; providersFor: (zk: string) => CoverageProviders; close: () => Promise<void> }> {
  loadSecrets();
  const password = process.env['MIDNIGHT_PRIVATE_STATE_PASSWORD']!;
  validatePassword(password);
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
  const proof = await fetch(config.proofServer).catch(() => null);
  if (!proof) throw new Error(`No proof server at ${config.proofServer}. Start it in Docker first.`);

  const wallet = await MidnightWalletProvider.build(logger, envConfig, resolveWallet(NETWORK).secret);
  await wallet.start();
  await syncWallet(logger, wallet.wallet, Number(process.env['MIDNIGHT_SYNC_TIMEOUT_MS'] ?? 60 * 60_000));
  await waitForNightThenDust(logger, wallet.wallet, wallet.unshieldedKeystore, envConfig, config.faucet, { label: 'fee wallet' });
  return {
    providers: buildProviders(wallet, zkPath, config, password),
    // Same wallet, another contract's proving assets (e.g. the vehicle proof).
    providersFor: (zk: string) => buildProviders(wallet, zk, config, password),
    close: () => wallet.stop(),
  };
}
