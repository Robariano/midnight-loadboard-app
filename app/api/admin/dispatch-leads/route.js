import { getServiceClient } from "../../../../lib/supabase";
import { isAdminRequest } from "../../../../lib/admin-auth";

// Admin-only listing of "Need a Dispatcher?" leads. Nothing here is public.
export async function GET(req) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("dispatch_leads")
    .select("id, company_name, has_own_authority, mc_number, dot_number, leased_under_company, contact_name, contact_email, contact_phone, notes, status, created_at")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ leads: data });
}
