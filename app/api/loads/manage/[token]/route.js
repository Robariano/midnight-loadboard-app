import { getServiceClient } from "../../../../../lib/supabase";

// Lets a shipper manage the load they posted without ever creating an
// account - the manage_token in the URL is the only credential, emailed
// once when the load was posted. Only works while the load is still
// "open"; once it's claimed, changes need to go through support/admin
// since a carrier may already be relying on what was posted.

export async function GET(req, { params }) {
    const supabase = getServiceClient();
    const { data: load, error } = await supabase
      .from("loads")
      .select("id, pickup_city, delivery_city, pickup_date, equipment_type, rate, commodity, weight_lbs, notes, status, created_at, carrier:carriers(id, company_name)")
      .eq("manage_token", params.token)
      .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!load) return Response.json({ load: null }, { status: 404 });

  return Response.json({ load });
}

export async function PATCH(req, { params }) {
    const supabase = getServiceClient();
    const body = await req.json();

  const { data: load, error: fetchErr } = await supabase
      .from("loads")
      .select("id, status")
      .eq("manage_token", params.token)
      .maybeSingle();

  if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 500 });
    if (!load) return Response.json({ error: "Load not found." }, { status: 404 });
   if (load.status !== "open" && load.status !== "on_hold") {
        return Response.json(
          { error: "This load has already been claimed and can no longer be edited here." },
          { status: 409 }
              );
  }

  const updates = {};
    if (body.reopen && load.status === "on_hold") {
          updates.status = "open";
          updates.claimed_by_carrier_id = null;
          updates.claimed_at = null;
    } else if (body.cancel) {
          updates.status = "cancelled";
    } else if (load.status === "open") {
          if (body.rate !== undefined) updates.rate = body.rate || null;
          if (body.notes !== undefined) updates.notes = body.notes || null;
          if (body.pickup_date !== undefined) updates.pickup_date = body.pickup_date;
    }
  const { data, error } = await supabase
      .from("loads")
      .update(updates)
      .eq("id", load.id)
      .select()
      .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ load: data });
}

// Lets the shipper who posted this load (manage_token is their only
// credential) leave a rating for the carrier once it's delivered. Moved
// here from a carrier-id-only endpoint that had no ownership check at all -
// anyone who knew a load's id could rate it, including the carrier rating
// themselves. The manage_token is what proves this is actually the shipper.
export async function POST(req, { params }) {
  const supabase = getServiceClient();
  const body = await req.json().catch(() => ({}));

  const rating = Number(body.rating);
  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  const { data: load, error: fetchErr } = await supabase
    .from("loads")
    .select("id, status, claimed_by_carrier_id")
    .eq("manage_token", params.token)
    .maybeSingle();

  if (fetchErr) return Response.json({ error: fetchErr.message }, { status: 500 });
  if (!load) return Response.json({ error: "Load not found." }, { status: 404 });
  if (load.status !== "delivered") {
    return Response.json({ error: "This load hasn't been marked delivered yet." }, { status: 409 });
  }
  if (!load.claimed_by_carrier_id) {
    return Response.json({ error: "This load has no carrier assigned to rate." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("carrier_ratings")
    .insert({
      load_id: load.id,
      carrier_id: load.claimed_by_carrier_id,
      rating,
      comment: body.comment || null,
      rater_name: body.rater_name || null,
      rater_email: body.rater_email || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return Response.json({ error: "This load has already been rated." }, { status: 409 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ rating: data }, { status: 201 });
}
