import { getServiceClient } from "../../../../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { sendCoverageConfirmationEmail, looksLikeEmail } from "../../../../../lib/email";
import { getCarrierIdFromRequest } from "../../../../../lib/carrier-auth";

export async function POST(req, { params }) {
    const loadId = params.id;
    const body = await req.json();
    const supabase = getServiceClient();

  const carrierId = getCarrierIdFromRequest(req);
    if (!carrierId) {
          return Response.json({ error: "Please log in to claim loads." }, { status: 401 });
    }

  if (!body.is_self_attestation && !body.driver_consent_confirmed) {
        return Response.json(
          { error: "You must confirm the driver has agreed to receive this text/email before assigning them." },
          { status: 400 }
              );
  }

  const { data: carrier, error: carrierErr } = await supabase
      .from("carriers").select("*").eq("id", carrierId).single();
    if (carrierErr || !carrier) return Response.json({ error: "Carrier not found." }, { status: 404 });
    if (carrier.verified_status !== "verified") return Response.json({ error: "This carrier is not yet verified." }, { status: 403 });

  const { error: loadErr } = await supabase.from("loads").update({
        status: "coverage_pending", claimed_by_carrier_id: carrier.id, claimed_at: new Date().toISOString(),
  }).eq("id", loadId).eq("status", "open");
    if (loadErr) return Response.json({ error: loadErr.message }, { status: 500 });

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
