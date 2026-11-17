// Backup reader for Nightlane's Cardano records, using a Dandelion node's
// Cardano GraphQL MKII API (https://github.com/GameChangerFinance/dandelion-lite).
// Blockfrost stays the main source; the verify page falls back to this when
// Blockfrost is down or over its limit, so records stay readable either way.
//
// Preprod uses GameChanger's public Dandelion node by default. Set
// DANDELION_GRAPHQL_URL to use another node (required for mainnet, which has
// no default here).
const DEFAULT_GRAPHQL = {
  preprod: "https://ar03a.gamechanger.finance:2096/cardano-graphql-mk2/graphql",
};
// Every value goes in as a GraphQL variable, so the query text itself is
// fixed and nothing a visitor types can change it.
const LABEL = "8420";

export function dandelionUrl(network, env = process.env) {
  return env.DANDELION_GRAPHQL_URL || DEFAULT_GRAPHQL[network] || null;
}

async function gql(url, query, variables, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
      signal: ctrl.signal,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.errors) {
      const msg = json?.errors?.[0]?.message || `HTTP ${res.status}`;
      throw new Error(`Dandelion GraphQL failed: ${msg}`);
    }
    return json.data;
  } finally {
    clearTimeout(timer);
  }
}

// The API returns timestamps without a zone; they are UTC.
const toIso = (t) => (t ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(t) ? t : `${t}Z`).toISOString() : null);

const BY_DOT = `query NightlaneByDot($label: Word64Type!, $match: JSON!, $limit: Int) {
  transactions(limit: $limit, order_by: INCLUDED_AT_DESC, where: {
    transactionMetadata: { _some: { _and: [{ key: { _eq: $label } }, { value: { contains: $match } }] } }
  }) {
    hash
    includedAt
    inputs { address }
    metadata(where: { key: { _eq: $label } }) { value }
  }
}`;

// Nightlane records for one DOT, newest first, as { txHash, md, blockTime,
// fromNightlane }. The caller still checks each fingerprint.
export async function dandelionRecordsForDot({ network, dot, walletBech32, max = 10, env = process.env }) {
  const url = dandelionUrl(network, env);
  if (!url) throw new Error("No Dandelion GraphQL node is set for this network.");
  const data = await gql(url, BY_DOT, { label: LABEL, match: { app: "nightlane", dot: String(dot).replace(/\D/g, "") }, limit: max });
  return (data?.transactions || []).map((t) => {
    const md = (t.metadata || []).map((m) => m.value).find((v) => v?.app === "nightlane" && String(v.dot) === String(dot));
    const inputs = t.inputs || [];
    return {
      txHash: t.hash,
      md,
      blockTime: toIso(t.includedAt),
      fromNightlane: inputs.length > 0 && inputs.every((i) => i.address === walletBech32),
    };
  }).filter((r) => r.md);
}

const FROM_WALLET = `query NightlaneFromWallet($label: Word64Type!, $app: JSON!, $wallet: String!, $limit: Int) {
  transactions(limit: $limit, where: { _and: [
    { transactionMetadata: { _some: { _and: [{ key: { _eq: $label } }, { value: { contains: $app } }] } } },
    { inputs: { _some: { address: { _eq: $wallet } } } }
  ] }) {
    metadata(where: { key: { _eq: $label } }) { value }
  }
}`;

// Counts for the verify page: records sent from Nightlane's wallet and the
// number of different carriers they cover.
export async function dandelionStats({ network, walletBech32, env = process.env, limit = 5000 }) {
  const url = dandelionUrl(network, env);
  if (!url) throw new Error("No Dandelion GraphQL node is set for this network.");
  const data = await gql(url, FROM_WALLET, { label: LABEL, app: { app: "nightlane" }, wallet: walletBech32, limit });
  let records = 0;
  const carriers = new Set();
  for (const t of data?.transactions || []) {
    const md = (t.metadata || []).map((m) => m.value).find((v) => v?.app === "nightlane");
    if (!md) continue;
    records++;
    carriers.add(String(md.dot));
  }
  return { records, carriers: carriers.size };
}
