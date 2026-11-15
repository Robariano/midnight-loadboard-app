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

// The metadata we attach. Cardano metadata strings max out at 64 bytes; a
// SHA-256 hex hash is exactly 64.
export function recordMetadata({ hash, record }) {
  return {
    app: "nightlane",
    kind: "carrier-check",
    v: record.v,
    dot: record.dot,
    on: record.checkedOn,
    sha256: hash,
  };
}

// Pure transaction building (no network), so it can be tested offline.
// params: Blockfrost /epochs/latest/parameters shape. utxos: Blockfrost
// /addresses/{addr}/utxos shape.
export function buildSignedRecordTx({ wallet, params, utxos, metadata }) {
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
  tb.add_inputs_from(inputs, CSL.CoinSelectionStrategyCIP2.LargestFirst);

  const general = CSL.GeneralTransactionMetadata.new();
  general.insert(
    CSL.BigNum.from_str(String(METADATA_LABEL)),
    CSL.encode_json_str_to_metadatum(JSON.stringify(metadata), CSL.MetadataJsonSchema.BasicConversions),
  );
  const aux = CSL.AuxiliaryData.new();
  aux.set_metadata(general);
  tb.set_auxiliary_data(aux);

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
  const { cbor, txHash, fee } = buildSignedRecordTx({ wallet, params, utxos, metadata: recordMetadata({ hash, record }) });
  await blockfrost(config, "/tx/submit", { method: "POST", headers: { "Content-Type": "application/cbor" }, body: cbor });
  return { txHash, fee, network: config.network, url: explorerUrl(config.network, txHash) };
}
