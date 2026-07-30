// Email fallback helper - sends the driver their private coverage
// confirmation link when driver_contact is an email address instead of a
// phone number (SMS is handled separately in lib/twilio.js).
//
// Uses Resend's REST API directly via fetch (no SDK dependency needed),
// matching the pattern used in lib/twilio.js. Requires RESEND_API_KEY and
// RESEND_FROM_EMAIL - see .env.local.example.

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;
const baseUrl = process.env.APP_BASE_URL || "https://midnightloadboard.com";

export function looksLikeEmail(contact) {
    if (!contact) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());
}

async function sendEmail(to, subject, text, html) {
    if (!resendApiKey || !fromEmail) {
          throw new Error(
                  "Resend is not configured - set RESEND_API_KEY and RESEND_FROM_EMAIL."
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
    const subject = "Confirm your coverage - Midnight Loadboard";
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

export async function sendInsuranceExpirationEmail(carrierEmail, companyName, expirationDate, carrierId) {
    const reverifyUrl = `${baseUrl}/reverify/${carrierId}`;
    const subject = "Your insurance on file is expiring - Midnight Loadboard";
    const text =
          `Hi,\n\n${companyName}'s insurance on file with Midnight Loadboard expires ${expirationDate}. ` +
          `Submit an updated certificate here to keep your verified status active:\n\n${reverifyUrl}\n\n` +
          `You'll need the carrier secret you saved at signup. If it lapses, your verification will be ` +
          `paused until it's updated.`;
    const html =
          `<p>Hi,</p>` +
          `<p><strong>${companyName}</strong>'s insurance on file with Midnight Loadboard expires ` +
          `<strong>${expirationDate}</strong>. Submit an updated certificate here to keep your verified ` +
          `status active:</p>` +
          `<p><a href="${reverifyUrl}">${reverifyUrl}</a></p>` +
          `<p style="color:#888;font-size:13px;">You'll need the carrier secret you saved at signup. If it ` +
          `lapses, your verification will be paused until it's updated.</p>`;

  return sendEmail(carrierEmail, subject, text, html);
}

export async function sendReverificationRequiredEmail(carrierEmail, companyName, carrierId) {
    const reverifyUrl = `${baseUrl}/reverify/${carrierId}`;
    const subject = "Your verification has been paused - Midnight Loadboard";
    const text =
          `Hi,\n\n${companyName}'s insurance on file with Midnight Loadboard has expired, so your verified ` +
          `status has been paused - you won't be able to claim new loads until it's renewed.\n\n` +
          `Submit an updated certificate here to restore your verification:\n\n${reverifyUrl}\n\n` +
          `You'll need the carrier secret you saved at signup. We review updates within 24-48 hours.`;
    const html =
          `<p>Hi,</p>` +
          `<p><strong>${companyName}</strong>'s insurance on file with Midnight Loadboard has expired, so ` +
          `your verified status has been paused - you won't be able to claim new loads until it's renewed.</p>` +
          `<p>Submit an updated certificate here to restore your verification:</p>` +
          `<p><a href="${reverifyUrl}">${reverifyUrl}</a></p>` +
          `<p style="color:#888;font-size:13px;">You'll need the carrier secret you saved at signup. We ` +
          `review updates within 24-48 hours.</p>`;

  return sendEmail(carrierEmail, subject, text, html);
}
