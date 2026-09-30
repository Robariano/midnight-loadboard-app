import crypto from "crypto";
import { getServiceClient } from "../../../lib/supabase";
import { getCarrierIdFromRequest } from "../../../lib/carrier-auth";

const SHARE_TTL_DAYS = 30;

// Logged-in carrier: list my own share links.
export async function GET(req) {
  const carrierId = getCarrierIdFromRequest(req);
  if (!carrierId) return Response.json({ error: "Not logged in." }, { status: 401 });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("document_shares")
    .select("id, recipient_label, share_token, created_at, expires_at, revoked_at, view_count, last_viewed_at")
    .eq("carrier_id", carrierId)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ shares: data });
}

// Logged-in carrier: create a new share link for a specific recipient.
// document_ids omitted/null = share everything currently in the locker.
export async function POST(req) {
  const carrierId = getCarrierIdFromRequest(req);
  if (!carrierId) return Response.json({ error: "Not logged in." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const recipientLabel = String(body.recipient_label || "").trim();
  if (!recipientLabel) {
    return Response.json({ error: "Enter who you're sharing this with." }, { status: 400 });
  }
  const documentIds = Array.isArray(body.document_ids) && body.document_ids.length ? body.document_ids : null;

  const shareToken = crypto.randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + SHARE_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("document_shares")
    .insert({
      carrier_id: carrierId,
      recipient_label: recipientLabel,
      share_token: shareToken,
      document_ids: documentIds,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ share: data }, { status: 201 });
}
