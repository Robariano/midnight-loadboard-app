import { getServiceClient } from "../../../lib/supabase";
import { checkRateLimit } from "../../../lib/rate-limit";
import { sendCoverageConfirmationEmail, looksLikeEmail } from "../../../lib/email";
import { v4 as uuidv4 } from "uuid";

// Genuinely public "assign a driver" flow — no Midnight Loadboard carrier
// login required. Lets a carrier, fleet owner, or a dispatcher acting on
// their behalf (e.g. Steady Wake, sending this to their own client's
// driver) send a private coverage-confirmation email, the same way the
// logged-in-and-verified VerifiedCarrierTool on /confirm-coverage does —
// just without requiring an account. Combines /api/public-coverage-check's
// find-or-create-carrier logic (an "unclaimed" record gets created if the
// company isn't on file yet) with /api/standalone-attestation's
// email-a-driver logic, so a "no/not sure" response still flags the
// carrier the same way either of those does.
export async function POST(req) {
  const rateLimit = await checkRateLimit(req, "public_assign_coverage", { maxPerWindow: 15, windowMinutes: 1440 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many confirmations sent from this network. Try again in ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const carrierName = (body.carrier_name || "").trim();
  const dotNumber = (body.dot_number || "").trim();
  const driverName = (body.driver_name || "").trim();
  const driverContact = (body.driver_contact || "").trim();

  if (!carrierName) {
    return Response.json({ error: "Please enter the company name the driver is running under." }, { status: 400 });
  }
  if (!driverName) {
    return Response.json({ error: "Please enter the driver's name." }, { status: 400 });
  }
  if (!looksLikeEmail(driverContact)) {
    return Response.json(
      { error: "Please enter a valid email address for the driver — texting isn't available right now." },
      { status: 400 }
    );
  }
  if (!body.driver_consent_confirmed) {
    return Response.json(
      { error: "You must confirm the driver has agreed to receive this email before assigning them." },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();

  // Same find-or-create-carrier logic as /api/public-coverage-check, so a
  // company without a Midnight Loadboard account yet still gets a record
  // the attestation (and any resulting flag) attaches to.
  let carrier = null;

  if (dotNumber) {
    const { data } = await supabase
      .from("carriers")
      .select("id, contact_email, company_name, lifetime_flag_count, open_flag_count")
      .eq("dot_number", dotNumber)
      .maybeSingle();
    if (data) carrier = data;
  }

  if (!carrier) {
    const { data } = await supabase
      .from("carriers")
      .select("id, contact_email, company_name, lifetime_flag_count, open_flag_count")
      .ilike("company_name", carrierName)
      .maybeSingle();
    if (data) carrier = data;
  }

  if (!carrier) {
    const { data, error: createErr } = await supabase
      .from("carriers")
      .insert({
        company_name: carrierName,
        dot_number: dotNumber || null,
        verified_status: "unclaimed",
      })
      .select("id, contact_email, company_name, lifetime_flag_count, open_flag_count")
      .single();
    if (createErr) return Response.json({ error: createErr.message }, { status: 500 });
    carrier = data;
  }

  const token = uuidv4();
  const { error: attestErr } = await supabase.from("coverage_attestations").insert({
    load_id: null,
    carrier_id: carrier.id,
    driver_name: driverName,
    driver_contact: driverContact,
    is_self_attestation: false,
    driver_consent_confirmed_at: new Date().toISOString(),
    token,
    response: "pending",
  });
  if (attestErr) return Response.json({ error: attestErr.message }, { status: 500 });

  const baseUrl = process.env.APP_BASE_URL || "https://midnightloadboard.com";
  const confirmUrl = `${baseUrl}/confirm/${token}`;

  try {
    await sendCoverageConfirmationEmail(driverContact, driverName, confirmUrl);
    return Response.json({ assignedLinkSent: true, confirmUrl: `/confirm/${token}`, token });
  } catch (err) {
    console.error("[email] Failed to email driver for public assign-coverage:", err.message);
    return Response.json({
      assignedLinkSent: false,
      confirmUrl: `/confirm/${token}`,
      token,
      error: "The confirmation email couldn't be sent. You can copy the link below and share it with your driver directly.",
    });
  }
}
