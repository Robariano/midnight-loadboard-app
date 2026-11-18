import { getServiceClient } from "../../../../lib/supabase";
import { isAdminRequest } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

// Admin-only list of coverage requests, with each carrier approve link.
export async function GET(req) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await getServiceClient()
    .from("coverage_requests")
    .select("id, request_text, dot_number, min_liability, min_cargo, covered_through, broker_contact, approve_token, status, error, created_at, approved_at, proved_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ requests: data });
}
