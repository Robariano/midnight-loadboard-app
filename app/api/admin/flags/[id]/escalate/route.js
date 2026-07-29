import { getServiceClient } from "../../../../../../lib/supabase";
import { isAdminRequest } from "../../../../../../lib/admin-auth";

export async function POST(req, { params }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const supabase = getServiceClient();

  const { data: flag, error: flagErr } = await supabase
    .from("coverage_flags")
    .select("*")
    .eq("id", params.id)
    .single();

  if (flagErr || !flag) {
    return Response.json({ error: "Flag not found." }, { status: 404 });
  }
  if (flag.status === "resolved") {
    return Response.json({ error: "This flag was already resolved." }, { status: 409 });
  }

  // Escalating doesn't change the carrier's open_flag_count — it's still an
  // open, unresolved issue, just marked as more serious. If it warrants
  // pulling the carrier's verified status, use the Revoke button on the
  // Carrier Review page separately.
  const { error } = await supabase
    .from("coverage_flags")
    .update({
      status: "escalated",
      resolution_note: body.resolution_note || null,
    })
    .eq("id", params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
