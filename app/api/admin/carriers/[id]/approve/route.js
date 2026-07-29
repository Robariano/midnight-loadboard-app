import { getServiceClient } from "../../../../../../lib/supabase";
import { isAdminRequest } from "../../../../../../lib/admin-auth";

export async function POST(req, { params }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("carriers")
    // Reset insurance_alert_sent_at so a fresh approval (presumably with an
    // updated insurance cert) is eligible for a new expiration warning cycle.
    .update({
      verified_status: "verified",
      verified_date: new Date().toISOString(),
      insurance_alert_sent_at: null,
    })
    .eq("id", params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
