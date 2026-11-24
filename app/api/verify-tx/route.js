// Public: fetch one transaction's label-8420 metadata and sender addresses
// from Koios (a public Cardano API Nightlane doesn't run), so the
// /verify/how checker can do the "copy from an explorer" step for the
// visitor. We only relay what Koios returns; the fingerprint is still
// computed in the visitor's browser.
const KOIOS = {
  mainnet: "https://api.koios.rest/api/v1",
  preprod: "https://preprod.koios.rest/api/v1",
};

export const dynamic = "force-dynamic";

export async function GET(req) {
  const url = new URL(req.url);
  const tx = (url.searchParams.get("tx") || "").toLowerCase();
  const network = url.searchParams.get("network") === "preprod" ? "preprod" : "mainnet";
  if (!/^[0-9a-f]{64}$/.test(tx)) return Response.json({ error: "That isn't a transaction hash." }, { status: 400 });

  try {
    const res = await fetch(`${KOIOS[network]}/tx_info`, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ _tx_hashes: [tx], _inputs: true, _metadata: true }),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!res.ok) return Response.json({ error: `Koios answered ${res.status}. Try again, or copy it from Cardanoscan.` }, { status: 502 });
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return Response.json({ error: "Cardano doesn't show that transaction (yet)." }, { status: 404 });
    const metadata = row.metadata?.["8420"] ?? null;
    if (!metadata) return Response.json({ error: "That transaction has nothing under label 8420." }, { status: 404 });
    const senders = [...new Set((row.inputs || []).map((i) => i?.payment_addr?.bech32).filter(Boolean))];
    return Response.json(
      { source: "koios", network, tx, metadata: { "8420": metadata }, senders },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch {
    return Response.json({ error: "Couldn't reach Koios right now. Try again, or copy it from Cardanoscan." }, { status: 502 });
  }
}
