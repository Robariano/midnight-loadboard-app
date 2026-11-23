import { getServiceClient } from "../../../../../lib/supabase";
import { isAdminRequest } from "../../../../../lib/admin-auth";
import { STATUS_KEYS, LINK_DAYS, clean } from "../../../../../lib/driverStatus";

// Admin-only: update a driver status link (new status and/or message,
// lane/pickup edits, turn the link off). Every status change is appended
// to the link's history so the driver sees what happened and when.
export async function PATCH(req, { params }) {
  if (!isAdminRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const supabase = getServiceClient();
  const { data: link, error: readError } = await supabase
    .from("driver_status_links")
    .select("id, status, message, events")
    .eq("id", params.id)
    .single();
  if (readError || !link) return Response.json({ error: "Link not found." }, { status: 404 });

  const now = new Date();
  const update = {};

  if (body.revoke === true) update.revoked_at = now.toISOString();
  if ("lane" in body) update.lane = clean(body.lane, 120);
  if ("pickup_text" in body) update.pickup_text = clean(body.pickup_text, 80);

  const hasStatus = typeof body.status === "string";
  const hasMessage = "message" in body;
  if (hasStatus && !STATUS_KEYS.has(body.status)) {
    return Response.json({ error: "Unknown status." }, { status: 400 });
  }
  if (hasStatus || hasMessage) {
    const status = hasStatus ? body.status : link.status;
    const message = hasMessage ? clean(body.message, 500) : link.message;
    update.status = status;
    update.message = message;
    const events = Array.isArray(link.events) ? link.events : [];
    update.events = [...events, { status, message, at: now.toISOString() }].slice(-50);
    // Any real update keeps the link alive for another LINK_DAYS.
    update.expires_at = new Date(now.getTime() + LINK_DAYS * 24 * 60 * 60 * 1000).toISOString();
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: "Nothing to change." }, { status: 400 });
  }
  update.updated_at = now.toISOString();

  const { error } = await supabase.from("driver_status_links").update(update).eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
