import { getServiceClient } from "../../../../../../lib/supabase";
import { isAdminRequest } from "../../../../../../lib/admin-auth";

export async function POST(req, { params }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("carriers")
    .update({ verified_status: "revoked" })
    .eq("id", params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
