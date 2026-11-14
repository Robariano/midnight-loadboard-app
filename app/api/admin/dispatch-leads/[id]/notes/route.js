import { getServiceClient } from "../../../../../../lib/supabase";
import { isAdminRequest } from "../../../../../../lib/admin-auth";

// Admin-only: append a dated note to a lead (call outcomes, follow-ups,
// FMCSA checks). Appends rather than overwrites, so the original form
// submission and earlier notes are never lost.
export async function POST(req, { params }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const note = String(body.note || "").trim();
  if (!note) return Response.json({ error: "Write a note first." }, { status: 400 });
  if (note.length > 2000) return Response.json({ error: "Keep notes under 2,000 characters." }, { status: 400 });

  const supabase = getServiceClient();
  const { data: lead, error: readError } = await supabase
    .from("dispatch_leads")
    .select("notes")
    .eq("id", params.id)
    .single();
  if (readError) return Response.json({ error: readError.message }, { status: 500 });

  // Date in Mountain time, where the business runs, e.g. "Nov 14".
  const stamp = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Denver", month: "short", day: "numeric",
  });
  const line = `[${stamp}] ${note}`;
  const notes = lead?.notes ? `${lead.notes}\n\n${line}` : line;

  const { error } = await supabase
    .from("dispatch_leads")
    .update({ notes })
    .eq("id", params.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, notes });
}
