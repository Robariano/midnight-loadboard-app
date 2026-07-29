import { getServiceClient } from "../../../../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { sendCoverageConfirmationSMS, looksLikePhoneNumber, normalizeToE164 } from "../../../../../lib/twilio";
import { sendCoverageConfirmationEmail, looksLikeEmail } from "../../../../../lib/email";

export async function POST(req, { params }) {
  const loadId = params.id;
  const body = await req.json();
  const supabase = getServiceClient();

  if (!body.carrier_id) {
    return Response.json({ error: "Carrier ID is required." }, { status: 400 });
  }
  if (!body.is_self_attestation && !body.driver_consent_confirmed) {
    return Response.json(
      { error: "You must confirm the driver has agreed to receive this text/email before assigning them." },
      { status: 400 }
    );
  }

  // 1. Confirm the carrier is actually verified
  const { data: carrier, error: carrierErr } = await supabase
    .from("carriers")
    .select("*")
    .eq("id", body.carrier_id)
    .single();

  if (carrierErr || !carrier) {
    return Response.json({ error: "Carrier not found." }, { status: 404 });
  }
  if (carrier.verified_status !== "verified") {
    return Response.json({ error: "This carrier is not yet verified." }, { status: 403 });
  }

  // 2. Mark the load as claimed
  const { error: loadErr } = await supabase
    .from("loads")
    .update({
      status: "coverage_pending",
      claimed_by_carrier_id: carrier.id,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", loadId)
    .eq("status", "open"); // only claim if still open

  if (loadErr) {
    return Response.json({ error: loadErr.message }, { status: 500 });
  }

  // 3. Create the coverage attestation record
  const token = uuidv4();
  const isSelf = !!body.is_self_attestation;

  const { error: attestErr } = await supabase.from("coverage_attestations").insert({
    load_id: loadId,
    carrier_id: carrier.id,
    driver_name: isSelf ? null : body.driver_name,
    driver_contact: isSelf ? null : body.driver_contact,
    is_self_attestation: isSelf,
    driver_consent_confirmed_at: isSelf ? null : new Date().toISOString(),
    token,
    response: "pending",
  });

  if (attestErr) {
    return Response.json({ error: attestErr.message }, { status: 500 });
  }

  if (isSelf) {
    // Solo owner-operator self-attests right away in the UI
    return Response.json({ selfAttestationNeeded: true, token });
  } else {
    const baseUrl = process.env.APP_BASE_URL || "https://midnightloadboard.com";
    const confirmUrl = `${baseUrl}/confirm/${token}`;

    let smsSent = false;
    let smsError = null;
    let emailSent = false;
    let emailError = null;

    if (looksLikePhoneNumber(body.driver_contact)) {
      try {
        await sendCoverageConfirmationSMS(
          normalizeToE164(body.driver_contact),
          body.driver_name,
          confirmUrl
        );
        smsSent = true;
      } catch (err) {
        // Don't fail the claim if the text fails to send — the confirm
        // link is still returned below so it can be sent manually.
        console.error(`[twilio] Failed to text driver for load ${loadId}:`, err.message);
        smsError = err.message;
      }
    } else if (looksLikeEmail(body.driver_contact)) {
      try {
        await sendCoverageConfirmationEmail(
          body.driver_contact.trim(),
          body.driver_name,
          confirmUrl
        );
        emailSent = true;
      } catch (err) {
        // Same reasoning as the SMS branch — don't fail the claim, just
        // surface the error so the link can be sent manually if needed.
        console.error(`[email] Failed to email driver for load ${loadId}:`, err.message);
        emailError = err.message;
      }
    }

    return Response.json({
      assignedLinkSent: true,
      confirmUrl: `/confirm/${token}`,
      token,
      smsSent,
      smsError,
      emailSent,
      emailError,
    });
  }
}
