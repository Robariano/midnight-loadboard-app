import { getServiceClient } from "../../../../../lib/supabase";
import { getCarrierIdFromRequest } from "../../../../../lib/carrier-auth";

// Logged-in carrier: revoke a share link early (before it expires on its own).
// Ownership-checked - a carrier can only revoke their own share links.
export async function POST(req, { params }) {
  const carrierId = getCarrierIdFromRequest(req);
  if (!carrierId) return Response.json({ error: "Not logged in." }, { status: 401 });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("document_shares")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", params.id)
    .eq("carrier_id", carrierId)
    .select()
    .single();

  if (error || !data) return Response.json({ error: "Share link not found." }, { status: 404 });
  return Response.json({ share: data });
}
