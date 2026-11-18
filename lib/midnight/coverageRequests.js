// Broker requests for Midnight coverage proofs (pilot). See
// supabase-migration-coverage-requests.sql for the flow.
import { createHash, timingSafeEqual } from "node:crypto";

export const normalizeRequest = (text) => String(text || "").trim().replace(/\s+/g, " ");

// Same id the contract stores and /coverage-check looks up.
export const requestKeyOf = (text) =>
  createHash("sha256").update(normalizeRequest(text).toLowerCase()).digest("hex");

const MAX_DOLLARS = 2 ** 32 - 1;

// Validates a broker's request form. Returns { ok, value } or { ok: false, error }.
export function parseCoverageRequest(body, now = new Date()) {
  const requestText = normalizeRequest(body?.request);
  const dot = String(body?.dot || "").replace(/\D/g, "");
  const money = (v) => Number(String(v ?? "").replace(/[$,\s]/g, ""));
  const minLiability = money(body?.liability);
  const minCargo = money(body?.cargo);
  const through = String(body?.through || "");
  const contact = String(body?.contact || "").trim().slice(0, 120) || null;

  if (requestText.length < 4 || requestText.length > 120) return { ok: false, error: "Describe the request in 4 to 120 characters, like \"MC 123456 load 1001\"." };
  if (!/^\d{1,8}$/.test(dot)) return { ok: false, error: "Enter the carrier's DOT number." };
  for (const [label, v] of [["Liability", minLiability], ["Cargo", minCargo]]) {
    if (!Number.isInteger(v) || v < 0 || v > MAX_DOLLARS) return { ok: false, error: `${label} minimum must be a whole dollar amount.` };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(through) || Number.isNaN(Date.parse(`${through}T23:59:59Z`))) return { ok: false, error: "Pick the date coverage must last through." };
  const end = Date.parse(`${through}T23:59:59Z`);
  if (end <= now.getTime()) return { ok: false, error: "The date must be in the future." };
  if (end > now.getTime() + 400 * 86_400_000) return { ok: false, error: "Pick a date within the next year." };

  return {
    ok: true,
    value: {
      request_text: requestText,
      request_key: requestKeyOf(requestText),
      dot_number: dot,
      min_liability: minLiability,
      min_cargo: minCargo,
      covered_through: through,
      broker_contact: contact,
    },
  };
}

// The worker on Nightlane's computer authenticates with this shared secret.
export function isCoverageWorker(req) {
  const secret = process.env.COVERAGE_WORKER_SECRET;
  if (!secret || secret.length < 32) return false;
  const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const publicRequest = (r) => ({
  request: r.request_text,
  dot: r.dot_number,
  minLiability: Number(r.min_liability),
  minCargo: Number(r.min_cargo),
  through: r.covered_through,
  status: r.status,
});
