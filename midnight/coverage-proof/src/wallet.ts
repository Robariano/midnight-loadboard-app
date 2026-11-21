// Adapted from Midnight example-zk-loan (midnightntwrk/midnight-examples).
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type CoinPublicKey,
  type EncPublicKey,
  type FinalizedTransaction,
  type PreBinding,
  type Proof,
  type SignatureEnabled,
  Transaction,
  LedgerParameters,
  unshieldedToken,
  ZswapSecretKeys,
} from '@midnight-ntwrk/midnight-js-protocol/v9';
import {
  LedgerTransaction,
  type Ledger9WalletProvider,
  type TransactionAnswer,
} from '@midnight-ntwrk/midnight-js-types';
import { ttlOneHour } from '@midnight-ntwrk/midnight-js-utils';
import {
  DefaultForkSchedule,
  ProtocolVersion,
  WalletTransaction,
  DustWallet,
  InMemoryTransactionHistoryStorage,
  mergeWalletEntries,
  ShieldedWallet,
  UnshieldedWallet,
  WalletEntrySchema,
  WalletFacade,
  MidnightBech32m,
  type FacadeState,
  type UnshieldedKeystore,
  type WalletSeeds,
} from '@midnightntwrk/wallet-sdk';
import {
  type DustWalletOptions,
  type EnvironmentConfiguration,
  FluentWalletBuilder,
  logger as testkitLogger,
} from '@midnight-ntwrk/testkit-js';
import * as Rx from 'rxjs';
import type { Logger } from 'pino';

// A proven, not yet bound ledger 9 transaction: what a contract call or deploy
// hands the wallet to balance.
type UnboundTransaction = Transaction<SignatureEnabled, Proof, PreBinding>;

/**
 * Midnight.js 5 passes transactions as era-tagged byte handles. Decode a proven
 * one into the ledger 9 transaction the wallet SDK balances.
 */
export function unboundFromHandle(handle: LedgerTransaction<'Unbound'>): UnboundTransaction {
  if (handle.era !== 'v9') throw new Error(`expected a ledger 9 transaction, got ${handle.era}`);
  return Transaction.deserialize('signature', 'proof', 'pre-binding', handle.serialize());
}

/** The secret a wallet is built from: a hex seed or a BIP-39 mnemonic. */
export type WalletSecret = { kind: 'seed'; value: string } | { kind: 'mnemonic'; value: string };

// testkit logs through its own module-level logger. At info it prints the
// wallet's indexer and relay URLs, which carry the Blockfrost project_id, and
// two lines per sync update. Keep only its warnings and errors.
testkitLogger.level = 'warn';

export class MidnightWalletProvider implements Ledger9WalletProvider {
  readonly wallet: WalletFacade;
  readonly unshieldedKeystore: UnshieldedKeystore;

  private readonly zswapSecretKeys: ZswapSecretKeys;

  private constructor(
    private readonly logger: Logger,
    wallet: WalletFacade,
    private readonly seeds: WalletSeeds,
    unshieldedKeystore: UnshieldedKeystore,
  ) {
    this.wallet = wallet;
    this.unshieldedKeystore = unshieldedKeystore;
    this.zswapSecretKeys = ZswapSecretKeys.fromSeed(seeds.shielded);
  }

  getCoinPublicKey(): CoinPublicKey {
    return this.zswapSecretKeys.coinPublicKey;
  }

  getEncryptionPublicKey(): EncPublicKey {
    return this.zswapSecretKeys.encryptionPublicKey;
  }

