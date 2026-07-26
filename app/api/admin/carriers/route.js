import { getServiceClient } from "../../../../lib/supabase";
import { isAdminRequest } from "../../../../lib/admin-auth";

export async function GET(req) {
  if (!isAdminRequest(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("carriers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ carriers: data });
}
