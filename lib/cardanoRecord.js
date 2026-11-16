// Writes a carrier-check fingerprint (lib/carrierFingerprint.js) onto the
// Cardano blockchain as transaction metadata, so anyone can later prove the
// check happened on that date and hasn't been changed.
//
// OFF unless these are set (in Vercel, typed in by Rob himself):
//   CARDANO_NETWORK        "preprod" (free test network) or "mainnet"
//   BLOCKFROST_PROJECT_ID  from blockfrost.io, for the same network
//   CARDANO_WALLET_MNEMONIC  the site wallet's recovery words (a small,
//                            separate wallet used only for these records)
//
// Each record is a tiny transaction that sends the wallet's own funds back to
// itself with the fingerprint attached; the only cost is the network fee
// (a fraction of a dollar on mainnet, free test ADA on preprod).
import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";
import { mnemonicToEntropy } from "bip39";
import { fingerprintRecord } from "./carrierFingerprint";

// Metadata label for Nightlane records. Arbitrary but fixed, so explorers and
// our own verifier can find them.
export const METADATA_LABEL = 8420;

const BLOCKFROST = {
  preprod: "https://cardano-preprod.blockfrost.io/api/v0",
  mainnet: "https://cardano-mainnet.blockfrost.io/api/v0",
};
const EXPLORER = {
  preprod: "https://preprod.cardanoscan.io/transaction/",
  mainnet: "https://cardanoscan.io/transaction/",
};

export function cardanoConfig(env = process.env) {
  const network = env.CARDANO_NETWORK === "mainnet" ? "mainnet" : env.CARDANO_NETWORK === "preprod" ? "preprod" : null;
  // Pasted values sometimes carry extra page text; keep only the key itself
  // (Blockfrost keys are the network name plus 32 letters/digits) and only the
  // recovery words.
  const rawId = String(env.BLOCKFROST_PROJECT_ID || "");
  const projectId = (rawId.match(/\b(?:preprod|preview|mainnet)[A-Za-z0-9]{32}\b/) || [null])[0];
  const words = String(env.CARDANO_WALLET_MNEMONIC || "").toLowerCase().match(/[a-z]+/g) || [];
  const mnemonic = [12, 15, 18, 21, 24].includes(words.length) ? words.join(" ") : null;
  return {
    enabled: !!(network && projectId && mnemonic), network, projectId, mnemonic,
    problems: [
      !network && "CARDANO_NETWORK should be preprod or mainnet",
      !projectId && "BLOCKFROST_PROJECT_ID doesn't contain a Blockfrost key",
      !mnemonic && `CARDANO_WALLET_MNEMONIC should be 12-24 words (found ${words.length})`,
    ].filter(Boolean),
  };
}

export function explorerUrl(network, txHash) {
  return `${EXPLORER[network] || EXPLORER.preprod}${txHash}`;
}

// Standard Cardano wallet keys (CIP-1852, account 0, first address), the same
// address Eternl, Lace or GameChanger shows for these recovery words.
export function walletFromMnemonic(mnemonic, network) {
  const entropy = Buffer.from(mnemonicToEntropy(mnemonic.trim().split(/\s+/).join(" ")), "hex");
  const root = CSL.Bip32PrivateKey.from_bip39_entropy(entropy, Buffer.from(""));
  const harden = (n) => 0x80000000 + n;
  const account = root.derive(harden(1852)).derive(harden(1815)).derive(harden(0));
  const paymentKey = account.derive(0).derive(0);
  const stakeKey = account.derive(2).derive(0);
  const networkId = network === "mainnet" ? CSL.NetworkInfo.mainnet().network_id() : CSL.NetworkInfo.testnet_preprod().network_id();
  const address = CSL.BaseAddress.new(
    networkId,
    CSL.Credential.from_keyhash(paymentKey.to_public().to_raw_key().hash()),
    CSL.Credential.from_keyhash(stakeKey.to_public().to_raw_key().hash()),
  ).to_address();
  return { address, bech32: address.to_bech32(), signingKey: paymentKey.to_raw_key() };
}

// The metadata we attach: the record's facts (so anyone can recompute the
// fingerprint) plus the fingerprint itself. Cardano metadata has no booleans
// or nulls and caps strings at 64 bytes, so flags are 1/0, long names are
// split into chunks, and empty values are left out.
const chunk = (str, size = 60) => (str.match(new RegExp(`.{1,${size}}`, "g")) || []);