  // Wallet SDK 2 balances and submits handles adopted at the chain's current
  // protocol version, and hands back a handle to unwrap. The keys come from the
  // seeds the wallet was started with, so balancing no longer takes them.
  async balanceTx(
    handle: LedgerTransaction<'Unbound'>,
    ttl: Date = ttlOneHour(),
  ): Promise<TransactionAnswer> {
    const tx = unboundFromHandle(handle);
    const active = await this.activeProtocolVersion();
    const recipe = await this.wallet.balanceUnboundTransaction(
      WalletTransaction.adopt('Unbound', tx, active),
      { ttl },
    );
    // Balancing may add unshielded inputs (e.g. NIGHT spent to fund a
    // contract's receiveUnshielded). Those inputs need signatures from the
    // unshielded keystore; without this step the node rejects the transaction
    // with InputsSignaturesLengthMismatch (Custom error 192).
    const signed = await this.wallet.signRecipe(recipe, (payload) =>
      this.unshieldedKeystore.signDataAsync(payload),
    );
    const finalized = await this.wallet.finalizeRecipe(signed);
    const accepted = ProtocolVersion.epochOf(active, DefaultForkSchedule.v9);
    const unwrapped = WalletTransaction.unwrapWithin<FinalizedTransaction>(finalized, accepted);
    if (unwrapped._tag === 'Left') throw unwrapped.left;
    return unwrapped.right;
  }

  async submitTx(tx: LedgerTransaction<'Finalized', 'v9'> | FinalizedTransaction): Promise<string> {
    const finalized: FinalizedTransaction = LedgerTransaction.isLedgerTransaction(tx)
      ? Transaction.deserialize('signature', 'proof', 'binding', tx.serialize())
      : tx;
    const active = await this.activeProtocolVersion();
    return this.wallet.submitTransaction(WalletTransaction.adopt('Finalized', finalized, active));
  }

  private async activeProtocolVersion(): Promise<ProtocolVersion.ProtocolVersion> {
    return (await Rx.firstValueFrom(this.wallet.state())).activeProtocolVersion;
  }

  async start(): Promise<void> {
    this.logger.info('Starting wallet...');
    await this.wallet.start(this.seeds);
  }

  async stop(): Promise<void> {
    return this.wallet.stop();
  }

  /**
   * Build an un-started wallet provider from a seed or mnemonic. The wallet
   * syncs from genesis: seconds on a local devnet, over an hour on preprod.
   */
  static async build(
    logger: Logger,
    env: EnvironmentConfiguration,
    secret: WalletSecret,
  ): Promise<MidnightWalletProvider> {
    const dustOptions: DustWalletOptions = {
      ledgerParams: LedgerParameters.initialParameters(),
      additionalFeeOverhead: 1_000n,
      feeBlocksMargin: 5,
    };

    const base = FluentWalletBuilder.forEnvironment(env)
      .withDustOptions(dustOptions);
    const builder =
      secret.kind === 'mnemonic'
        ? base.withMnemonic(secret.value)
        : base.withSeed(secret.value);

    skipLedgerV8DustHistory(builder);

    const built = await builder.buildWithoutStarting();
    const { seeds, keystore } = built;
    const wallet = await restoreSavedState(logger, env, builder, dustOptions, built.wallet, seeds.masterSeed);

    logger.info(
      `Wallet built from ${secret.kind}; address ${String(keystore.getBech32Address())}`,
    );

    return new MidnightWalletProvider(logger, wallet, seeds, keystore);
  }
}

function isProgressStrictlyComplete(progress: unknown): boolean {
  if (!progress || typeof progress !== 'object') {
    return false;
  }
  const candidate = progress as { isStrictlyComplete?: unknown };
  if (typeof candidate.isStrictlyComplete !== 'function') {
    return false;
  }
  return (candidate.isStrictlyComplete as () => boolean)();
}

