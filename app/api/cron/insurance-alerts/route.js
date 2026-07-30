import { getServiceClient } from "../../../../lib/supabase";
import { sendInsuranceExpirationSMS } from "../../../../lib/twilio";
import { sendInsuranceExpirationEmail, sendReverificationRequiredEmail } from "../../../../lib/email";

// Force this route to run fresh on every request instead of being cached
// at build time — without this, Next.js may serve a stale cached response
// (e.g. always "checked: 0") regardless of what's actually in the database.
export const dynamic = "force-dynamic";

// Runs daily (see vercel.json). Two jobs:
//
// 1. Warn verified carriers whose insurance expires within
//    WARNING_WINDOW_DAYS (once per expiration date, tracked via
//    insurance_alert_sent_at) - same as before, now with a self-service
//    /reverify link instead of "reply to this email".
//
// 2. Once insurance has actually lapsed (expiration date is in the past),
//    pause the carrier by setting verified_status to pending_reverification
//    so they can't keep claiming loads on an expired policy, and email them
//    the /reverify link to submit fresh documents themselves.
const WARNING_WINDOW_DAYS = 14;

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // not configured yet - allow, but this should be set in production
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${cronSecret}`;
}

export async function GET(req) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const todayStr = new Date().toISOString().slice(0, 10);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + WARNING_WINDOW_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  // --- Job 1: upcoming-expiration warning ---
  const { data: expiringSoon, error: expiringSoonErr } = await supabase
    .from("carriers")
    .select("id, company_name, contact_email, contact_phone, insurance_expiration_date")
    .eq("verified_status", "verified")
    .not("insurance_expiration_date", "is", null)
    .lte("insurance_expiration_date", cutoffStr)
    .gte("insurance_expiration_date", todayStr)
    .is("insurance_alert_sent_at", null);

  if (expiringSoonErr) return Response.json({ error: expiringSoonErr.message }, { status: 500 });

  const warned = [];
  for (const carrier of expiringSoon) {
    let smsSent = false;
    let emailSent = false;

    if (carrier.contact_phone) {
      try {
        await sendInsuranceExpirationSMS(carrier.contact_phone, carrier.company_name, carrier.insurance_expiration_date);
        smsSent = true;
      } catch (err) {
        console.error(`[cron] Failed to text carrier ${carrier.id} about insurance expiration:`, err.message);
      }
    }

    if (carrier.contact_email) {
      try {
        await sendInsuranceExpirationEmail(carrier.contact_email, carrier.company_name, carrier.insurance_expiration_date, carrier.id);
        emailSent = true;
      } catch (err) {
        console.error(`[cron] Failed to email carrier ${carrier.id} about insurance expiration:`, err.message);
      }
    }

    await supabase
      .from("carriers")
      .update({ insurance_alert_sent_at: new Date().toISOString() })
      .eq("id", carrier.id);

    warned.push({ carrier_id: carrier.id, company_name: carrier.company_name, smsSent, emailSent });
  }

  // --- Job 2: insurance has actually lapsed - pause verification ---
  const { data: expired, error: expiredErr } = await supabase
    .from("carriers")
    .select("id, company_name, contact_email, insurance_expiration_date")
    .eq("verified_status", "verified")
    .not("insurance_expiration_date", "is", null)
    .lt("insurance_expiration_date", todayStr);

  if (expiredErr) return Response.json({ error: expiredErr.message }, { status: 500 });

  const pausedForReverification = [];
  for (const carrier of expired) {
    await supabase
      .from("carriers")
      .update({ verified_status: "pending_reverification" })
      .eq("id", carrier.id);

    let emailSent = false;
    if (carrier.contact_email) {
      try {
        await sendReverificationRequiredEmail(carrier.contact_email, carrier.company_name, carrier.id);
        emailSent = true;
      } catch (err) {
        console.error(`[cron] Failed to email carrier ${carrier.id} about lapsed insurance:`, err.message);
      }
    }

    pausedForReverification.push({ carrier_id: carrier.id, company_name: carrier.company_name, emailSent });
  }

  return Response.json({
    checked: expiringSoon.length + expired.length,
    warned,
    pausedForReverification,
  });
}
