import { getServiceClient } from "../../../lib/supabase";
import { getCarrierIdFromRequest } from "../../../lib/carrier-auth";

// Private, per-carrier document storage. A driver uploads a file once and
// gets a reliable, timestamped record of it - fast, no wallet, no minting.
// Only the logged-in carrier can see or add to their own documents.

export async function GET(req) {
  const carrierId = getCarrierIdFromRequest(req);
  if (!carrierId) return Response.json({ error: "Not logged in." }, { status: 401 });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("driver_documents")
    .select("id, document_type, file_url, original_filename, notes, submitted_at")
    .eq("carrier_id", carrierId)
    .order("submitted_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ documents: data });
}

export async function POST(req) {
  const carrierId = getCarrierIdFromRequest(req);
  if (!carrierId) return Response.json({ error: "Not logged in." }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  const documentType = String(formData.get("document_type") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!file || !documentType) {
    return Response.json({ error: "A file and document type are required." }, { status: 400 });
  }

  const supabase = getServiceClient();
  const filePath = `${carrierId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("driver-documents")
    .upload(filePath, file);

  if (uploadError) return Response.json({ error: uploadError.message }, { status: 500 });

    const { data: urlData, error: urlError } = await supabase.storage
    .from("driver-documents")
    .createSignedUrl(filePath, 60 * 60 * 24 * 365);

  if (urlError) return Response.json({ error: urlError.message }, { status: 500 });

  const { data, error } = await supabase
    .from("driver_documents")
    .insert({
      carrier_id: carrierId,
      document_type: documentType,
      file_url: urlData.signedUrl,      original_filename: file.name,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ document: data }, { status: 201 });
}
