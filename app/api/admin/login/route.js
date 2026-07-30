import { getServiceClient } from "../../../../lib/supabase";

// Basic per-IP lockout: without this, /api/admin/login had no rate limit at
// all, and a compromised ADMIN_PASSWORD would expose every carrier_secret
// at once via GET /api/admin/carriers. This doesn't make brute-forcing
// impossible, but it removes "hammer it forever for free" as an option.
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 15;

function getClientIp(req) {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req) {
    const { password } = await req.json();

  if (!process.env.ADMIN_PASSWORD) {
        return Response.json(
          { error: "ADMIN_PASSWORD is not set in your environment variables." },
          { status: 500 }
              );
  }

  const supabase = getServiceClient();
    const ip = getClientIp(req);
    const now = new Date();

  const { data: record } = await supabase
      .from("admin_login_attempts")
      .select("*")
      .eq("ip", ip)
      .maybeSingle();

  if (record?.locked_until && new Date(record.locked_until) > now) {
        const minutesLeft = Math.ceil((new Date(record.locked_until) - now) / 60000);
        return Response.json(
          { error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.` },
          { status: 429 }
              );
  }

  const windowExpired =
        record?.first_failed_at &&
        now - new Date(record.first_failed_at) > WINDOW_MINUTES * 60 * 1000;

  if (password !== process.env.ADMIN_PASSWORD) {
        const failedCount = windowExpired || !record ? 1 : (record.failed_count || 0) + 1;
        const firstFailedAt = windowExpired || !record ? now.toISOString() : record.first_failed_at;
        const lockedUntil =
                failedCount >= MAX_ATTEMPTS
            ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
                  : null;

      await supabase.from("admin_login_attempts").upsert({
              ip,
              failed_count: failedCount,
              first_failed_at: firstFailedAt,
              locked_until: lockedUntil,
      });

      if (lockedUntil) {
              return Response.json(
                { error: `Too many failed attempts. Try again in ${LOCKOUT_MINUTES} minutes.` },
                { status: 429 }
                      );
      }
        return Response.json({ error: "Wrong password" }, { status: 401 });
  }

  if (record) {
        await supabase.from("admin_login_attempts").delete().eq("ip", ip);
  }

  const res = Response.json({ ok: true });
    // Simple cookie-based session for a single admin user (you).
  // Not meant for multiple admin accounts - fine for a solo founder running this by hand.
  res.headers.set(
        "Set-Cookie",
        `admin_pw=${encodeURIComponent(password)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`
      );
    return res;
}