export async function syncWallet(
  logger: Logger,
  wallet: WalletFacade,
  timeout = 300_000,
): Promise<FacadeState> {
  logger.info('Syncing wallet...');
  let emissionCount = 0;
  const stopCheckpoints = startSyncCheckpoints(logger, wallet);
  let state: FacadeState;
  try {
    state = await Rx.firstValueFrom(
      wallet.state().pipe(
        // Fail only when the wallet goes quiet for `timeout` ms. Placed before
        // the filter, it times the gap between progress updates; after the
        // filter it capped the whole sync, and a mainnet first sync (hours)
        // always hit it.
        Rx.timeout({
          each: timeout,
          with: () =>
            Rx.throwError(
              () => new Error(`Wallet sync stalled: no progress for ${timeout}ms (${emissionCount} emissions received)`),
            ),
        }),
        Rx.tap((state: FacadeState) => {
          emissionCount++;
          const shielded = isProgressStrictlyComplete(state.shielded.progress);
          const unshielded = isProgressStrictlyComplete(state.unshielded.progress);
          const dust = isProgressStrictlyComplete(state.dust.progress);
          logger.info(
            `Wallet sync [${emissionCount}]: shielded=${shielded}, unshielded=${unshielded}, dust=${dust}`,
          );
          if (!shielded) {
            logger.debug(`  shielded.progress: ${JSON.stringify(state.shielded.progress)}`);
          }
          if (!unshielded) {
            logger.debug(`  unshielded.progress: ${JSON.stringify(state.unshielded.progress)}`);
          }
          if (!dust) {
            logger.debug(`  dust.progress: ${JSON.stringify(state.dust.progress)}`);
          }
        }),
        Rx.filter(
          (state: FacadeState) =>
            isProgressStrictlyComplete(state.shielded.progress) &&
            isProgressStrictlyComplete(state.dust.progress) &&
            isProgressStrictlyComplete(state.unshielded.progress),
        ),
        Rx.tap(() => logger.info(`Wallet sync complete after ${emissionCount} emissions`)),
        Rx.catchError((err) => {
          logger.error(`Wallet sync error: ${err}`);
          return Rx.throwError(() => err);
        }),
      ),
    );
  } finally {
    await stopCheckpoints();
  }
  await saveWalletState(logger, wallet);
  return state;
}

// A first sync on mainnet can take hours, and a closed window or a sleeping
// laptop used to throw all of it away. While syncing, save the wallet's state
// every few minutes (MIDNIGHT_STATE_SAVE_MS, default 5 min), and once more if
// the process is stopped (Ctrl+C, window closed), so the next run restores it
// and syncs only the gap. Each sub-wallet saves its own cursor, so a snapshot
// taken mid-sync resumes cleanly.
const CHECKPOINT_MS = Number(process.env['MIDNIGHT_STATE_SAVE_MS'] ?? 5 * 60_000);
const STOP_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;

function startSyncCheckpoints(logger: Logger, wallet: WalletFacade): () => Promise<void> {
  if (!stateFiles.has(wallet) || !(CHECKPOINT_MS > 0)) return async () => {};
  let saving: Promise<void> | null = null;
  const checkpoint = (): Promise<void> => {
    if (!saving) {
      saving = saveWalletState(logger, wallet)
        .catch((error) => logger.warn(`Could not save sync progress (${String(error)}); will try again.`))
        .finally(() => {
          saving = null;
        });
    }
    return saving;
  };
  const timer = setInterval(() => void checkpoint(), CHECKPOINT_MS);
  timer.unref();
  const onStop = (signal: NodeJS.Signals) => {
    logger.info(`Stopping (${signal}); saving sync progress first...`);
    const giveUp = new Promise<void>((resolve) => setTimeout(resolve, 20_000).unref());
    void Promise.race([checkpoint(), giveUp]).finally(() => process.exit(130));
  };
  for (const signal of STOP_SIGNALS) process.once(signal, onStop);
  logger.info(`Sync progress is saved every ${Math.round(CHECKPOINT_MS / 60_000)} min; a stopped run resumes from there.`);
  return async () => {
    clearInterval(timer);
    for (const signal of STOP_SIGNALS) process.removeListener(signal, onStop);
    if (saving) await saving;
  };
}

// ---------------------------------------------------------------------------
// Saved wallet state (remote networks)
// ---------------------------------------------------------------------------
// On a long-lived network a sync from genesis takes minutes per wallet, and
// every suite builds its wallets afresh. So after each sync the three
// sub-wallets' state is saved to the gitignored repo-root .wallet-state/,
// keyed by network ID and a hash of the master seed, and the next build of the
// same wallet restores it and syncs only the gap. The local devnet is skipped:
// it starts from a new genesis each time. MIDNIGHT_WALLET_STATE=off turns this
// off.

