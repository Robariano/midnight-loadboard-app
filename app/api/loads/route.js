import { getServiceClient } from "../../../lib/supabase";

export async function POST(req) {
  const body = await req.json();
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("loads")
    .insert({
      pickup_city: body.pickup_city,
      delivery_city: body.delivery_city,
      pickup_date: body.pickup_date,
      equipment_type: body.equipment_type,
      rate: body.rate || null,
      commodity: body.commodity || null,
      weight_lbs: body.weight_lbs || null,
      notes: body.notes || null,
      shipper_name: body.shipper_name,
      shipper_email: body.shipper_email,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ load: data }, { status: 201 });
}

export async function GET() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("loads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ loads: data });
}
