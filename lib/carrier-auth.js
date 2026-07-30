import crypto from "crypto";

// Real carrier auth: password hashing (scrypt, built into Node - no extra
// dependency) plus a signed HttpOnly session cookie, replacing the old
// "paste your carrier_id + carrier_secret into every form" approach.
// Requires CARRIER_SESSION_SECRET to be set (any long random string).

const SESSION_SECRET = process.env.CARRIER_SESSION_SECRET;
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
    if (!stored) return false;
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const [scheme, salt, hash] = parts;
    if (scheme !== "scrypt") return false;
    const check = crypto.scryptSync(password, salt, 64).toString("hex");
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(check, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

function sign(value) {
    return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

function safeEqual(a, b) {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionCookie(carrierId) {
    const payload = `${carrierId}.${Date.now()}`;
    const signature = sign(payload);
    const token = `${payload}.${signature}`;
    return `carrier_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_MS / 1000}`;
}

export function clearSessionCookie() {
    return `carrier_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

export function getCarrierIdFromRequest(req) {
    if (!SESSION_SECRET) {
          console.error("[carrier-auth] CARRIER_SESSION_SECRET is not set - carrier sessions cannot be verified.");
          return null;
    }
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/carrier_session=([^;]+)/);
    if (!match) return null;

  const token = decodeURIComponent(match[1]);
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [carrierId, timestamp, signature] = parts;

  const expected = sign(`${carrierId}.${timestamp}`);
    if (!safeEqual(expected, signature)) return null;

  const age = Date.now() - Number(timestamp);
    if (!Number.isFinite(age) || age < 0 || age > SESSION_MAX_AGE_MS) return null;

  return carrierId;
}
