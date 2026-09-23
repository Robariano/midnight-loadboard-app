import { getServiceClient } from "../../../../../../lib/supabase";
import { isAdminRequest } from "../../../../../../lib/admin-auth";
import { lookupCarrierByDot } from "../../../../../../lib/fmcsa";

export async function GET(req, { params }) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data: carrier, error } = await supabase
    .from("carriers")
    .select("id, dot_number")
    .eq("id", params.id)
    .single();

  if (error || !carrier) {
    return Response.json({ error: "Carrier not found." }, { status: 404 });
  }
  if (!carrier.dot_number) {
    return Response.json({ error: "This carrier didn't submit a DOT number." }, { status: 400 });
  }

  try {
    const snapshot = await lookupCarrierByDot(carrier.dot_number);
    if (!snapshot) {
      await supabase
        .from("carriers")
        .update({ fmcsa_checked_at: new Date().toISOString(), fmcsa_snapshot: null, fmcsa_error: `No FMCSA record found for DOT ${carrier.dot_number}.` })
        .eq("id", params.id);
      return Response.json({ error: `No FMCSA record found for DOT ${carrier.dot_number}.` }, { status: 404 });
    }
    // Keep the stored copy in sync with this manual re-check, same as the
    // automatic check at signup (app/api/carriers/route.js) — so the
    // snapshot shown next time the admin panel loads (no click required)
    // reflects whatever this button last found.
    await supabase
      .from("carriers")
      .update({ fmcsa_checked_at: new Date().toISOString(), fmcsa_snapshot: snapshot, fmcsa_error: null })
      .eq("id", params.id);
    return Response.json({ snapshot });
  } catch (err) {
    await supabase
      .from("carriers")
      .update({ fmcsa_checked_at: new Date().toISOString(), fmcsa_error: err.message })
      .eq("id", params.id);
    return Response.json({ error: err.message }, { status: 502 });
  }
}
