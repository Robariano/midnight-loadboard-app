import { getServiceClient } from "../../../../lib/supabase";
import { isCoverageWorker } from "../../../../lib/midnight/coverageRequests";

export const dynamic = "force-dynamic";

const NEXT = { approved: ["proving", "failed"], proving: ["proved", "failed"] };

// The worker reports progress: proving -> proved, or failed with a reason.
export async function POST(req) {
  if (!isCoverageWorker(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, status } = body || {};
  const from = Object.keys(NEXT).filter((k) => NEXT[k].includes(status));
  if (!id || !from.length) return Response.json({ error: "Bad update" }, { status: 400 });
  const now = new Date().toISOString();
  const { data, error } = await getServiceClient()
    .from("coverage_requests")
    .update({
      status,
      updated_at: now,
      error: status === "failed" ? String(body.error || "Unknown error").slice(0, 300) : null,
      ...(status === "proved" ? { proved_at: now } : {}),
    })
    .eq("id", id)
    .in("status", from)
    .select("id")
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!data) return Response.json({ error: "Request not in a state that allows this." }, { status: 409 });
  return Response.json({ ok: true });
}
