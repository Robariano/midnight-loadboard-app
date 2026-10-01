import { getServiceClient } from "../../../../../lib/supabase";
import { getCarrierIdFromRequest } from "../../../../../lib/carrier-auth";
import { sendDocumentEmail } from "../../../../../lib/email";

// Lets a carrier email one of their own saved documents (BOL, rate con,
// lumper receipt, POD, etc.) straight to a factoring company, broker, or
// anyone else - instead of downloading it and attaching it to an email
// themselves. Every send is logged to document_sends so there's a record
// of what went out, to whom, and when.

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export async function POST(req, { params }) {
  const carrierId = getCarrierIdFromRequest(req);
  if (!carrierId) return Response.json({ error: "Not logged in." }, { status: 401 });

  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const recipientEmail = String(body.recipient_email || "").trim();
  const recipientLabel = String(body.recipient_label || "").trim() || null;
  const note = String(body.note || "").trim() || null;

  if (!looksLikeEmail(recipientEmail)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Confirm the document actually belongs to this carrier before sending anything.
  const { data: doc, error: docError } = await supabase
    .from("driver_documents")
    .select("id, document_type, file_url, carrier_id")
    .eq("id", id)
    .eq("carrier_id", carrierId)
    .single();

  if (docError || !doc) {
    return Response.json({ error: "Document not found." }, { status: 404 });
  }

  const { data: carrier } = await supabase
    .from("carriers")
    .select("company_name")
    .eq("id", carrierId)
    .single();

  try {
    await sendDocumentEmail(
      recipientEmail,
      carrier?.company_name || "A Nightlane carrier",
      doc.document_type,
      doc.file_url,
      note
    );
  } catch (err) {
    return Response.json({ error: err.message || "Couldn't send the email." }, { status: 500 });
  }

  const { data: sendRecord, error: sendError } = await supabase
    .from("document_sends")
    .insert({
      document_id: doc.id,
      carrier_id: carrierId,
      recipient_email: recipientEmail,
      recipient_label: recipientLabel,
      note,
    })
    .select()
    .single();

  if (sendError) return Response.json({ error: sendError.message }, { status: 500 });
  return Response.json({ send: sendRecord }, { status: 201 });
}
