import { getServiceClient } from "../../../../../lib/supabase";

// First step of load status tracking: the carrier marks a load picked up
// once the driver has the freight loaded, so anyone watching (the shipper
// today, a broker eventually) can see real progress instead of a static
// "confirmed" status all the way until delivery.
export async function POST(req, { params }) {
  const loadId = params.id;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("loads")
    .update({ status: "picked_up" })
    .eq("id", loadId)
    .eq("status", "confirmed") // only pickup-able once coverage was confirmed
    .select()
    .single();

  if (error || !data) {
    return Response.json(
      { error: "This load can't be marked picked up yet — coverage must be confirmed first." },
      { status: 409 }
    );
  }

  return Response.json({ load: data });
}