const STATE_DIR = fileURLToPath(new URL('../.wallet-state/', import.meta.url));
const stateFiles = new WeakMap<WalletFacade, string>();

type SavedWalletState = { version: 1; shielded: string; unshielded: string; dust: string };

function stateFileFor(networkId: string, masterSeed: string): string | undefined {
  if (networkId === 'undeployed' || process.env['MIDNIGHT_WALLET_STATE'] === 'off') return undefined;
  const id = createHash('sha256').update(masterSeed).digest('hex').slice(0, 16);
  return join(STATE_DIR, `${networkId}-${id}.json`);
}

/**
 * Turn on the Wallet SDK's `skipLedgerV8DustHistory` for the DUST wallet the
 * builder makes. On a chain that crossed the Ledger 9 fork in place (preprod,
 * Preview), the fork emptied all DUST state and re-emitted live DUST as
 * Ledger 9 events, so a fresh wallet can start at the fork instead of
 * replaying every Ledger 8 DUST event from genesis: the slow part of a first
 * sync. Only fresh starts read it (a restore resumes from its saved cursor),
 * and on a chain that never crossed the fork it changes nothing. The cost is
 * the wallet's Ledger 8 DUST transaction history, which the examples don't use.
 * testkit's builder keeps its wallet configuration private, so it is set there.
 */
function skipLedgerV8DustHistory(builder: FluentWalletBuilder): void {
  (builder as unknown as { config: { skipLedgerV8DustHistory?: boolean } }).config.skipLedgerV8DustHistory = true;
}

/** The three sub-wallets restored from a snapshot, configured as testkit's WalletFactory configures new ones. */
async function restoreFacade(
  builder: FluentWalletBuilder,
  dustOptions: DustWalletOptions,
  saved: SavedWalletState,
): Promise<WalletFacade> {
  // testkit keeps the builder's wallet configuration private and does not
  // export the function that derives it; reuse it so a restored wallet is
  // configured exactly like a new one.
  const config = (builder as unknown as { config: Parameters<typeof ShieldedWallet>[0] }).config;
  const shielded = ShieldedWallet(config).restore(saved.shielded);
  const unshielded = UnshieldedWallet({
    ...config,
    txHistoryStorage: new InMemoryTransactionHistoryStorage(WalletEntrySchema, mergeWalletEntries),
  } as Parameters<typeof UnshieldedWallet>[0]).restore(saved.unshielded);
  const dust = DustWallet({
    ...config,
    costParameters: {
      ledgerParams: dustOptions.ledgerParams,
      additionalFeeOverhead: dustOptions.additionalFeeOverhead,
      feeBlocksMargin: dustOptions.feeBlocksMargin,
    },
  } as Parameters<typeof DustWallet>[0]).restore(saved.dust);
  return WalletFacade.init({
    configuration: config as Parameters<typeof WalletFacade.init>[0]['configuration'],
    shielded: () => shielded,
    unshielded: () => unshielded,
    dust: () => dust,
  });
}

/** The saved wallet for this seed and network if there is one, else `fresh`. */
async function restoreSavedState(
  logger: Logger,
  env: EnvironmentConfiguration,
  builder: FluentWalletBuilder,
  dustOptions: DustWalletOptions,
  fresh: WalletFacade,
  masterSeed: string,
): Promise<WalletFacade> {
  const file = stateFileFor(env.networkId, masterSeed);
  let wallet = fresh;
  if (file && existsSync(file)) {
    try {
      wallet = await restoreFacade(builder, dustOptions, JSON.parse(readFileSync(file, 'utf8')) as SavedWalletState);
      logger.info(`Restored wallet state from ${file}.`);
    } catch (error) {
      logger.warn(`Could not restore ${file} (${String(error)}); syncing from genesis.`);
    }
  }
  if (file) stateFiles.set(wallet, file);
  return wallet;
}

