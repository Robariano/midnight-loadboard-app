import { getServiceClient } from "../../../../../lib/supabase";

// Public: anyone can see a carrier's ratings/reviews (no rater email exposed).
export async function GET(req, { params }) {
  const carrierId = params.id;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("carrier_ratings")
    .select("id, rating, comment, rater_name, created_at")
    .eq("carrier_id", carrierId)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const count = data.length;
  const average = count ? data.reduce((sum, r) => sum + r.rating, 0) / count : null;

  return Response.json({ ratings: data, average, count });
}
