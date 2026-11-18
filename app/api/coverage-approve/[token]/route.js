import { getServiceClient } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The carrier approves (or declines) a broker's coverage request from its
// private link. Approving lets Nightlane's worker build the proof.
export async function POST(req, { params }) {
  if (!UUID.test(params.token)) return Response.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const decision = body?.decision === "decline" ? "declined" : body?.decision === "approve" ? "approved" : null;
  if (!decision) return Response.json({ error: "Choose approve or decline." }, { status: 400 });

  const supabase = getServiceClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("coverage_requests")
    .update({ status: decision, updated_at: now, ...(decision === "approved" ? { approved_at: now } : {}) })
    .eq("approve_token", params.token)
    .eq("status", "pending")
    .select("status")
    .maybeSingle();
  if (error) return Response.json({ error: "Couldn't save your answer." }, { status: 500 });
  if (!data) return Response.json({ error: "This request was already answered." }, { status: 409 });
  return Response.json({ ok: true, status: data.status });
}
