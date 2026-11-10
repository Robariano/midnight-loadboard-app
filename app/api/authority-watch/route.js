import { getServiceClient } from "../../../lib/supabase";
import { checkRateLimit } from "../../../lib/rate-limit";
import { lookupCarrierByDot, lookupCarrierByMc } from "../../../lib/fmcsa";
import { looksLikePhoneNumber, normalizeToE164, sendAuthorityWatchWelcomeSMS } from "../../../lib/twilio";
import { looksLikeEmail, sendAuthorityWatchWelcomeEmail } from "../../../lib/email";
import { watchStatus, signupNotes } from "../../../lib/authorityWatch";

const baseUrl = process.env.APP_BASE_URL || "https://www.nightlaneloads.com";
// Text alerts stay off until the Twilio A2P campaign covers Authority Watch
// messages. Email alerts work either way.
const smsEnabled = process.env.NEXT_PUBLIC_AUTHORITY_WATCH_SMS === "true";

// Authority Watch signup. Runs the FMCSA lookup on the server (public
// QCMobile data, never a Motus login), shows the carrier where they stand
// right now, and saves a subscription the daily cron re-checks.
export async function POST(req) {
  const rateLimit = await checkRateLimit(req, "authority_watch", { maxPerWindow: 5, windowMinutes: 60 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many sign-ups from this network. Try again in ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const dotInput = String(body.dot_number || "").replace(/\D/g, "");
  const mcInput = String(body.mc_number || "").replace(/\D/g, "");
  const rawPhone = smsEnabled ? String(body.phone || "").trim() : "";
  const email = String(body.email || "").trim().toLowerCase();
  const smsConsent = !!body.sms_consent;

  if (!dotInput && !mcInput) {
    return Response.json({ error: "Enter your DOT or MC number." }, { status: 400 });
  }
  if (!rawPhone && !email) {
    return Response.json({ error: smsEnabled ? "Enter a cell phone, an email, or both, so we can reach you." : "Enter your email so we can reach you." }, { status: 400 });
  }
  if (rawPhone && !looksLikePhoneNumber(rawPhone)) {
    return Response.json({ error: "Enter a valid cell phone number." }, { status: 400 });
  }
  if (rawPhone && !smsConsent) {
    return Response.json({ error: "Check the box to agree to receive alert texts, or leave the phone blank." }, { status: 400 });
  }
  if (email && !looksLikeEmail(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const phone = rawPhone ? normalizeToE164(rawPhone) : null;

  let snapshot;
  try {
    snapshot = dotInput ? await lookupCarrierByDot(dotInput) : await lookupCarrierByMc(mcInput);
  } catch (err) {
    return Response.json({ error: "Couldn't reach FMCSA right now. Try again in a moment." }, { status: 502 });
  }
  if (!snapshot) {
    return Response.json(
      { error: `No FMCSA record found for ${dotInput ? "DOT " + dotInput : "MC " + mcInput}. Double-check the number.` },
      { status: 404 }
    );
  }
  const dotNumber = String(snapshot.dotNumber || dotInput);
  const status = watchStatus(snapshot);
  const notes = signupNotes(snapshot);

  const supabase = getServiceClient();

  // Don't create duplicates: same DOT + same phone or email already watching.
  const { data: existing } = await supabase
    .from("authority_watches")
    .select("id, phone, email")
    .eq("dot_number", dotNumber)
    .eq("active", true);
  const already = (existing || []).find((w) => (phone && w.phone === phone) || (email && w.email === email));
  if (already) {
    return Response.json({ snapshot, notes, alreadyWatching: true });
  }

  const { count } = await supabase
    .from("authority_watches")
    .select("id", { count: "exact", head: true })
    .eq("dot_number", dotNumber)
    .eq("active", true);
  if ((count || 0) >= 5) {
    return Response.json({ error: "This DOT number already has the maximum number of alert contacts." }, { status: 400 });
  }

  const { data: row, error } = await supabase
    .from("authority_watches")
    .insert({
      dot_number: dotNumber,
      legal_name: snapshot.legalName || null,
      phone,
      email: email || null,
      sms_consent: !!phone && smsConsent,
      last_status: status,
      last_snapshot: snapshot,
      last_checked_at: new Date().toISOString(),
    })
    .select("stop_token")
    .single();

  if (error) {
    return Response.json({ error: "Couldn't save your Authority Watch. Please try again." }, { status: 500 });
  }

  const stopUrl = `${baseUrl}/authority-watch/stop/${row.stop_token}`;
  let smsSent = false;
  let emailSent = false;
  if (phone) {
    try {
      await sendAuthorityWatchWelcomeSMS(phone, dotNumber, snapshot.legalName);
      smsSent = true;
    } catch (err) {
      console.error("[authority-watch] welcome SMS failed:", err.message);
    }
  }
  if (email) {
    try {
      await sendAuthorityWatchWelcomeEmail(email, dotNumber, snapshot.legalName, stopUrl);
      emailSent = true;
    } catch (err) {
      console.error("[authority-watch] welcome email failed:", err.message);
    }
  }

  return Response.json({ snapshot, notes, smsSent, emailSent, stopUrl });
}
