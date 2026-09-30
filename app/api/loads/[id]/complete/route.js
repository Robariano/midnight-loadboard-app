import { getServiceClient } from "../../../../../lib/supabase";

// Marks a load as delivered once coverage has been confirmed. This is the
// step that unlocks leaving a rating for the carrier. Deliverable directly
// from "confirmed" (skipping the picked-up/in-transit steps is allowed -
// they're a convenience for tracking progress, not a requirement) or from
// either intermediate status.
export async function POST(req, { params }) {
  const loadId = params.id;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("loads")
    .update({ status: "delivered" })
    .eq("id", loadId)
    .in("status", ["confirmed", "picked_up", "in_transit"])
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
