import { getServiceClient } from "../../../lib/supabase";

// Public search for roadside/repair listings by city and state.
// Empty results are expected and handled gracefully - this directory is
// meant to grow one real listing at a time, starting with none.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const city = String(searchParams.get("city") || "").trim();
  const state = String(searchParams.get("state") || "").trim();

  const supabase = getServiceClient();
  let query = supabase
    .from("roadside_listings")
    .select("id, business_name, service_type, city, state, phone, founder_owned, featured, notes")
    .order("featured", { ascending: false })
    .order("business_name", { ascending: true });

  if (city) query = query.ilike("city", `%${city}%`);
  if (state) query = query.ilike("state", `%${state}%`);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ listings: data });
}
