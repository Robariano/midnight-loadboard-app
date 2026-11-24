import { flushBatch } from "../../../../lib/cardanoBatch";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

// Writes any carrier checks still waiting in the Cardano queue, one batch
// transaction at a time. The daily Authority Watch cron does the same at the
// end of its run; this route lets it be run by hand (with CRON_SECRET), e.g.
// curl -H "Authorization: Bearer $CRON_SECRET" https://www.nightlaneloads.com/api/cron/cardano-batch
export async function GET(req) {
  if (!isAuthorized(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const started = Date.now();
  const batches = [];
  try {
    while (Date.now() - started < 40_000) {
      const res = await flushBatch();
      if (!res.written) break;
      batches.push({ written: res.written, txHash: res.txHash, fee: res.fee });
    }
    return Response.json({ ok: true, batches });
  } catch (e) {
    return Response.json({ ok: false, batches, error: String(e.message).slice(0, 300) }, { status: 500 });
  }
}
