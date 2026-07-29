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
    return Response.json({ error: "This flag has already been resolved." }, { status: 409 });
  }

  const { error } = await supabase
    .from("coverage_flags")
    .update({
      status: "resolved",
      resolution_note: body.resolution_note || null,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Bring the carrier's open flag count down — this flag no longer counts
  // against them. (lifetime_flag_count is left alone; it's a permanent record.)
  const { data: carrier } = await supabase
    .from("carriers")
    .select("open_flag_count")
    .eq("id", flag.carrier_id)
    .single();

  await supabase
    .from("carriers")
    .update({ open_flag_count: Math.max((carrier?.open_flag_count || 1) - 1, 0) })
    .eq("id", flag.carrier_id);

  return Response.json({ ok: true });
}
