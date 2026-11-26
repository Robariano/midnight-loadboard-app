import { getServiceClient } from "../../../../lib/supabase";
import { isAdminRequest } from "../../../../lib/admin-auth";
import { parseCoverageRequest } from "../../../../lib/midnight/coverageRequests";

export const dynamic = "force-dynamic";

// Admin-only list of coverage requests, with each carrier approve link.
export async function GET(req) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await getServiceClient()
    .from("coverage_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ requests: data });
}

// Admin-only: the dispatcher fills in a broker's request (their minimums and
// delivery date) and approves it in one step, with the carrier's standing OK.
// The worker then proves it; the broker just opens the answer link.
export async function POST(req) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = parseCoverageRequest(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const now = new Date().toISOString();
  const { data, error } = await getServiceClient()
    .from("coverage_requests")
    .insert({ ...parsed.value, status: "approved", approved_at: now, updated_at: now })
    .select("id, request_text")
    .single();
  if (error) {
    if (error.code === "23505") return Response.json({ error: "That request name is already used. Add the load number or date." }, { status: 409 });
    return Response.json({ error: "Couldn't save the request." }, { status: 500 });
  }
  return Response.json({ ok: true, request: data });
}
