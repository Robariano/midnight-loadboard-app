import { getServiceClient } from "../../../../lib/supabase";
import { sendInsuranceExpirationSMS } from "../../../../lib/twilio";
import { sendInsuranceExpirationEmail } from "../../../../lib/email";

// Runs daily (see vercel.json) to warn verified carriers whose on-file
// insurance is about to expire, before their coverage confirmations start
// resting on a lapsed policy. Each carrier is only alerted once per
// expiration date (tracked via insurance_alert_sent_at, reset whenever an
// admin re-approves the carrier with fresh documents).
const WARNING_WINDOW_DAYS = 14;

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // not configured yet — allow, but this should be set in production
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${cronSecret}`;
}

export async function GET(req) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + WARNING_WINDOW_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const { data: carriers, error } = await supabase
    .from("carriers")
    .select("id, company_name, contact_email, contact_phone, insurance_expiration_date")
    .eq("verified_status", "verified")
    .not("insurance_expiration_date", "is", null)
    .lte("insurance_expiration_date", cutoffStr)
    .is("insurance_alert_sent_at", null);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results = [];

  for (const carrier of carriers) {
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
        await sendInsuranceExpirationEmail(carrier.contact_email, carrier.company_name, carrier.insurance_expiration_date);
        emailSent = true;
      } catch (err) {
        console.error(`[cron] Failed to email carrier ${carrier.id} about insurance expiration:`, err.message);
      }
    }

    await supabase
      .from("carriers")
      .update({ insurance_alert_sent_at: new Date().toISOString() })
      .eq("id", carrier.id);

    results.push({ carrier_id: carrier.id, company_name: carrier.company_name, smsSent, emailSent });
  }

  return Response.json({ checked: carriers.length, alerted: results });
}
