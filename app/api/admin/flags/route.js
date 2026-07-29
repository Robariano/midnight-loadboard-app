import { getServiceClient } from "../../../../lib/supabase";
import { isAdminRequest } from "../../../../lib/admin-auth";

export async function GET(req) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("coverage_flags")
    .select(
      `*,
      carrier:carriers(id, company_name, contact_email, open_flag_count, lifetime_flag_count),
      attestation:coverage_attestations(driver_name, driver_contact, response, load:loads(id, pickup_city, delivery_city, status))`
    )
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ flags: data });
}
