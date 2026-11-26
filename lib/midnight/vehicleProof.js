// Reads Nightlane's vehicle-proof contract on Midnight (read-only): "this van
// (by VIN) is on the carrier's policy through this date". Same indexer and
// network settings as the coverage proof (coverageProof.js).
import { ContractState } from "@midnight-ntwrk/compact-runtime";
import { ledger, pureCircuits } from "./vehicle-proof-contract/index.js";
import { coverageConfig, requestIdOf } from "./coverageProof.js";

// Deployed 11/26/2026 on mainnet. No preview deployment.
const ADDRESSES = {
  mainnet: "1625d818d6353fa1abd9d5105f7fe675c4afbc1281ba390ddcff506643ca99cc",
};

export function vehicleConfig(env = process.env) {
  const base = coverageConfig(env);
  return { ...base, contractAddress: env.MIDNIGHT_VEHICLE_CONTRACT || ADDRESSES[base.network] || null };
}

/** Upper-cased, validated 17-character VIN, or null. */
export function normalizeVin(vin) {
  const v = String(vin || "").trim().toUpperCase().replace(/\s+/g, "");
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(v) ? v : null;
}

/** The same commitment the contract stores (hex). */
export function vinCommitmentHex(vin) {
  const v = normalizeVin(vin);
  if (!v) return null;
  return Buffer.from(pureCircuits.vinCommitment(new Uint8Array(Buffer.from(v, "ascii")))).toString("hex");
}

const QUERY = "query($a: HexEncoded!) { contract(address: $a) { state } }";

async function fetchLedger(config) {
  if (!config.indexer) throw new Error(`No Midnight indexer set for ${config.network}.`);
  if (!config.contractAddress) throw new Error(`No vehicle-proof contract on ${config.network}.`);
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

// { found, proof } for one request on the vehicle contract.
export async function checkVehicleRequest(text, { env = process.env } = {}) {
  const config = vehicleConfig(env);
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
      vinCommitment: Buffer.from(p.vinCommitment).toString("hex"),
      coveredThrough: new Date(Number(p.coveredThrough) * 1000).toISOString().slice(0, 10),
      attestorId: Number(p.attestorId),
    },
  };
}
