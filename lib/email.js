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

export async function sendCoverageConfirmationEmail(driverEmail, driverName, confirmUrl) {
  if (!resendApiKey || !fromEmail) {
    throw new Error(
      "Resend is not configured — set RESEND_API_KEY and RESEND_FROM_EMAIL."
    );
  }

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

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: driverEmail,
      subject,
      text,
      html,
    }),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.message || `Resend request failed with status ${resp.status}`);
  }

  return { id: data.id };
}
