// Public: fetch one transaction's label-8420 metadata and sender addresses
// from Koios (a public Cardano API Nightlane doesn't run), so the
// /verify/how checker can do the "copy from an explorer" step for the
// visitor. We only relay what Koios returns; the fingerprint is still
// computed in the visitor's browser.
import { koiosTx, KoiosError } from "../../../lib/koios";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const url = new URL(req.url);
  const network = url.searchParams.get("network") === "preprod" ? "preprod" : "mainnet";
  try {
    const { tx, metadata, senders } = await koiosTx(url.searchParams.get("tx"), network);
    return Response.json(
      { source: "koios", network, tx, metadata: { "8420": metadata }, senders },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch (e) {
    const status = e instanceof KoiosError ? e.status : 502;
    return Response.json({ error: e.message || "Couldn't reach Koios right now." }, { status });
  }
}