/** Save the wallet's state for the next build of the same wallet (no-op on the local devnet). */
export async function saveWalletState(logger: Logger, wallet: WalletFacade): Promise<void> {
  const file = stateFiles.get(wallet);
  if (!file) return;
  const saved: SavedWalletState = {
    version: 1,
    shielded: await wallet.shielded.serializeState(),
    unshielded: await wallet.unshielded.serializeState(),
    dust: await wallet.dust.serializeState(),
  };
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  writeFileSync(`${file}.tmp`, JSON.stringify(saved), { mode: 0o600 });
  renameSync(`${file}.tmp`, file);
  logger.info(`Saved wallet state to ${file}.`);
}

// ---------------------------------------------------------------------------
// Which wallet a run uses
// ---------------------------------------------------------------------------

/** Genesis-funded seeds on the local `undeployed` devnet. */
export const LOCAL_SEEDS = {
  ALICE: '0000000000000000000000000000000000000000000000000000000000000001',
  BOB: '0000000000000000000000000000000000000000000000000000000000000002',
  CHARLIE: '0000000000000000000000000000000000000000000000000000000000000003',
  DAVE: '000000000000000000000000000000000000000000000000000000000000000d',
} as const;

/** The four wallets a remote run is funded with. */
export type Role = keyof typeof LOCAL_SEEDS;

/** Suite-specific role names and the wallet each one uses. */
const ROLE_ALIASES: Record<string, Role> = {
  ALICE: 'ALICE',
  BOB: 'BOB',
  CHARLIE: 'CHARLIE',
  DAVE: 'DAVE',
  ORGANIZER: 'ALICE',
  BIDDER_ONE: 'BOB',
  BIDDER_TWO: 'CHARLIE',
};

export interface ResolvedWallet {
  secret: WalletSecret;
  /** The wallet `role` resolved to. */
  role: Role;
}

function readSecret(prefix: string): WalletSecret | null {
  const mnemonic = process.env[`${prefix}_MNEMONIC`]?.trim().replace(/\s+/g, ' ');
  const seed = process.env[`${prefix}_SEED`]?.trim();
  if (mnemonic && seed) throw new Error(`Set only one of ${prefix}_MNEMONIC or ${prefix}_SEED.`);
  if (mnemonic) return { kind: 'mnemonic', value: mnemonic };
  if (seed) {
    if (!/^[0-9a-fA-F]+$/.test(seed) || seed.length % 2 !== 0) {
      throw new Error(`${prefix}_SEED must be a hex string of even length (no 0x prefix).`);
    }
    return { kind: 'seed', value: seed };
  }
  return null;
}

/**
 * The wallet for `role` on `network`: a genesis seed on `local`, otherwise
 * `MIDNIGHT_<NETWORK>_<ROLE>_SEED` or `_MNEMONIC` from the repo-root
 * `.env.<network>` that vitest loads. A suite-specific role (such as
 * ORGANIZER) is looked up under its own name first, then under the wallet it
 * maps to.
 */
export function resolveWallet(network: string, role = 'ALICE'): ResolvedWallet {
  const canonical = ROLE_ALIASES[role.toUpperCase()];
  if (!canonical) {
    throw new Error(`Unknown wallet role '${role}'. Known roles: ${Object.keys(ROLE_ALIASES).join(', ')}.`);
  }
  if (network === 'local') return { secret: { kind: 'seed', value: LOCAL_SEEDS[canonical] }, role: canonical };

  const upper = network.toUpperCase();
  const prefixes = [`MIDNIGHT_${upper}_${role.toUpperCase()}`, `MIDNIGHT_${upper}_${canonical}`];
  for (const prefix of new Set(prefixes)) {
    const secret = readSecret(prefix);
    if (secret) return { secret, role: canonical };
  }
  throw new Error(
    `No wallet for role '${canonical}' on network '${network}'. Set ` +
      `MIDNIGHT_${upper}_${canonical}_SEED (or _MNEMONIC) in the repo-root .env.${network}.`,
  );
}

