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
      return Response.json({ error: `No FMCSA record found for DOT ${carrier.dot_number}.` }, { status: 404 });
    }
    return Response.json({ snapshot });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
