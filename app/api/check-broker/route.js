import { lookupCarrierByDot, lookupCarrierByMc } from "../../../lib/fmcsa";
import { checkRateLimit } from "../../../lib/rate-limit";

export async function POST(req) {
  const rateLimit = await checkRateLimit(req, "check_broker", { maxPerWindow: 15, windowMinutes: 60 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many checks from this network. Try again in ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const dotNumber = String(body.dot_number || "").trim();
  const mcNumber = String(body.mc_number || "").trim();

  if (!dotNumber && !mcNumber) {
    return Response.json({ error: "Enter a DOT or MC number to check." }, { status: 400 });
  }

  try {
    const snapshot = dotNumber
      ? await lookupCarrierByDot(dotNumber)
      : await lookupCarrierByMc(mcNumber);

    if (!snapshot) {
      return Response.json(
        { error: `No FMCSA record found for ${dotNumber ? "DOT " + dotNumber : "MC " + mcNumber}. Double-check the number.` },
        { status: 404 }
      );
    }

    // TEMPORARY DEBUG: also fetch and return the raw authority response so
    // we can see FMCSA's actual field names and fix the mapping correctly.
    // Remove this block once the fix is confirmed.
    const webKey = process.env.FMCSA_WEB_KEY;
    const rawRes = await fetch(
      `https://mobile.fmcsa.dot.gov/qc/services/carriers/${snapshot.dotNumber}/authority?webKey=${webKey}`,
      { headers: { Accept: "application/json" } }
    );
    const rawJson = await rawRes.json().catch(() => null);

    return Response.json({ snapshot, _debug_raw_authority: rawJson });
  } catch (err) {
    return Response.json({ error: "Couldn't reach FMCSA right now. Try again in a moment." }, { status: 502 });
  }
}
