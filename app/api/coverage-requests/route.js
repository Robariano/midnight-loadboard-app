import { getServiceClient } from "../../../lib/supabase";
import { parseCoverageRequest } from "../../../lib/midnight/coverageRequests";

export const dynamic = "force-dynamic";

const MAX_OPEN = 100;         // pilot cap on open requests overall
const MAX_OPEN_PER_DOT = 10;  // and per carrier

// A broker asks a carrier for a private coverage proof (Midnight pilot).
export async function POST(req) {
  const body = await req.json().catch(() => null);
  const parsed = parseCoverageRequest(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });

  const supabase = getServiceClient();
  const open = ["pending", "approved", "proving"];
  const [{ count: total }, { count: perDot }] = await Promise.all([
    supabase.from("coverage_requests").select("id", { count: "exact", head: true }).in("status", open),
    supabase.from("coverage_requests").select("id", { count: "exact", head: true }).in("status", open).eq("dot_number", parsed.value.dot_number),
  ]);
  if ((total ?? 0) >= MAX_OPEN || (perDot ?? 0) >= MAX_OPEN_PER_DOT) {
    return Response.json({ error: "Too many open requests right now. Please try again later." }, { status: 429 });
  }

  const { error } = await supabase.from("coverage_requests").insert(parsed.value);
  if (error) {
    if (error.code === "23505") return Response.json({ error: "That request text is already used. Add the load number or date to make it unique." }, { status: 409 });
    return Response.json({ error: "Couldn't save the request." }, { status: 500 });
  }
  return Response.json({ ok: true, request: parsed.value.request_text });
}
