import { getServiceClient } from "../../../lib/supabase";
import { checkRateLimit } from "../../../lib/rate-limit";
import { sendNightwatchLeadAlertSMS } from "../../../lib/twilio";

// Public early-access form for Nightwatch (the broker-facing continuous
// carrier verification feature — see app/nightwatch/page.js). Nightwatch
// itself isn't built yet, so this just captures interested brokers.
// Nothing here is shown publicly; only the admin panel
// (app/admin/nightwatch-leads/page.js) reads these rows.
export async function POST(req) {
  const rateLimit = await checkRateLimit(req, "nightwatch_lead", { maxPerWindow: 5, windowMinutes: 1440 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many submissions from this network. Try again in ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const companyName = String(body.company_name || "").trim();
  const contactName = String(body.contact_name || "").trim();
  const contactEmail = String(body.contact_email || "").trim();
  const contactPhone = String(body.contact_phone || "").trim();
  const notes = String(body.notes || "").trim();
  const source = String(body.source || "").trim();

  if (!companyName) {
    return Response.json({ error: "Enter your name or your company's name." }, { status: 400 });
  }
  if (!contactEmail && !contactPhone) {
    return Response.json({ error: "Enter an email or phone number so we can reach you." }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("nightwatch_leads").insert({
    company_name: companyName,
    contact_name: contactName || null,
    contact_email: contactEmail || null,
    contact_phone: contactPhone || null,
    notes: notes || null,
    source: source || null,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Best-effort text alert — never lets a Twilio problem fail the visitor's submission.
  try {
    await sendNightwatchLeadAlertSMS({ companyName, contactPhone, contactEmail });
  } catch (smsError) {
    console.error("Failed to send Nightwatch lead alert SMS:", smsError);
  }

  return Response.json({ ok: true }, { status: 201 });
}
