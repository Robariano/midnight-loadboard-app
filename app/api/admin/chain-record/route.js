import { isAdminRequest } from "../../../../lib/admin-auth";
import { lookupCarrierByDot } from "../../../../lib/fmcsa";
import { fingerprintSnapshot } from "../../../../lib/carrierFingerprint";
import { cardanoConfig, recordOnCardano } from "../../../../lib/cardanoRecord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only, for testing the Cardano records before anything is public.
// GET  ?dot=123  -> the fingerprint Nightlane would record (no blockchain call)
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
    const snap = await snapshotFor(new URL(req.url).searchParams.get("dot"));
    const { record, hash } = fingerprintSnapshot(snap);
    const { enabled, network } = cardanoConfig();
    return Response.json({ record, hash, cardano: { enabled, network } });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}

export async function POST(req) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json().catch(() => ({}));
    const snap = await snapshotFor(body.dot);
    const fp = fingerprintSnapshot(snap);
    const result = await recordOnCardano(fp);
    return Response.json({ ...fp, cardano: result });
  } catch (e) {
    return Response.json({ error: e.message }, { status: e.status || 500 });
  }
}
