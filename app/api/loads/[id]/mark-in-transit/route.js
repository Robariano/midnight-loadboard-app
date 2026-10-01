import { getServiceClient } from "../../../../../lib/supabase";
import { getCarrierIdFromRequest } from "../../../../../lib/carrier-auth";

// Second step of load status tracking: marks a load in transit once it's
// picked up and moving. Allows skipping straight from "confirmed" too,
// since logging the picked-up step is a convenience, not a requirement.
export async function POST(req, { params }) {
  const loadId = params.id;
  const supabase = getServiceClient();

  const carrierId = getCarrierIdFromRequest(req);
  if (!carrierId) return Response.json({ error: "Please log in." }, { status: 401 });

  const { data, error } = await supabase
    .from("loads")
    .update({ status: "in_transit" })
    .eq("id", loadId)
    .eq("claimed_by_carrier_id", carrierId) // only the carrier who claimed it can update it
    .in("status", ["confirmed", "picked_up"])
    .select()
    .single();

  if (error || !data) {
    return Response.json(
      { error: "This load can't be marked in transit yet." },
      { status: 409 }
    );
  }

  return Response.json({ load: data });
}
