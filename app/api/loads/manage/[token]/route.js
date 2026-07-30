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
      .select("id, pickup_city, delivery_city, pickup_date, equipment_type, rate, commodity, weight_lbs, notes, status, created_at")
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
    if (load.status !== "open") {
          return Response.json(
            { error: "This load has already been claimed and can no longer be edited here." },
            { status: 409 }
                );
    }

  const updates = {};
    if (body.cancel) {
          updates.status = "cancelled";
    } else {
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
