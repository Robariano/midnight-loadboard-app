import crypto from "crypto";

// Admin session handling. The admin_pw cookie used to literally BE the
// admin password in plaintext, which meant anyone who saw a request's
// Cookie header (logs, a proxy, a browser devtools screenshot, etc.) saw
// the real password - bad, especially since people often reuse passwords.
// Now the cookie is an opaque signed token instead: knowing the token does
// not let you recover the password. The signing key is derived from
// ADMIN_PASSWORD itself (via sha256) so there's no separate secret to
// configure or forget to set.

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, same as before

function getSigningKey() {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) {
          throw new Error("[admin-auth] ADMIN_PASSWORD is not set - cannot sign or verify admin sessions.");
    }
    return crypto.createHash("sha256").update(password).digest();
}

function sign(value) {
    return crypto.createHmac("sha256", getSigningKey()).update(value).digest("hex");
}

function safeEqual(a, b) {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}
export function createAdminSessionCookie() {
    const payload = `admin.${Date.now()}`;
    const signature = sign(payload);
    const token = `${payload}.${signature}`;
    return `admin_pw=${encodeURIComponent(token)}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_MS / 1000}`;
}
export function clearAdminSessionCookie() {
    return `admin_pw=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0`;
}

export function isAdminRequest(req) {
    if (!process.env.ADMIN_PASSWORD) return false;
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/admin_pw=([^;]+)/);
    if (!match) return false;

  const token = decodeURIComponent(match[1]);
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [tag, timestamp, signature] = parts;
    if (tag !== "admin") return false;

  const expected = sign(`${tag}.${timestamp}`);
    if (!safeEqual(expected, signature)) return false;

  const age = Date.now() - Number(timestamp);
    if (!Number.isFinite(age) || age < 0 || age > SESSION_MAX_AGE_MS) return false;

  return true;
}
