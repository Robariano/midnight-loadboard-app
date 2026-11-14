import { getServiceClient } from "../../../lib/supabase";
import { checkRateLimit } from "../../../lib/rate-limit";
import { sendDispatchLeadAlertSMS } from "../../../lib/twilio";
import { sendDispatchLeadAlertEmail } from "../../../lib/email";
import { lookupCarrierByDot, lookupCarrierByMc } from "../../../lib/fmcsa";

// Best-effort FMCSA check so each lead arrives already vetted (authority,
// trucks, insurance) instead of Rob looking every one up by hand. Capped at
// 6s so a slow FMCSA/SAFER never holds up the visitor's submission; any
// failure just means no auto-check line.
async function fmcsaCheckLine({ dotNumber, mcNumber }) {
  const cleanDot = dotNumber.replace(/\D/g, "");
  const cleanMc = mcNumber.replace(/\D/g, "");
  if (!cleanDot && !cleanMc) return null;
  try {
    const snap = await Promise.race([
      cleanDot ? lookupCarrierByDot(cleanDot) : lookupCarrierByMc(cleanMc),
      new Promise((resolve) => setTimeout(() => resolve("timeout"), 6000)),
    ]);
    if (snap === "timeout") return "FMCSA auto-check: timed out. Check SAFER by hand.";
    if (!snap) return `FMCSA auto-check: no FMCSA record found for ${cleanDot ? "DOT " + cleanDot : "MC " + cleanMc}. Double-check the number.`;
    const names = [snap.legalName, snap.dbaName && `dba ${snap.dbaName}`].filter(Boolean).join(" ");
    const property = (snap.authorities || []).some((a) => a.type === "Property");
    const authority = snap.authorityUnknown
      ? "authority: couldn't confirm (check SAFER)"
      : property ? "AUTHORIZED for property" : "NOT authorized for property yet";
    const parts = [
      `${names || "Unknown name"} (DOT ${snap.dotNumber})`,
      snap.outOfService ? "OUT OF SERVICE" : null,
      !snap.allowToOperate ? "not allowed to operate" : null,
      authority,
      snap.powerUnits === null ? null : `${snap.powerUnits} power unit${snap.powerUnits === 1 ? "" : "s"}${snap.powerUnits === 0 ? " (brokers may reject)" : ""}`,
      snap.bipdInsuranceAmount ? `$${Math.round(snap.bipdInsuranceAmount / 1000)}K liability on file` : "insurance not in FMCSA feed (get their COI)",
    ].filter(Boolean);
    return `FMCSA auto-check: ${parts.join(" · ")}${snap.authoritySource === "safer" ? " (authority via SAFER)" : ""}`;
  } catch {
    return null;
  }
}

// Genuinely public lead form - no login needed. Captures two real cases
// (see app/dispatch/_DispatcherForm.js and the migration for why they're
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
  const source = String(body.source || "").trim();

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

  const autoCheck = hasOwnAuthority ? await fmcsaCheckLine({ dotNumber, mcNumber }) : null;
  const notesWithCheck = [notes, autoCheck].filter(Boolean).join("\n");

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
    notes: notesWithCheck || null,
    source: source || null,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Best-effort text alert so this lead does not sit unseen in the admin
  // dashboard — never lets a Twilio problem fail the visitor's submission.
  try {
    await sendDispatchLeadAlertSMS({
      companyName,
      hasOwnAuthority,
      mcNumber,
      dotNumber,
      leasedUnderCompany,
      contactPhone,
      contactEmail,
    });
  } catch (smsError) {
    console.error("Failed to send dispatch lead alert SMS:", smsError);
  }

  // Email backup, independent of Twilio, so the lead still arrives if
  // texting is down.
  try {
    await sendDispatchLeadAlertEmail({
      companyName, hasOwnAuthority, mcNumber, dotNumber, leasedUnderCompany,
      contactName, contactPhone, contactEmail, notes: notesWithCheck, source,
    });
  } catch (emailError) {
    console.error("Failed to send dispatch lead alert email:", emailError);
  }

  return Response.json({ ok: true }, { status: 201 });
}
