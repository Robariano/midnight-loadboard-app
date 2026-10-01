import { getServiceClient } from "../../../../../lib/supabase";
import { getCarrierIdFromRequest } from "../../../../../lib/carrier-auth";

// First step of load status tracking: the carrier marks a load picked up
// once the driver has the freight loaded, so anyone watching (the shipper
// today, a broker eventually) can see real progress instead of a static
// "confirmed" status all the way until delivery.
export async function POST(req, { params }) {
  const loadId = params.id;
  const supabase = getServiceClient();

  const carrierId = getCarrierIdFromRequest(req);
  if (!carrierId) return Response.json({ error: "Please log in." }, { status: 401 });

  const { data, error } = await supabase
    .from("loads")
    .update({ status: "picked_up" })
    .eq("id", loadId)
    .eq("claimed_by_carrier_id", carrierId) // only the carrier who claimed it can update it
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
