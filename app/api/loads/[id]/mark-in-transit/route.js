import { getServiceClient } from "../../../../../lib/supabase";
import { getCarrierIdFromRequest } from "../../../../../lib/carrier-auth";
import { sendLoadStatusUpdateEmail, looksLikeEmail } from "../../../../../lib/email";

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

  // Best-effort - a failed or slow email never blocks the status update
  // itself, which has already been saved at this point.
  if (looksLikeEmail(data.shipper_email)) {
    const baseUrl = process.env.APP_BASE_URL || "https://midnightloadboard.com";
    const manageUrl = `${baseUrl}/loads/manage/${data.manage_token}`;
    try {
      await sendLoadStatusUpdateEmail(data.shipper_email, data.pickup_city, data.delivery_city, "in_transit", manageUrl);
    } catch (err) {
      console.error(`[email] Failed to send in_transit update for load ${data.id}:`, err.message);
    }
  }

  return Response.json({ load: data });
}
