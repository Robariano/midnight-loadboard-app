import { getServiceClient } from "../../../../../../lib/supabase";
import { isAdminRequest } from "../../../../../../lib/admin-auth";

// Admin-only status update (new -> contacted -> closed) for a single lead.
export async function POST(req, { params }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const status = String(body.status || "").trim();
  if (!["new", "contacted", "closed"].includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("dispatch_leads")
    .update({ status })
    .eq("id", params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