export function recordMetadata({ hash, record }) {
  const facts = {
    v: record.v,
    name: chunk(record.name),
    allowed: record.allowedToOperate ? 1 : 0,
    oos: record.outOfService ? 1 : 0,
    auth: record.authorities.map((a) => String(a).slice(0, 60)),
    authUnknown: record.authorityUnknown ? 1 : 0,
    cargo: record.cargoInsurance ? 1 : 0,
  };
  if (record.bipdInsurance !== null && record.bipdInsurance !== undefined) facts.bipd = record.bipdInsurance;
  if (record.powerUnits !== null && record.powerUnits !== undefined) facts.pu = record.powerUnits;
  return { app: "nightlane", kind: "carrier-check", dot: record.dot, on: record.checkedOn, sha256: hash, facts };
}

// Rebuild the exact record that was hashed from on-chain metadata, or null for
// early records that carried only the fingerprint.
export function recordFromMetadata(md) {
  const f = md?.facts;
  if (!f) return null;
  return {
    v: Number(f.v),
    dot: String(md.dot),
    name: (Array.isArray(f.name) ? f.name : [f.name || ""]).join(""),
    allowedToOperate: Number(f.allowed) === 1,
    outOfService: Number(f.oos) === 1,
    authorities: Array.isArray(f.auth) ? f.auth.map(String) : [],
    authorityUnknown: Number(f.authUnknown) === 1,
    bipdInsurance: f.bipd === undefined ? null : f.bipd,
    cargoInsurance: Number(f.cargo) === 1,
    powerUnits: f.pu === undefined ? null : Number(f.pu),
    checkedOn: String(md.on),
  };
}

// Pure transaction building (no network), so it can be tested offline.
// params: Blockfrost /epochs/latest/parameters shape. utxos: Blockfrost
// /addresses/{addr}/utxos shape.
export function buildSignedRecordTx({ wallet, params, utxos, metadata, pickRandom = true, extraOutputs = [] }) {
  const cfg = CSL.TransactionBuilderConfigBuilder.new()
    .fee_algo(CSL.LinearFee.new(CSL.BigNum.from_str(String(params.min_fee_a)), CSL.BigNum.from_str(String(params.min_fee_b))))
    .pool_deposit(CSL.BigNum.from_str(String(params.pool_deposit)))
    .key_deposit(CSL.BigNum.from_str(String(params.key_deposit)))
    .max_value_size(Number(params.max_val_size))
    .max_tx_size(Number(params.max_tx_size))
    .coins_per_utxo_byte(CSL.BigNum.from_str(String(params.coins_per_utxo_size ?? params.coins_per_utxo_word)))
    .build();
  const tb = CSL.TransactionBuilder.new(cfg);

  const inputs = CSL.TransactionUnspentOutputs.new();
  for (const u of utxos) {
    const lovelace = (u.amount || []).find((a) => a.unit === "lovelace");
    if (!lovelace) continue;
    // Only plain-ADA outputs, so we never move tokens by accident.
    if ((u.amount || []).length !== 1) continue;
    const input = CSL.TransactionInput.new(CSL.TransactionHash.from_hex(u.tx_hash), u.output_index ?? u.tx_index);
    const output = CSL.TransactionOutput.new(wallet.address, CSL.Value.new(CSL.BigNum.from_str(String(lovelace.quantity))));
    inputs.add(CSL.TransactionUnspentOutput.new(input, output));
  }
  if (inputs.len() === 0) throw new Error("The record wallet has no plain ADA to pay the network fee.");
  if (pickRandom) {
    // Spend one random coin (of at least 1.5 ADA) instead of the biggest, so
    // records made seconds apart don't all try to spend the same coin.
    const usable = [];
    for (let i = 0; i < inputs.len(); i++) {
      const u = inputs.get(i);
      if (Number(u.output().amount().coin().to_str()) >= 1_500_000) usable.push(u);
    }
    if (usable.length === 0) throw new Error("The record wallet has no coin big enough for a record.");
    const u = usable[Math.floor(Math.random() * usable.length)];
    tb.add_regular_input(wallet.address, u.input(), u.output().amount());
  } else {
    tb.add_inputs_from(inputs, CSL.CoinSelectionStrategyCIP2.LargestFirst);
  }
  for (const out of extraOutputs) {
    tb.add_output(CSL.TransactionOutput.new(wallet.address, CSL.Value.new(CSL.BigNum.from_str(String(out)))));
  }

  if (metadata) {
  const general = CSL.GeneralTransactionMetadata.new();
  general.insert(
    CSL.BigNum.from_str(String(METADATA_LABEL)),
    CSL.encode_json_str_to_metadatum(JSON.stringify(metadata), CSL.MetadataJsonSchema.BasicConversions),
  );
  const aux = CSL.AuxiliaryData.new();
  aux.set_metadata(general);
  tb.set_auxiliary_data(aux);
  }

  tb.add_change_if_needed(wallet.address);
  const unsigned = tb.build_tx();

  const fixed = CSL.FixedTransaction.from_bytes(unsigned.to_bytes());
  fixed.sign_and_add_vkey_signature(wallet.signingKey);
  return { cbor: Buffer.from(fixed.to_bytes()), txHash: fixed.transaction_hash().to_hex(), fee: unsigned.body().fee().to_str() };
}

