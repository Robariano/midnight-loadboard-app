import { getServiceClient } from "../../../../lib/supabase";
import { isCoverageWorker } from "../../../../lib/midnight/coverageRequests";

export const dynamic = "force-dynamic";

// Nightlane's proving worker picks up carrier-approved requests here.
export async function GET(req) {
  if (!isCoverageWorker(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await getServiceClient()
    .from("coverage_requests")
    .select("*") // includes kind and vin once supabase-migration-vehicle-requests.sql has run
    .in("status", ["approved"])
    .order("approved_at", { ascending: true })
    .limit(10);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ requests: data });
}
