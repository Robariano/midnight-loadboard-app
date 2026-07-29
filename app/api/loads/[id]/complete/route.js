import { getServiceClient } from "../../../../../lib/supabase";

// Marks a load as delivered once coverage has been confirmed. This is the
// step that unlocks leaving a rating for the carrier.
export async function POST(req, { params }) {
  const loadId = params.id;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("loads")
    .update({ status: "delivered" })
    .eq("id", loadId)
    .eq("status", "confirmed") // only deliverable once coverage was confirmed
    .select()
    .single();

  if (error || !data) {
    return Response.json(
      { error: "This load can't be marked delivered yet — coverage must be confirmed first." },
      { status: 409 }
    );
  }

  return Response.json({ load: data });
}
