import { getServiceClient } from "../../../../lib/supabase";
import { isAdminRequest } from "../../../../lib/admin-auth";
import crypto from "crypto";
import { STATUS_KEYS, LINK_DAYS, clean } from "../../../../lib/driverStatus";

function newToken() {
  return crypto.randomBytes(18).toString("base64url");
}

// Admin-only: list and create driver status links.
export async function GET(req) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("driver_status_links")
    .select("id, token, driver_name, lane, pickup_text, status, message, events, created_at, updated_at, expires_at, revoked_at, view_count, last_viewed_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ links: data });
}

export async function POST(req) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const driver_name = clean(body.driver_name, 60);
  if (!driver_name) return Response.json({ error: "Add the driver's name." }, { status: 400 });

  const status = STATUS_KEYS.has(body.status) ? body.status : "looking";
  const message = clean(body.message, 500);
  const now = new Date();

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("driver_status_links")
    .insert({
      token: newToken(),
      driver_name,
      lane: clean(body.lane, 120),
      pickup_text: clean(body.pickup_text, 80),
      status,
      message,
      events: [{ status, message, at: now.toISOString() }],
      updated_at: now.toISOString(),
      expires_at: new Date(now.getTime() + LINK_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id, token")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, link: data });
}
