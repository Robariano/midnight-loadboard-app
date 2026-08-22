import { getServiceClient } from "../../../lib/supabase";
import { checkRateLimit } from "../../../lib/rate-limit";

// Public broker ratings, keyed by DOT number (not tied to a completed load,
// unlike carrier ratings - there's no "broker claimed a load" record in this
// system to anchor proof to). This is a known, documented limitation: anyone
// can submit a rating for any DOT number without proof of a real
// transaction. Treat as informal, crowd-sourced signal, not a verified
// review system.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const dotNumber = String(searchParams.get("dot_number") || "").trim();
  if (!dotNumber) {
    return Response.json({ error: "dot_number is required." }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("broker_ratings")
    .select("id, rating, comment, rater_name, created_at")
    .eq("dot_number", dotNumber)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const count = data.length;
  const average = count ? data.reduce((sum, r) => sum + r.rating, 0) / count : null;

  return Response.json({ ratings: data, average, count });
}

export async function POST(req) {
  const rateLimit = await checkRateLimit(req, "broker_rating", { maxPerWindow: 5, windowMinutes: 60 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many ratings from this network. Try again in ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const dotNumber = String(body.dot_number || "").trim();
  const rating = Number(body.rating);

  if (!dotNumber) {
    return Response.json({ error: "dot_number is required." }, { status: 400 });
  }
  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("broker_ratings")
    .insert({
      dot_number: dotNumber,
      rating,
      comment: body.comment || null,
      rater_name: body.rater_name || null,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ rating: data }, { status: 201 });
}
