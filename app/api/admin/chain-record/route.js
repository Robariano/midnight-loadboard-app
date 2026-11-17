import { isAdminRequest } from "../../../../lib/admin-auth";
import { lookupCarrierByDot } from "../../../../lib/fmcsa";
import { fingerprintSnapshot } from "../../../../lib/carrierFingerprint";
import { cardanoConfig, recordOnCardano, splitWalletCoins, listRecordsForDot, recordStats, cardanoHealth } from "../../../../lib/cardanoRecord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only, for testing the Cardano records before anything is public.
// GET  ?dot=123  -> the fingerprint Nightlane would record (no blockchain call)
// GET  ?compare=1&dot=123 -> read that carrier's records and the counts from
//                   both Blockfrost and the Dandelion backup, side by side
// POST {dot}     -> checks the carrier now and records the fingerprint on
//                   Cardano (only when CARDANO_* and BLOCKFROST_* are set)
async function snapshotFor(dot) {
  const clean = String(dot || "").replace(/\D/g, "");
  if (!clean) throw Object.assign(new Error("Send a DOT number."), { status: 400 });
  const snap = await lookupCarrierByDot(clean);
  if (!snap) throw Object.assign(new Error("FMCSA has no carrier with that DOT number."), { status: 404 });
  return snap;
}

export async function GET(req) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const params = new URL(req.url).searchParams;
    if (params.get("health")) return Response.json(await cardanoHealth());
    if (params.get("compare")) {
      const dot = String(params.get("dot") || "").replace(/\D/g, "");
      const run = async (fn) => {
        const t = Date.now();
        try { const out = await fn(); return { ok: true, ms: Date.now() - t, ...out }; } catch (e) { return { ok: false, ms: Date.now() - t, error: e.message }; }
      };
      const summary = (r) => ({ source: r.source, count: r.records?.length, records: (r.records || []).map((x) => ({ tx: x.txHash, on: x.checkedOn, fromNightlane: x.fromNightlane, hashMatches: x.hashMatches, blockTime: x.blockTime })) });
      const [bf, dd, bfStats, ddStats] = await Promise.all([
        dot ? run(async () => summary(await listRecordsForDot(dot, { source: "blockfrost" }))) : null,
        dot ? run(async () => summary(await listRecordsForDot(dot, { source: "dandelion" }))) : null,
        run(async () => ({ stats: await recordStats({ source: "blockfrost" }) })),
        run(async () => ({ stats: await recordStats({ source: "dandelion" }) })),
      ]);
      return Response.json({ dot, blockfrost: { records: bf, stats: bfStats }, dandelion: { records: dd, stats: ddStats } });
    }
    const snap = await snapshotFor(params.get("dot"));
    const { record, hash } = fingerprintSnapshot(snap);
    const { enabled, network, problems } = cardanoConfig();
    return Response.json({ record, hash, cardano: { enabled, network, problems } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(req) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === "split") return Response.json(await splitWalletCoins({ count: Math.min(Number(body.count) || 20, 40) }));
    const snap = await snapshotFor(body.dot);
    const fp = fingerprintSnapshot(snap);
    const result = await recordOnCardano(fp);
    return Response.json({ ...fp, cardano: result });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