// ---------------------------------------------------------------------------
// Funding gate for remote runs
// ---------------------------------------------------------------------------
//
// "Synced" is not "funded": a wallet that was never funded is at chain tip
// with no coins. This waits for NIGHT from the faucet, registers it for DUST
// generation, and waits for spendable DUST.
//
// testkit's waitForFunds does the same, but it re-syncs with a fixed 90 s
// timeout after the faucet transfer. Indexers back their progress updates off
// to ~4 min on an idle subscription, so that check can time out although the
// NIGHT has arrived. The DUST wait below is the readiness check instead.

/** How long to wait for a human to visit the faucet, and for DUST to accrue. */
const FUND_TIMEOUT_MS = Number(process.env['MIDNIGHT_FUND_TIMEOUT_MS'] ?? 30 * 60_000);

const hasNight = (s: FacadeState) => Object.values(s.unshielded.balances).some((v) => v > 0n);

/** The indexer's latest block time, or undefined while it can't be read. */
async function latestBlockTime(indexerHttpUrl: string, timeoutMs: number): Promise<Date | undefined> {
  try {
    const res = await fetch(indexerHttpUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ block { timestamp } }' }),
      signal: AbortSignal.timeout(Math.max(1, timeoutMs)),
    });
    const body = (await res.json()) as { data?: { block?: { timestamp?: number } } };
    const ts = body.data?.block?.timestamp;
    return typeof ts === 'number' ? new Date(ts) : undefined;
  } catch {
    return undefined;
  }
}

/** 1 DUST is 10^15 Specks (SPECKS_PER_DUST in the ledger). */
const SPECKS_PER_DUST = 10n ** 15n;

/**
 * The DUST a wallet must hold before a suite transacts: enough to pay for a
 * deploy. MIDNIGHT_MIN_DUST overrides it, in DUST (default 60).
 */
const MIN_DUST_SPECKS = BigInt(
  Math.round(Number(process.env['MIDNIGHT_MIN_DUST'] ?? '60') * 1e6),
) * (SPECKS_PER_DUST / 10n ** 6n);

function formatDust(specks: bigint): string {
  return `${specks / SPECKS_PER_DUST}.${(specks % SPECKS_PER_DUST).toString().padStart(15, '0').slice(0, 6)}`;
}

/**
 * Wait until the wallet holds at least `minCoins` spendable DUST coin(s).
 *
 * With `indexerHttpUrl`, also wait until the DUST is worth at least
 * MIN_DUST_SPECKS at the latest block's time, which is when the wallet values
 * it while balancing. DUST accrues after registration, so a freshly registered
 * wallet holds a coin worth almost nothing, too little to pay for a deploy
 * ("could not balance dust"). On a fresh local devnet the DUST exists from
 * genesis but is worth 0 until the first block after genesis.
 */
export async function waitForDust(
  logger: Logger,
  wallet: WalletFacade,
  minCoins = 1,
  timeoutMs = 180_000,
  indexerHttpUrl?: string,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  logger.info(`Waiting for >=${minCoins} spendable DUST coin(s) (timeout ${timeoutMs}ms)...`);
  const state = await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.filter((s: FacadeState) => s.dust.availableCoins.length >= minCoins),
      Rx.take(1),
      Rx.timeout({
        each: timeoutMs,
        with: () => Rx.throwError(() => new Error(`No spendable DUST coin within ${timeoutMs}ms`)),
      }),
    ),
  );
  if (indexerHttpUrl) {
    logger.info(`Waiting for >=${formatDust(MIN_DUST_SPECKS)} DUST at the latest block...`);
    let latest = state;
    let lastLogged = 0;
    for (;;) {
      const blockTime = await latestBlockTime(indexerHttpUrl, Math.min(10_000, deadline - Date.now()));
      const balance = blockTime ? latest.dust.balance(blockTime) : 0n;
      if (balance >= MIN_DUST_SPECKS) break;
      if (Date.now() > deadline) {
        throw new Error(
          `DUST at ${formatDust(balance)}, below ${formatDust(MIN_DUST_SPECKS)}, after ${timeoutMs}ms`,
        );
      }
      if (Date.now() - lastLogged >= 60_000) {
        logger.info(`  DUST ${formatDust(balance)} / ${formatDust(MIN_DUST_SPECKS)}`);
        lastLogged = Date.now();
      }
      await new Promise((r) => setTimeout(r, 5_000));
      latest = await Rx.firstValueFrom(wallet.state());
    }
  }
  logger.info('DUST ready.');
}

