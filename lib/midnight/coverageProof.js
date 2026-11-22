// Reads Nightlane's coverage-proof contract on Midnight (read-only).
//
// A carrier proves "my insurance meets this broker's minimum through this
// date" without sharing its COI (midnight/coverage-proof). This module lets
// the website show those answers: it fetches the contract's public state from
// a Midnight indexer and decodes it with the compiled contract. No wallet, no
// fees, nothing private.
import { createHash } from "node:crypto";
import { ContractState } from "@midnight-ntwrk/compact-runtime";
import { ledger } from "./coverage-proof-contract/index.js";

const NETWORKS = {
  preview: {
    indexer: "https://indexer.preview.midnight.network/api/v4/graphql",
    contractAddress: "9ccc58c5193805c62f09e8d596e450c8996220a8d7391587f0467fd5cfc94e99",
  },
  // Deployed 11/21/2026. The indexer needs a Blockfrost Midnight Mainnet key,
  // so MIDNIGHT_COVERAGE_INDEXER must be set (it is never committed).
  mainnet: {
    indexer: null,
    contractAddress: "8d75b4b12ee4239e0c07c59d54bcaf52b87dec4341097ef7bd309e769be873f6",
  },
};

export function coverageConfig(env = process.env) {
  const network = env.MIDNIGHT_COVERAGE_NETWORK || "preview";
  const base = NETWORKS[network] || {};
  return {
    network,
    indexer: env.MIDNIGHT_COVERAGE_INDEXER || base.indexer,
    contractAddress: env.MIDNIGHT_COVERAGE_CONTRACT || base.contractAddress,
  };
}

// Same id the CLI and coverage requests use: SHA-256 of the request text,
// trimmed, lower-cased, with runs of spaces collapsed.
export function requestIdOf(text) {
  const norm = String(text).trim().replace(/\s+/g, " ").toLowerCase();
  return new Uint8Array(createHash("sha256").update(norm).digest());
}

const QUERY = "query($a: HexEncoded!) { contract(address: $a) { state } }";

async function fetchLedger(config) {
  if (!config.indexer) throw new Error(`No Midnight indexer set for ${config.network}.`);
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

const toProof = (p) => ({
  dot: String(p.dot),
  minLiability: Number(p.minLiability),
  minCargo: Number(p.minCargo),
  coveredThrough: new Date(Number(p.coveredThrough) * 1000).toISOString().slice(0, 10),
  attestorId: Number(p.attestorId),
});

// { found, proof } for one request, plus how many requests are answered.
export async function checkCoverageRequest(text, { env = process.env } = {}) {
  const config = coverageConfig(env);
  const state = await fetchLedger(config);
  const id = requestIdOf(text);
  const found = state.proofs.member(id);
  return { config, total: Number(state.proofs.size()), found, proof: found ? toProof(state.proofs.lookup(id)) : null };
}

export async function coverageStats({ env = process.env } = {}) {
  const config = coverageConfig(env);
  const state = await fetchLedger(config);
  return { config, total: Number(state.proofs.size()), attestors: Number(state.attestors.size()) };
}
