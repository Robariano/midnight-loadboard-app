// Email fallback helper — sends the driver their private coverage
// confirmation link when driver_contact is an email address instead of a
// phone number (SMS is handled separately in lib/twilio.js).
//
// Uses Resend's REST API directly via fetch (no SDK dependency needed),
// matching the pattern used in lib/twilio.js. Requires RESEND_API_KEY and
// RESEND_FROM_EMAIL — see .env.local.example.

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

export function looksLikeEmail(contact) {
  if (!contact) return false;
  // Simple, deliberately permissive check — good enough to route to the
  // right channel, not meant to be a full RFC 5322 validator.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());
}

async function sendEmail(to, subject, text, html) {
  if (!resendApiKey || !fromEmail) {
    throw new Error(
      "Resend is not configured — set RESEND_API_KEY and RESEND_FROM_EMAIL."
    );
  }

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: fromEmail, to, subject, text, html }),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.message || `Resend request failed with status ${resp.status}`);
  }

  return { id: data.id };
}

export async function sendCoverageConfirmationEmail(driverEmail, driverName, confirmUrl) {
  const greeting = driverName ? `Hi ${driverName},` : "Hi,";
  const subject = "Confirm your coverage — Midnight Loadboard";
  const text =
    `${greeting}\n\n` +
    `You've been assigned a load on Midnight Loadboard. Please confirm your ` +
    `insurance coverage for this trip using the private link below:\n\n` +
    `${confirmUrl}\n\n` +
    `This link is private to you and cannot be seen or changed by the carrier.`;

  const html =
    `<p>${greeting}</p>` +
    `<p>You've been assigned a load on Midnight Loadboard. Please confirm your ` +
    `insurance coverage for this trip using the private link below:</p>` +
    `<p><a href="${confirmUrl}">${confirmUrl}</a></p>` +
    `<p style="color:#888;font-size:13px;">This link is private to you and cannot be seen or changed by the carrier.</p>`;

  return sendEmail(driverEmail, subject, text, html);
}

// Warns a carrier their on-file insurance is about to expire (or already
// has), so their verified status doesn't silently lapse.
export async function sendInsuranceExpirationEmail(carrierEmail, companyName, expirationDate) {
  const subject = "Your insurance on file is expiring — Midnight Loadboard";
  const text =
    `Hi,\n\n${companyName}'s insurance on file with Midnight Loadboard expires ${expirationDate}. ` +
    `Please upload updated proof of insurance to keep your verified status active. ` +
    `If it lapses, your verification may be revoked until it's updated.\n\n` +
    `Reply to this email or contact robertariano@gmail.com with an updated certificate.`;
  const html =
    `<p>Hi,</p>` +
    `<p><strong>${companyName}</strong>'s insurance on file with Midnight Loadboard expires ` +
    `<strong>${expirationDate}</strong>. Please upload updated proof of insurance to keep your ` +
    `verified status active. If it lapses, your verification may be revoked until it's updated.</p>` +
    `<p>Reply to this email or contact <a href="mailto:robertariano@gmail.com">robertariano@gmail.com</a> ` +
    `with an updated certificate.</p>`;

  return sendEmail(carrierEmail, subject, text, html);
}
