import { getServiceClient } from "../../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { sendCoverageConfirmationEmail, looksLikeEmail } from "../../../lib/email";
import { getCarrierIdFromRequest } from "../../../lib/carrier-auth";

// Standalone version of the claim/[id]/claim attestation flow, for loads
// found elsewhere (DAT, Truckstop, a phone call, etc.) — no Midnight
// Loadboard load record required. Reuses the same coverage_attestations /
// coverage_flags system, so a "no/not sure" response here still flags the
// carrier the same way a load-claim attestation would.
export async function POST(req) {
  const body = await req.json();
  const supabase = getServiceClient();
  const carrierId = getCarrierIdFromRequest(req);

  if (!carrierId) {
    return Response.json({ error: "Please log in to use this tool." }, { status: 401 });
  }

  if (!body.is_self_attestation && !body.driver_consent_confirmed) {
    return Response.json(
      { error: "You must confirm the driver has agreed to receive this email before assigning them." },
      { status: 400 }
    );
  }

  if (!body.is_self_attestation && !looksLikeEmail(body.driver_contact)) {
    return Response.json(
      { error: "Please enter a valid email address for the driver — texting isn't available right now." },
      { status: 400 }
    );
  }

  const { data: carrier, error: carrierErr } = await supabase
    .from("carriers").select("*").eq("id", carrierId).single();
  if (carrierErr || !carrier) return Response.json({ error: "Carrier not found." }, { status: 404 });
  if (carrier.verified_status !== "verified") return Response.json({ error: "This carrier is not yet verified." }, { status: 403 });

  const token = uuidv4();
  const isSelf = !!body.is_self_attestation;
  const { error: attestErr } = await supabase.from("coverage_attestations").insert({
    load_id: null,
    carrier_id: carrier.id,
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

    try {
      await sendCoverageConfirmationEmail(body.driver_contact.trim(), body.driver_name, confirmUrl);
      return Response.json({ assignedLinkSent: true, confirmUrl: `/confirm/${token}`, token });
    } catch (err) {
      console.error(`[email] Failed to email driver for standalone attestation:`, err.message);
      return Response.json({
        assignedLinkSent: false,
        confirmUrl: `/confirm/${token}`,
        token,
        error: "The confirmation email couldn't be sent. You can copy the link below and share it with your driver directly.",
      });
    }
  }
}
