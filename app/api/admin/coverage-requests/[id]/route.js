import { getServiceClient } from "../../../../../lib/supabase";
import { isAdminRequest } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

// Admin-only: the dispatcher approves or declines a broker's coverage-proof
// request on the carrier's behalf (with the carrier's standing OK, the same
// way the dispatcher signs rate cons for loads the carrier approved).
// Same effect as the carrier's own approve link: only pending requests move.
export async function PATCH(req, { params }) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const decision = body?.decision === "decline" ? "declined" : body?.decision === "approve" ? "approved" : null;
  if (!decision) return Response.json({ error: "Choose approve or decline." }, { status: 400 });

  const supabase = getServiceClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("coverage_requests")
    .update({ status: decision, updated_at: now, ...(decision === "approved" ? { approved_at: now } : {}) })
    .eq("id", params.id)
    .eq("status", "pending")
    .select("status")
    .maybeSingle();
  if (error) return Response.json({ error: "Couldn't save." }, { status: 500 });
  if (!data) return Response.json({ error: "This request was already answered." }, { status: 409 });
  return Response.json({ ok: true, status: data.status });
}
