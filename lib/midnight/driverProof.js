// Reads Nightlane's driver-proof contract on Midnight (read-only): "this
// driver is on the carrier's policy through this date". Same indexer and
// network settings as the coverage proof (coverageProof.js).
import { ContractState } from "@midnight-ntwrk/compact-runtime";
import { ledger, pureCircuits } from "./driver-proof-contract/index.js";
import { coverageConfig, requestIdOf } from "./coverageProof.js";

// Set MIDNIGHT_DRIVER_CONTRACT (or fill this in) after deploy:driver.
const ADDRESSES = {
  mainnet: null,
};

export function driverConfig(env = process.env) {
  const base = coverageConfig(env);
  return { ...base, contractAddress: env.MIDNIGHT_DRIVER_CONTRACT || ADDRESSES[base.network] || null };
}

/** Same normalization as the worker: ASCII, upper case, single spaces, 2-32 chars. */
export function normalizeDriverName(name) {
  const v = String(name || "").normalize("NFKD").replace(/[^\x20-\x7e]/g, "").trim().replace(/\s+/g, " ").toUpperCase();
  return v.length >= 2 && v.length <= 32 ? v : null;
}

/** The same commitment the contract stores (hex). */
export function nameCommitmentHex(name) {
  const v = normalizeDriverName(name);
  if (!v) return null;
  const bytes = new Uint8Array(32);
  bytes.set(Buffer.from(v, "ascii"));
  return Buffer.from(pureCircuits.nameCommitment(bytes)).toString("hex");
}

const QUERY = "query($a: HexEncoded!) { contract(address: $a) { state } }";

async function fetchLedger(config) {
  if (!config.indexer) throw new Error(`No Midnight indexer set for ${config.network}.`);
  if (!config.contractAddress) throw new Error(`No driver-proof contract on ${config.network}.`);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(config.indexer, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: QUERY, variables: { a: config.contractAddress } }),
      cache: "no-store",
      signal: ctrl.signal,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.errors) throw new Error(json?.errors?.[0]?.message || `HTTP ${res.status}`);
    const hex = json.data?.contract?.state;
    if (!hex) throw new Error("Contract not found on the indexer.");
    return ledger(ContractState.deserialize(Buffer.from(hex, "hex")).data);
  } finally {
    clearTimeout(timer);
  }
}

// { found, proof } for one request on the driver contract.
export async function checkDriverRequest(text, { env = process.env } = {}) {
  const config = driverConfig(env);
  if (!config.contractAddress) return { config, found: false, proof: null };
  const state = await fetchLedger(config);
  const id = requestIdOf(text);
  if (!state.proofs.member(id)) return { config, found: false, proof: null };
  const p = state.proofs.lookup(id);
  return {
    config,
    found: true,
    proof: {
      dot: String(p.dot),
      nameCommitment: Buffer.from(p.nameCommitment).toString("hex"),
      coveredThrough: new Date(Number(p.coveredThrough) * 1000).toISOString().slice(0, 10),
      attestorId: Number(p.attestorId),
    },
  };
}

// How many driver requests are answered (0 when there's no driver contract).
export async function driverStats({ env = process.env } = {}) {
  const config = driverConfig(env);
  if (!config.contractAddress) return { config, total: 0 };
  const state = await fetchLedger(config);
  return { config, total: Number(state.proofs.size()) };
}
