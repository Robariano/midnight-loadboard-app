import { getServiceClient } from "../../../lib/supabase";
import { hashPassword, createSessionCookie } from "../../../lib/carrier-auth";

export async function POST(req) {
    const body = await req.json();
    const supabase = getServiceClient();

  if (!body.password || body.password.length < 8) {
        return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const { data, error } = await supabase
      .from("carriers")
      .insert({
              company_name: body.company_name,
              contact_email: body.contact_email,
              contact_phone: body.contact_phone || null,
              dot_number: body.dot_number || null,
              mc_number: body.mc_number || null,
              cdl_class: body.cdl_class || null,
              cdl_link: body.cdl_link || null,
              insurance_link: body.insurance_link || null,
              authority_link: body.authority_link || null,
              insurance_expiration_date: body.insurance_expiration_date || null,
              verified_status: "pending",
              password_hash: hashPassword(body.password),
      })
      .select()
      .single();

  if (error) {
        console.error(error);
        return Response.json({ error: error.message }, { status: 500 });
  }

  const res = Response.json({ carrier: data }, { status: 201 });
    res.headers.set("Set-Cookie", createSessionCookie(data.id));
    return res;
}

export async function GET() {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("carriers")
      .select("id, company_name, verified_status, verified_date, open_flag_count")
      .eq("verified_status", "verified");

  if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ carriers: data });
}
