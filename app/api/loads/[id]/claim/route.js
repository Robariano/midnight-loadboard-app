import { getServiceClient } from "../../../../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { sendCoverageConfirmationEmail, looksLikeEmail } from "../../../../../lib/email";

export async function POST(req, { params }) {
  const loadId = params.id;
  const body = await req.json();
  const supabase = getServiceClient();

  if (!body.carrier_id) {
    return Response.json({ error: "Carrier ID is required." }, { status: 400 });
  }
  if (!body.carrier_secret) {
    return Response.json({ error: "Carrier secret is required." }, { status: 400 });
  }
  if (!body.is_self_attestation && !body.driver_consent_confirmed) {
    return Response.json(
      { error: "You must confirm the driver has agreed to receive this text/email before assigning them." },
      { status: 400 }
    );
  }

  // 1. Confirm the carrier is actually verified, and that whoever is calling
  // this endpoint actually knows this carrier's private secret — not just
  // their public Carrier ID (which is visible to anyone, e.g. in the URL of
  // their public carrier page). Without this check, anyone who knew or
  // guessed a Carrier ID could claim loads on that carrier's behalf.
  const { data: carrier, error: carrierErr } = await supabase
    .from("carriers").select("*").eq("id", body.carrier_id).single();
  if (carrierErr || !carrier) return Response.json({ error: "Carrier not found." }, { status: 404 });
  if (carrier.carrier_secret !== body.carrier_secret) {
    return Response.json({ error: "Carrier ID or secret is incorrect." }, { status: 401 });
  }
  if (carrier.verified_status !== "verified") return Response.json({ error: "This carrier is not yet verified." }, { status: 403 });

  // 2. Mark the load as claimed
  const { error: loadErr } = await supabase.from("loads").update({
    status: "coverage_pending", claimed_by_carrier_id: carrier.id, claimed_at: new Date().toISOString(),
  }).eq("id", loadId).eq("status", "open");
  if (loadErr) return Response.json({ error: loadErr.message }, { status: 500 });

  // 3. Create the coverage attestation record
  const token = uuidv4();
  const isSelf = !!body.is_self_attestation;
  const { error: attestErr } = await supabase.from("coverage_attestations").insert({
    load_id: loadId, carrier_id: carrier.id,
    driver_name: isSelf ? null : body.driver_name,
    driver_contact: isSelf ? null : body.driver_contact,
    is_self_attestation: isSelf,
    driver_consent_confirmed_at: isSelf ? null : new Date().toISOString(),
    token, response: "pending",
  });
  if (attestErr) return Response.json({ error: attestErr.message }, { status: 500 });

  if (isSelf) {
    return Response.json({ selfAttestationNeeded: true, token });
  } else {
    const baseUrl = process.env.APP_BASE_URL || "https://midnightloadboard.com";
    const confirmUrl = `${baseUrl}/confirm/${token}`;

    // SMS is intentionally not attempted here — Twilio's A2P 10DLC campaign
    // for this number is rejected, so texts can come back as "sent" without
    // ever actually being delivered. The confirm link below (always returned)
    // is the reliable path: the carrier copies/sends it to the driver
    // themselves. Email is still attempted automatically when driver_contact
    // is an email address, since Resend isn't affected by the A2P issue.
    let emailSent = false;
    let emailError = null;

    if (looksLikeEmail(body.driver_contact)) {
      try {
        await sendCoverageConfirmationEmail(body.driver_contact.trim(), body.driver_name, confirmUrl);
        emailSent = true;
      } catch (err) {
        console.error(`[email] Failed to email driver for load ${loadId}:`, err.message);
        emailError = err.message;
      }
    }

    return Response.json({
      assignedLinkSent: true, confirmUrl: `/confirm/${token}`, token, emailSent, emailError,
    });
  }
}
