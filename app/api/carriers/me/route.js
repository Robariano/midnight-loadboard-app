import { getServiceClient } from "../../../../lib/supabase";
import { getCarrierIdFromRequest } from "../../../../lib/carrier-auth";

export async function GET(req) {
    const carrierId = getCarrierIdFromRequest(req);
    if (!carrierId) return Response.json({ carrier: null });

  const supabase = getServiceClient();
    const { data: carrier } = await supabase
      .from("carriers")
      .select("id, company_name, verified_status")
      .eq("id", carrierId)
      .maybeSingle();

  return Response.json({ carrier: carrier || null });
}
