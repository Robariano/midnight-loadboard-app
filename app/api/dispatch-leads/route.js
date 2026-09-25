import { getServiceClient } from "../../../lib/supabase";
import { checkRateLimit } from "../../../lib/rate-limit";

// Genuinely public lead form - no login needed. Captures two real cases
// (see app/need-a-dispatcher/page.js and the migration for why they're
// handled differently):
//   1. A carrier who already holds their own MC/DOT authority - can be
//      signed directly as a dispatch client.
//   2. A driver running under someone else's authority - can't be signed
//      directly (the dispatch relationship legally has to go through
//      whoever holds that authority), but is still worth capturing so the
//      follow-up can be "reach out to that carrier about the whole fleet."
// Nothing here is shown publicly; only the admin panel
// (app/admin/dispatch-leads/page.js) reads these rows.
export async function POST(req) {
  const rateLimit = await checkRateLimit(req, "dispatch_lead", { maxPerWindow: 5, windowMinutes: 1440 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many submissions from this network. Try again in ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? "" : "s"}.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const companyName = String(body.company_name || "").trim();
  const hasOwnAuthority = body.has_own_authority === true;
  const mcNumber = String(body.mc_number || "").trim();
  const dotNumber = String(body.dot_number || "").trim();
  const leasedUnderCompany = String(body.leased_under_company || "").trim();
  const contactName = String(body.contact_name || "").trim();
  const contactEmail = String(body.contact_email || "").trim();
  const contactPhone = String(body.contact_phone || "").trim();
  const notes = String(body.notes || "").trim();

  if (!companyName) {
    return Response.json({ error: "Enter your name or your company's name." }, { status: 400 });
  }
  if (hasOwnAuthority && !mcNumber && !dotNumber) {
    return Response.json({ error: "Enter your MC or DOT number." }, { status: 400 });
  }
  if (!hasOwnAuthority && !leasedUnderCompany) {
    return Response.json({ error: "Enter the name of the carrier whose authority you're running under." }, { status: 400 });
  }
  if (!contactEmail && !contactPhone) {
    return Response.json({ error: "Enter an email or phone number so we can reach you." }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("dispatch_leads").insert({
    company_name: companyName,
    has_own_authority: hasOwnAuthority,
    mc_number: hasOwnAuthority ? (mcNumber || null) : null,
    dot_number: hasOwnAuthority ? (dotNumber || null) : null,
    leased_under_company: hasOwnAuthority ? null : leasedUnderCompany,
    contact_name: contactName || null,
    contact_email: contactEmail || null,
    contact_phone: contactPhone || null,
    notes: notes || null,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}
