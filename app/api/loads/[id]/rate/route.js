import { getServiceClient } from "../../../../../lib/supabase";

// Lets whoever posted a load leave a rating for the carrier once the load
// has been marked delivered. One rating per load (enforced by a unique
// constraint on carrier_ratings.load_id).
export async function POST(req, { params }) {
  const loadId = params.id;
  const body = await req.json();
  const supabase = getServiceClient();

  const rating = Number(body.rating);
  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const { data: load, error: loadErr } = await supabase
    .from("loads")
    .select("id, status, claimed_by_carrier_id")
    .eq("id", loadId)
    .single();

  if (loadErr || !load) {
    return Response.json({ error: "Load not found." }, { status: 404 });
  }
  if (load.status !== "delivered") {
    return Response.json({ error: "This load hasn't been marked delivered yet." }, { status: 409 });
  }
  if (!load.claimed_by_carrier_id) {
    return Response.json({ error: "This load has no carrier assigned to rate." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("carrier_ratings")
    .insert({
      load_id: loadId,
      carrier_id: load.claimed_by_carrier_id,
      rating,
      comment: body.comment || null,
      rater_name: body.rater_name || null,
      rater_email: body.rater_email || null,
    })
    .select()
    .single();

  if (error) {
    // Unique violation on load_id means this load was already rated.
    if (error.code === "23505") {
      return Response.json({ error: "This load has already been rated." }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ rating: data }, { status: 201 });
}
