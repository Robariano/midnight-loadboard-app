import { getServiceClient } from "../../../../../../lib/supabase";
import { isAdminRequest } from "../../../../../../lib/admin-auth";
import { sendCarrierRevokedEmail } from "../../../../../../lib/email";

export async function POST(req, { params }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  const { data: carrier, error: fetchErr } = await supabase
    .from("carriers")
    .select("contact_email, company_name")
    .eq("id", params.id)
    .single();

  const { error } = await supabase
    .from("carriers")
    .update({ verified_status: "revoked" })
    .eq("id", params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Fire-and-forget: don't block the admin action on the email send.
  if (!fetchErr && carrier?.contact_email) {
    sendCarrierRevokedEmail(carrier.contact_email, carrier.company_name).catch((err) =>
      console.error("[email] Failed to send revocation notice:", err.message)
    );
  }

  return Response.json({ ok: true });
}
