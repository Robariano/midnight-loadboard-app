// Read one transaction's label-8420 metadata and sender addresses from Koios,
// a public Cardano API that Nightlane doesn't run. Used by /api/verify-tx
// (the /verify/how checker) and by the AI tools at /api/mcp.
const KOIOS = {
  mainnet: "https://api.koios.rest/api/v1",
  preprod: "https://preprod.koios.rest/api/v1",
};

// Nightlane's record wallet(s). A record only counts as Nightlane's if the
// transaction was sent from one of these.
export const NIGHTLANE_WALLETS = {
  mainnet: ["addr1qytk2zvppcytejkh09p358qkn6mm3fxc2vg2qlehj6kexj50qpvpl7qvswxtuj4g7vawuq98qpd452akzulurtfyrzss5mpx8p"],
  preprod: [],
};

export class KoiosError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function koiosTx(tx, network = "mainnet") {
  const net = network === "preprod" ? "preprod" : "mainnet";
  const hash = String(tx || "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(hash)) throw new KoiosError("That isn't a transaction hash.", 400);
  let res;
  try {
    res = await fetch(`${KOIOS[net]}/tx_info`, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ _tx_hashes: [hash], _inputs: true, _metadata: true }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
  } catch {
    throw new KoiosError("Couldn't reach Koios right now. Try again, or copy it from Cardanoscan.", 502);
  }
  if (!res.ok) throw new KoiosError(`Koios answered ${res.status}. Try again, or copy it from Cardanoscan.`, 502);
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) throw new KoiosError("Cardano doesn't show that transaction (yet).", 404);
  const metadata = row.metadata?.["8420"] ?? null;
  if (!metadata) throw new KoiosError("That transaction has nothing under label 8420.", 404);
  const senders = [...new Set((row.inputs || []).map((i) => i?.payment_addr?.bech32).filter(Boolean))];
  return { network: net, tx: hash, metadata, senders, blockTime: row.tx_timestamp ? new Date(row.tx_timestamp * 1000).toISOString() : null };
}