export interface FundingGateOptions {
  /**
   * Register the wallet's NIGHT for DUST generation (default true). Pass false
   * for a wallet that must hold NIGHT but no DUST, such as a sponsored user.
   */
  registerDust?: boolean;
  /** Names the wallet in log lines. */
  label?: string;
}

/**
 * Hold until the wallet can pay for transactions on a remote network. Returns
 * at once when it already can, so only a new wallet sees the faucet prompt.
 */
export async function waitForNightThenDust(
  logger: Logger,
  wallet: WalletFacade,
  keystore: UnshieldedKeystore,
  envConfig: EnvironmentConfiguration,
  faucet: string,
  { registerDust = true, label = 'wallet' }: FundingGateOptions = {},
): Promise<void> {
  const address = String(keystore.getBech32Address());
  // Bounded peek: if state() hasn't emitted yet, assume "not funded" and fall
  // into the wait below, which has its own timeout.
  const current = await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.timeout({ each: 30_000, with: () => Rx.of(null) }),
      Rx.catchError(() => Rx.of(null)),
    ),
  );
  // Mainnet: DUST can come from cNIGHT held on Cardano (registered through the
  // cNgD DApp to this wallet's DUST address), with no NIGHT on Midnight at all.
  const hasDust = (s: FacadeState) => s.dust.balance(new Date()) > 0n;
  if (registerDust && current !== null && hasDust(current)) {
    logger.info(`${label}: DUST available; ready.`);
    return;
  }
  if (current === null || !hasNight(current)) {
    logger.info(`Fund ${label} with NIGHT (or register cNIGHT for DUST to its DUST address); the run continues once either arrives.`);
    logger.info(`  faucet/help: ${faucet}`);
    logger.info(`  address: ${address}`);
    if (current !== null) logger.info(`  DUST address: ${MidnightBech32m.encode(envConfig.networkId, current.dust.address).asString()}`);
    if (!registerDust) logger.info('  This wallet must NOT have DUST delegated: send tNIGHT only.');
    await Rx.firstValueFrom(
      wallet.state().pipe(
        Rx.filter((s) => hasNight(s) || (registerDust && hasDust(s))),
        Rx.take(1),
        Rx.timeout({
          each: FUND_TIMEOUT_MS,
          with: () => Rx.throwError(() => new Error(`No NIGHT at ${address} within ${FUND_TIMEOUT_MS}ms`)),
        }),
      ),
    );
  }

  const afterWait = await Rx.firstValueFrom(wallet.state());
  if (registerDust && hasDust(afterWait) && !hasNight(afterWait)) {
    logger.info(`${label}: DUST available (cNIGHT-backed); ready.`);
    return;
  }

  if (!registerDust) {
    logger.info(`${label}: NIGHT present; not registering it for DUST, by design.`);
    return;
  }

  const state = await Rx.firstValueFrom(wallet.state());
  const night = unshieldedToken().raw;
  const unregistered = state.unshielded.availableCoins.filter(
    (coin) => coin.utxo.type === night && !coin.meta.registeredForDustGeneration,
  );
  if (state.dust.balance(new Date()) === 0n && unregistered.length > 0) {
    logger.info(`${label}: registering ${unregistered.length} NIGHT UTXO(s) for DUST generation...`);
    const recipe = await wallet.registerNightUtxosForDustGeneration(
      unregistered,
      keystore.getPublicKey(),
      (payload) => keystore.signDataAsync(payload),
    );
    const txId = await wallet.submitTransaction(await wallet.finalizeRecipe(recipe));
    logger.info(`${label}: DUST registration submitted (${txId}).`);
  }
  await waitForDust(logger, wallet, 1, FUND_TIMEOUT_MS, envConfig.indexer);
  logger.info(`${label}: funded and ready.`);
}
