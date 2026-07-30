import { getServiceClient } from "../../../../../lib/supabase";

export async function POST(req, { params }) {
    const carrierId = params.id;
    const body = await req.json();
    const supabase = getServiceClient();

  if (!body.carrier_secret) {
        return Response.json({ error: "Carrier secret is required." }, { status: 400 });
  }

  const { data: carrier, error: carrierErr } = await supabase
      .from("carriers").select("*").eq("id", carrierId).single();
    if (carrierErr || !carrier) return Response.json({ error: "Carrier not found." }, { status: 404 });
    if (carrier.carrier_secret !== body.carrier_secret) {
          return Response.json({ error: "Carrier ID or secret is incorrect." }, { status: 401 });
    }

  const { error: updateErr } = await supabase
      .from("carriers")
      .update({
              contact_phone: body.contact_phone || null,
              dot_number: body.dot_number || null,
              mc_number: body.mc_number || null,
              cdl_class: body.cdl_class || null,
              cdl_link: body.cdl_link || null,
              insurance_link: body.insurance_link || null,
              authority_link: body.authority_link || null,
              insurance_expiration_date: body.insurance_expiration_date || null,
              verified_status: "pending",
              insurance_alert_sent_at: null,
      })
      .eq("id", carrierId);

  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 });

  return Response.json({ ok: true });
}
