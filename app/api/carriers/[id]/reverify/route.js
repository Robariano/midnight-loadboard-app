import { getServiceClient } from "../../../../../lib/supabase";
import { getCarrierIdFromRequest } from "../../../../../lib/carrier-auth";

export async function POST(req) {
      const supabase = getServiceClient();

  const carrierId = getCarrierIdFromRequest(req);
      if (!carrierId) {
              return Response.json({ error: "Please log in to update your verification." }, { status: 401 });
      }

  const body = await req.json();

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