async function blockfrost(config, path, init = {}) {
  const res = await fetch(`${BLOCKFROST[config.network]}${path}`, {
    ...init,
    headers: { project_id: config.projectId, ...(init.headers || {}) },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Blockfrost ${path} failed (${res.status}): ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

// Full flow: fetch params and coins, build, sign, submit. Returns the
// transaction hash and an explorer link.
export async function recordOnCardano({ hash, record }, env = process.env) {
  const config = cardanoConfig(env);
  if (!config.enabled) return { skipped: true, reason: "Cardano recording is not set up.", problems: config.problems };
  const wallet = walletFromMnemonic(config.mnemonic, config.network);
  const [params, utxos] = await Promise.all([
    blockfrost(config, "/epochs/latest/parameters"),
    blockfrost(config, `/addresses/${wallet.bech32}/utxos?count=100`),
  ]);
  const metadata = recordMetadata({ hash, record });
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    // A coin just spent by another record may still look unspent for a few
    // seconds; a fresh random pick usually lands on a free one.
    const { cbor, txHash, fee } = buildSignedRecordTx({ wallet, params, utxos, metadata });
    try {
      await blockfrost(config, "/tx/submit", { method: "POST", headers: { "Content-Type": "application/cbor" }, body: cbor });
      return { txHash, fee, network: config.network, url: explorerUrl(config.network, txHash) };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

// Nightlane's records for one DOT number, newest first. Anyone can write
// metadata under any label, so each record only counts if (1) it was sent
// from Nightlane's own wallet and (2) its facts hash to its fingerprint.
export async function listRecordsForDot(dot, { max = 10, scanPages = 3, env = process.env } = {}) {
  const config = cardanoConfig(env);
  if (!config.enabled) return { enabled: false, records: [] };
  const clean = String(dot || "").replace(/\D/g, "");
  const wallet = walletFromMnemonic(config.mnemonic, config.network);
  const found = [];
  for (let page = 1; page <= scanPages && found.length < max; page++) {
    const rows = await blockfrost(config, `/metadata/txs/labels/${METADATA_LABEL}?order=desc&count=100&page=${page}`).catch((e) => {
      if (String(e.message).includes("(404)")) return [];
      throw e;
    });
    for (const row of rows || []) {
      const md = row.json_metadata;
      if (md?.app === "nightlane" && String(md.dot) === clean && !found.some((f) => f.txHash === row.tx_hash)) found.push({ txHash: row.tx_hash, md });
      if (found.length >= max) break;
    }
    if (!rows || rows.length < 100) break;
  }
  const records = await Promise.all(found.map(async ({ txHash, md }) => {
    const [utxos, tx] = await Promise.all([
      blockfrost(config, `/txs/${txHash}/utxos`),
      blockfrost(config, `/txs/${txHash}`),
    ]);
    const fromNightlane = (utxos?.inputs || []).length > 0 && utxos.inputs.every((i) => i.address === wallet.bech32);
    const record = recordFromMetadata(md);
    const hashMatches = record ? fingerprintRecord(record) === md.sha256 : null;
    return {
      txHash, url: explorerUrl(config.network, txHash), checkedOn: md.on, sha256: md.sha256,
      record, fromNightlane, hashMatches, blockTime: tx?.block_time ? new Date(tx.block_time * 1000).toISOString() : null,
    };
  }));
  return { enabled: true, network: config.network, wallet: wallet.bech32, records };
}

// Called after a public carrier check: record it on Cardano once per DOT per
// day, plus again whenever the carrier's facts change that day. On mainnet
// this only runs when CARDANO_AUTO_RECORD=1, since
// every record costs a real (small) fee. Never throws and gives up after a
// few seconds, so a slow network can't hold up the check itself.
// Records sent in the last few minutes, by "dot|date". A new record takes ~20-60s
// to show up in Blockfrost's metadata index, so without this a second check of
// the same carrier in that window would record it twice.
const recentSubmissions = new Map();
function rememberRecent(key, value) {
  recentSubmissions.set(key, { ...value, at: Date.now() });
  for (const [k, v] of recentSubmissions) if (Date.now() - v.at > 10 * 60 * 1000) recentSubmissions.delete(k);
}

export async function recordCheckIfNeeded(snapshot, { env = process.env, timeoutMs = 7000 } = {}) {
  const config = cardanoConfig(env);
  if (!config.enabled) return null;
  if (config.network === "mainnet" && env.CARDANO_AUTO_RECORD !== "1") return null;
  const work = (async () => {
    const { fingerprintSnapshot } = await import("./carrierFingerprint");
    const fp = fingerprintSnapshot(snapshot);
    const rows = await blockfrost(config, `/metadata/txs/labels/${METADATA_LABEL}?order=desc&count=100`).catch(() => []);
    // Skip only if today's record already holds these exact facts. If the
    // carrier's status changed since (authority pulled, insurance dropped),
    // the fingerprint differs and a new record is written right away.
    const today = (rows || []).find((r) => r.json_metadata?.app === "nightlane"
      && String(r.json_metadata.dot) === fp.record.dot && r.json_metadata.on === fp.record.checkedOn
      && r.json_metadata.sha256 === fp.hash);
    if (today) return { existing: true, txHash: today.tx_hash, url: explorerUrl(config.network, today.tx_hash) };
    const key = `${fp.record.dot}|${fp.record.checkedOn}|${fp.hash}`;
    const recent = recentSubmissions.get(key);
    if (recent && Date.now() - recent.at < 10 * 60 * 1000) return { existing: true, pending: true, txHash: recent.txHash, url: recent.url };
    const res = await recordOnCardano(fp, env);
    if (res.skipped) return null;
    rememberRecent(key, { txHash: res.txHash, url: res.url });
    statsCache = { at: 0, value: null };
    return { existing: false, txHash: res.txHash, url: res.url };
  })();
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));
  try {
    return await Promise.race([work.catch(() => null), timeout]);
  } catch {
    return null;
  }
}

// Usage numbers for the verify page: how many genuine Nightlane records exist
// and how many different carriers they cover. Counts only label-8420 records
// whose transaction came from Nightlane's wallet. Cached for 5 minutes per
// server instance to stay well inside Blockfrost's free limits.
let statsCache = { at: 0, value: null };
export async function recordStats({ env = process.env, maxPages = 10 } = {}) {
  if (statsCache.value && Date.now() - statsCache.at < 60 * 1000) return statsCache.value;
  const config = cardanoConfig(env);
  if (!config.enabled) return null;
  const wallet = walletFromMnemonic(config.mnemonic, config.network);
  const walletTxs = new Set();
  for (let page = 1; page <= maxPages; page++) {
    const rows = await blockfrost(config, `/addresses/${wallet.bech32}/transactions?count=100&page=${page}`).catch(() => []);
    for (const r of rows || []) walletTxs.add(r.tx_hash);
    if (!rows || rows.length < 100) break;
  }
  let records = 0;
  const carriers = new Set();
  for (let page = 1; page <= maxPages; page++) {
    const rows = await blockfrost(config, `/metadata/txs/labels/${METADATA_LABEL}?count=100&page=${page}`).catch(() => []);
    for (const r of rows || []) {
      if (r.json_metadata?.app === "nightlane" && walletTxs.has(r.tx_hash)) {
        records++;
        carriers.add(String(r.json_metadata.dot));
      }
    }
    if (!rows || rows.length < 100) break;
  }
  const value = { records, carriers: carriers.size, network: config.network };
  statsCache = { at: Date.now(), value };
  return value;
}

// One-time setup: split the wallet into many small coins (default 20 x 4 ADA)
// so several records can be written at the same moment.
export async function splitWalletCoins({ count = 20, lovelaceEach = 4_000_000, env = process.env } = {}) {
  const config = cardanoConfig(env);
  if (!config.enabled) return { skipped: true, problems: config.problems };
  const wallet = walletFromMnemonic(config.mnemonic, config.network);
  const [params, utxos] = await Promise.all([
    blockfrost(config, "/epochs/latest/parameters"),
    blockfrost(config, `/addresses/${wallet.bech32}/utxos?count=100`),
  ]);
  const { cbor, txHash, fee } = buildSignedRecordTx({
    wallet, params, utxos, metadata: null, pickRandom: false, extraOutputs: Array(count).fill(lovelaceEach),
  });
  await blockfrost(config, "/tx/submit", { method: "POST", headers: { "Content-Type": "application/cbor" }, body: cbor });
  return { txHash, fee, coins: count, url: explorerUrl(config.network, txHash) };
}
