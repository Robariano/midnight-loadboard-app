import { getServiceClient } from "./supabase";

// Simple per-IP submission cap for public, unauthenticated forms (load
// posting, carrier signup). Unlike the login lockouts, there's no "wrong
// password" here - every submission counts, so this just caps how many
// times one IP can hit a given form within a rolling window.

export function getClientIp(req) {
    const fwd = req.headers.get("x-forwarded-for");
    if (fwd) return fwd.split(",")[0].trim();
    return req.headers.get("x-real-ip") || "unknown";
}

// Returns { allowed: true } or { allowed: false, retryAfterMinutes }.
export async function checkRateLimit(req, formType, { maxPerWindow, windowMinutes }) {
    const supabase = getServiceClient();
    const ip = getClientIp(req);
    const now = new Date();

  const { data: record } = await supabase
      .from("public_form_attempts")
      .select("*")
      .eq("ip", ip)
      .eq("form_type", formType)
      .maybeSingle();

  const windowExpired =
        record && now - new Date(record.window_start) > windowMinutes * 60 * 1000;

  const count = !record || windowExpired ? 1 : (record.count || 0) + 1;
    const windowStart = !record || windowExpired ? now.toISOString() : record.window_start;

  if (count > maxPerWindow) {
        const retryAfterMinutes = Math.ceil(
                (new Date(windowStart).getTime() + windowMinutes * 60 * 1000 - now.getTime()) / 60000
              );
        return { allowed: false, retryAfterMinutes: Math.max(retryAfterMinutes, 1) };
  }

  await supabase.from("public_form_attempts").upsert({
        ip,
        form_type: formType,
        count,
        window_start: windowStart,
        updated_at: now.toISOString(),
  });

  return { allowed: true };
}
