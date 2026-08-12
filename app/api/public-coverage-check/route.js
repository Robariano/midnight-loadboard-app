import { getServiceClient } from "../../../lib/supabase";
import { checkRateLimit } from "../../../lib/rate-limit";
import { sendCoverageFlagNoticeEmail } from "../../../lib/email";
import { v4 as uuidv4 } from "uuid";

// Genuinely public coverage check — no carrier login required. This is
// the "30-second, no account needed" tool described in Midnight
// Loadboard's marketing. A driver names who they're driving for and
// answers one question; if the company doesn't have an account yet, a
// lightweight "unclaimed" carrier record is created so the flag still
// attaches to the right company. Distinct from /api/standalone-attestation,
// which requires a logged-in verified carrier and is for a carrier
// checking on a driver they're assigning, not a driver checking on
// themselves.
export async function POST(req) {
  const rateLimit = await checkRateLimit(req, "public_coverage_check", { maxPerWindow: 10, windowMinutes: 1440 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many checks from this network. Try again in ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const carrierName = (body.carrier_name || "").trim();
  const dotNumber = (body.dot_number || "").trim();
  const response = body.response; // "covered" | "not_covered"

  if (!carrierName) {
    return Response.json({ error: "Please enter the company name you're driving for." }, { status: 400 });
  }
  if (response !== "covered" && response !== "not_covered") {
    return Response.json({ error: "Please answer the coverage question." }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Find an existing carrier by DOT number first (most reliable match),
  // otherwise fall back to a case-insensitive name match.
  let carrier = null;

  if (dotNumber) {
    const { data } = await supabase
      .from("carriers")
      .select("id, contact_email, company_name, lifetime_flag_count, open_flag_count")
      .eq("dot_number", dotNumber)
      .maybeSingle();
    if (data) carrier = data;
  }

  if (!carrier) {
    const { data } = await supabase
      .from("carriers")
      .select("id, contact_email, company_name, lifetime_flag_count, open_flag_count")
      .ilike("company_name", carrierName)
      .maybeSingle();
    if (data) carrier = data;
  }

  // No existing account for this company — create a lightweight,
  // unclaimed record so the check still attaches to something. This
  // carrier never went through verification and won't show up as
  // "verified" anywhere public.
  if (!carrier) {
    const { data, error: createErr } = await supabase
      .from("carriers")
      .insert({
        company_name: carrierName,
        dot_number: dotNumber || null,
        verified_status: "unclaimed",
      })
      .select("id, contact_email, company_name, lifetime_flag_count, open_flag_count")
      .single();
    if (createErr) return Response.json({ error: createErr.message }, { status: 500 });
    carrier = data;
  }

  const isCovered = response === "covered";

  const { data: attestation, error: attestErr } = await supabase
    .from("coverage_attestations")
    .insert({
      load_id: null,
      carrier_id: carrier.id,
      driver_name: null,
      driver_contact: null,
      is_self_attestation: true,
      token: uuidv4(), // not used for a follow-up link here, just satisfies the column
      response: isCovered ? "own_authority" : "neither",
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (attestErr) return Response.json({ error: attestErr.message }, { status: 500 });

  if (!isCovered) {
    await supabase.from("coverage_flags").insert({
      attestation_id: attestation.id,
      carrier_id: carrier.id,
      status: "open",
    });

    await supabase
      .from("carriers")
      .update({
        lifetime_flag_count: (carrier.lifetime_flag_count || 0) + 1,
        open_flag_count: (carrier.open_flag_count || 0) + 1,
      })
      .eq("id", carrier.id);

    if (carrier.contact_email) {
      sendCoverageFlagNoticeEmail(carrier.contact_email, carrier.company_name).catch((err) =>
        console.error("[email] Failed to send coverage flag notice:", err.message)
      );
    }
  }

  return Response.json({ ok: true, flagged: !isCovered });
}
