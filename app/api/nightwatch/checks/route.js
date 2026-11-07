import { getServiceClient } from "../../../../lib/supabase";
import { checkRateLimit } from "../../../../lib/rate-limit";
import { lookupCarrierByDot, lookupCarrierByMc } from "../../../../lib/fmcsa";
import { sendCoverageConfirmationSMS, looksLikePhoneNumber, normalizeToE164 } from "../../../../lib/twilio";
import { v4 as uuidv4 } from "uuid";

// Nightwatch Lite: one broker check = FMCSA snapshot + (optional) driver
// coverage text + a saved, timestamped report. The FMCSA lookup is re-run
// here on the server so the stored snapshot is exactly what FMCSA returned,
// never something the browser sent. The driver text reuses the same
// coverage_attestations flow as /api/public-assign-coverage, so a "no/not
// sure" answer flags the carrier the same way.
export async function POST(req) {
  const rateLimit = await checkRateLimit(req, "nightwatch_check", { maxPerWindow: 15, windowMinutes: 60 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many checks from this network. Try again in ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const dotInput = String(body.dot_number || "").replace(/\D/g, "");
  const mcInput = String(body.mc_number || "").replace(/\D/g, "");
  const driverName = String(body.driver_name || "").trim();
  const driverPhone = String(body.driver_phone || "").trim();
  const wantsDriverCheck = !!(driverName || driverPhone);

  if (!dotInput && !mcInput) {
    return Response.json({ error: "Enter the carrier's DOT or MC number." }, { status: 400 });
  }
  if (wantsDriverCheck) {
    if (!driverName) return Response.json({ error: "Enter the driver's name, or leave both driver fields blank." }, { status: 400 });
    if (!looksLikePhoneNumber(driverPhone)) return Response.json({ error: "Enter a valid phone number for the driver." }, { status: 400 });
    if (!body.driver_consent_confirmed) {
      return Response.json({ error: "Confirm the carrier says the driver agreed to receive this text." }, { status: 400 });
    }
  }

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

  const supabase = getServiceClient();
  let attestationId = null;
  let driverTextSent = null;
  let confirmUrl = null;

  if (wantsDriverCheck) {
    // Find or create the carrier record the attestation attaches to (same
    // approach as /api/public-assign-coverage, keyed on DOT here).
    let { data: carrier } = await supabase
      .from("carriers").select("id").eq("dot_number", dotNumber).maybeSingle();
    if (!carrier) {
      const { data, error } = await supabase
        .from("carriers")
        .insert({ company_name: snapshot.legalName || `DOT ${dotNumber}`, dot_number: dotNumber, verified_status: "unclaimed" })
        .select("id").single();
      if (error) return Response.json({ error: error.message }, { status: 500 });
      carrier = data;
    }

    const token = uuidv4();
    const { data: attestation, error: attestErr } = await supabase
      .from("coverage_attestations")
      .insert({
        load_id: null,
        carrier_id: carrier.id,
        driver_name: driverName,
        driver_contact: driverPhone,
        is_self_attestation: false,
        driver_consent_confirmed_at: new Date().toISOString(),
        token,
        response: "pending",
      })
      .select("id").single();
    if (attestErr) return Response.json({ error: attestErr.message }, { status: 500 });
    attestationId = attestation.id;

    const baseUrl = process.env.APP_BASE_URL || "https://www.nightlaneloads.com";
    confirmUrl = `${baseUrl}/confirm/${token}`;
    try {
      await sendCoverageConfirmationSMS(normalizeToE164(driverPhone), driverName, confirmUrl);
      driverTextSent = true;
    } catch (err) {
      console.error("[nightwatch] Failed to text driver:", err.message);
      driverTextSent = false;
    }
  }

  const { data: check, error: checkErr } = await supabase
    .from("nightwatch_checks")
    .insert({
      dot_number: dotNumber,
      carrier_snapshot: snapshot,
      checked_by_company: String(body.checked_by_company || "").trim() || null,
      checked_by_name: String(body.checked_by_name || "").trim() || null,
      load_reference: String(body.load_reference || "").trim() || null,
      attestation_id: attestationId,
      driver_name: driverName || null,
      driver_contact_last4: driverPhone ? driverPhone.replace(/\D/g, "").slice(-4) : null,
      driver_text_sent: driverTextSent,
    })
    .select("report_token").single();

  if (checkErr) {
    console.error("[nightwatch] Failed to save report:", checkErr.message);
    return Response.json({
      snapshot,
      driverTextSent,
      confirmUrl: driverTextSent === false ? confirmUrl : null,
      error: "The check ran, but the report couldn't be saved. Take a screenshot of this page for your records.",
    });
  }

  return Response.json({
    snapshot,
    driverTextSent,
    confirmUrl: driverTextSent === false ? confirmUrl : null,
    reportUrl: `/nightwatch/report/${check.report_token}`,
  });
}
