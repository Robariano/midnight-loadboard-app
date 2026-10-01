import { getServiceClient } from "../../../../lib/supabase";
import { getCarrierIdFromRequest } from "../../../../lib/carrier-auth";
import { v4 as uuidv4 } from "uuid";
import { geocodeLoadCities } from "../../../../lib/geocode";

// Lets a carrier log a load they already have - found on DAT, Truckstop, a
// phone call, anywhere - so they can use status tracking on it the same way
// as a load posted through Midnight Loadboard itself. Skips the public
// posting/claim flow entirely: it's created already "confirmed" and owned
// by this carrier, since there's nothing to claim - they already have it.
// A manage_token is generated too, so the carrier can optionally hand a
// private status link to whoever they got the load from (a broker, a
// shipper), the same link style shippers already get when they post here.
export async function POST(req) {
  const carrierId = getCarrierIdFromRequest(req);
  if (!carrierId) return Response.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json().catch(() => ({}));

  if (!body.pickup_city || !body.delivery_city || !body.pickup_date || !body.equipment_type) {
    return Response.json(
      { error: "Pickup city, delivery city, pickup date, and equipment type are required." },
      { status: 400 }
    );
  }

  const supabase = getServiceClient();
  const manageToken = uuidv4();

  // Best-effort - a slow or failed geocode just means no map coordinates
  // get saved, never blocks tracking the load.
  const { pickup: pickupGeo, delivery: deliveryGeo } = await geocodeLoadCities(
    body.pickup_city,
    body.delivery_city
  );

  const { data, error } = await supabase
    .from("loads")
    .insert({
      pickup_city: body.pickup_city,
      delivery_city: body.delivery_city,
      pickup_date: body.pickup_date,
      equipment_type: body.equipment_type,
      rate: body.rate || null,
      notes: body.notes || null,
      shipper_name: body.shipper_name || null,
      shipper_email: null,
      status: "confirmed",
      claimed_by_carrier_id: carrierId,
      claimed_at: new Date().toISOString(),
      manage_token: manageToken,
      pickup_lat: pickupGeo?.lat ?? null,
      pickup_lng: pickupGeo?.lng ?? null,
      delivery_lat: deliveryGeo?.lat ?? null,
      delivery_lng: deliveryGeo?.lng ?? null,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const baseUrl = process.env.APP_BASE_URL || "https://midnightloadboard.com";
  return Response.json(
    { load: data, manageUrl: `${baseUrl}/loads/manage/${manageToken}` },
    { status: 201 }
  );
}
