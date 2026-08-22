import { lookupCarrierByDot } from "../../../lib/fmcsa";
import { checkRateLimit } from "../../../lib/rate-limit";

// Public broker/carrier lookup - anyone can check whether a DOT number
// belongs to a real, active entity on file with FMCSA. Reuses the same
// lookupCarrierByDot() function already used for the admin carrier review
// screen - FMCSA's registration database covers carriers, brokers, and
// freight forwarders under the same DOT-number system, so this works for
// broker DOT numbers too, not just carriers.
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
  if (!dotNumber) {
    return Response.json({ error: "Enter a DOT number to check." }, { status: 400 });
  }

  try {
    const snapshot = await lookupCarrierByDot(dotNumber);
    if (!snapshot) {
      return Response.json({ error: `No FMCSA record found for DOT ${dotNumber}. Double-check the number.` }, { status: 404 });
    }
    return Response.json({ snapshot });
  } catch (err) {
    return Response.json({ error: "Couldn't reach FMCSA right now. Try again in a moment." }, { status: 502 });
  }
}
