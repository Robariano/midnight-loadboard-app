import { lookupCarrierByDot } from "../../../../lib/fmcsa";
import { recordCheckIfNeeded } from "../../../../lib/cardanoRecord";
import { fingerprintSnapshot } from "../../../../lib/carrierFingerprint";
import { watchStatus } from "../../../../lib/authorityWatch";
import { isCoverageWorker } from "../../../../lib/midnight/coverageRequests";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Fresh FMCSA check for Nightlane's proving worker. The worker copies the
// result into the coverage contract on Midnight (setAuthority / clearAuthority)
// before it makes an insurance proof, so a proof means authorized AND insured.
// The same check is written publicly on Cardano (label 8420) as usual.
export async function GET(req) {
  if (!isCoverageWorker(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const dot = String(new URL(req.url).searchParams.get("dot") || "").replace(/\D/g, "");
  if (!dot) return Response.json({ error: "dot is required" }, { status: 400 });

  let snapshot = null;
  try {
    snapshot = await lookupCarrierByDot(dot);
  } catch (e) {
    return Response.json({ error: `FMCSA lookup failed: ${e?.message || e}` }, { status: 502 });
  }
  if (!snapshot) return Response.json({ dot, found: false, active: false, reasons: ["FMCSA has no record for this DOT"] });

  const s = watchStatus(snapshot);
  const reasons = [
    !s.allowToOperate && "FMCSA does not show the carrier allowed to operate",
    s.outOfService && "FMCSA shows an out-of-service order",
    s.propertyAuthority === false && "FMCSA does not show active for-hire (property) authority",
  ].filter(Boolean);

  const fp = fingerprintSnapshot(snapshot);
  const cardano = await recordCheckIfNeeded(snapshot).catch(() => null);
  return Response.json({
    dot,
    found: true,
    active: reasons.length === 0,
    reasons,
    checkedAt: Math.floor(Date.now() / 1000),
    checkedOn: fp.record.checkedOn,
    sha256: fp.hash,
    cardano,
  });
}
