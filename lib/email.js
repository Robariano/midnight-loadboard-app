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
                  `Log in to your account to submit it. If it lapses, your verification will be ` +
                  `paused until it's updated.`;
        const html =
                  `<p>Hi,</p>` +
                  `<p><strong>${companyName}</strong>'s insurance on file with Midnight Loadboard expires ` +
                  `<strong>${expirationDate}</strong>. Submit an updated certificate here to keep your verified ` +
                  `status active:</p>` +
                  `<p><a href="${reverifyUrl}">${reverifyUrl}</a></p>` +
                  `<p style="color:#888;font-size:13px;">Log in to your account to submit it. If it ` +
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
                  `Log in to your account to submit it. We review updates within 24-48 hours.`;
        const html =
                  `<p>Hi,</p>` +
                  `<p><strong>${companyName}</strong>'s insurance on file with Midnight Loadboard has expired, so ` +
                  `your verified status has been paused - you won't be able to claim new loads until it's renewed.</p>` +
                  `<p>Submit an updated certificate here to restore your verification:</p>` +
                  `<p><a href="${reverifyUrl}">${reverifyUrl}</a></p>` +
                  `<p style="color:#888;font-size:13px;">Log in to your account to submit it. We ` +
                  `review updates within 24-48 hours.</p>`;

  return sendEmail(carrierEmail, subject, text, html);
}

export async function sendPasswordResetEmail(carrierEmail, companyName, resetUrl) {
        const subject = "Reset your password - Midnight Loadboard";
        const text =
                  `Hi,\n\n` +
                  `We received a request to reset the password for ${companyName}'s Midnight Loadboard account. ` +
                  `Use the link below to set a new password - it expires in 1 hour:\n\n${resetUrl}\n\n` +
                  `If you didn't request this, you can safely ignore this email.`;
        const html =
                  `<p>Hi,</p>` +
                  `<p>We received a request to reset the password for <strong>${companyName}</strong>'s Midnight ` +
                  `Loadboard account. Use the link below to set a new password - it expires in 1 hour:</p>` +
                  `<p><a href="${resetUrl}">${resetUrl}</a></p>` +
                  `<p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>`;

  return sendEmail(carrierEmail, subject, text, html);
}

export async function sendLoadPostedEmail(shipperEmail, pickupCity, deliveryCity, manageUrl) {
        const subject = "Your load is posted - Midnight Loadboard";
        const text =
                  `Hi,\n\n` +
                  `Your load from ${pickupCity} to ${deliveryCity} is live on Midnight Loadboard. ` +
                  `Verified carriers can now see and claim it.\n\n` +
                  `Use this private link any time to check its status, update the rate/notes, or cancel it:\n\n${manageUrl}\n\n` +
                  `Keep this link - it's the only way to manage this load since posting doesn't require an account.`;
        const html =
                  `<p>Hi,</p>` +
                  `<p>Your load from <strong>${pickupCity}</strong> to <strong>${deliveryCity}</strong> is live on ` +
                  `Midnight Loadboard. Verified carriers can now see and claim it.</p>` +
                  `<p>Use this private link any time to check its status, update the rate/notes, or cancel it:</p>` +
                  `<p><a href="${manageUrl}">${manageUrl}</a></p>` +
                  `<p style="color:#888;font-size:13px;">Keep this link - it's the only way to manage this load since ` +
                  `posting doesn't require an account.</p>`;

  return sendEmail(shipperEmail, subject, text, html);
}

export async function sendCoverageFlagNoticeEmail(carrierEmail, companyName) {
        const subject = "A coverage check on your account was flagged - Midnight Loadboard";
        const text =
                  `Hi,\n\n` +
                  `A driver recently confirmed they were NOT covered under your active insurance policy ` +
                  `for a load assigned through ${companyName}'s Midnight Loadboard account. This has been ` +
                  `logged as an open flag on your account.\n\n` +
                  `This is a notice, not a revocation - your verified status hasn't changed. Repeated flags ` +
                  `can lead to your verification being revoked, so if this was a mistake or has already been ` +
                  `corrected, reply to this email or contact disputes@midnightloadboard.com to explain.`;
        const html =
                  `<p>Hi,</p>` +
                  `<p>A driver recently confirmed they were <strong>NOT</strong> covered under your active insurance ` +
                  `policy for a load assigned through <strong>${companyName}</strong>'s Midnight Loadboard account. ` +
                  `This has been logged as an open flag on your account.</p>` +
                  `<p><strong>This is a notice, not a revocation</strong> - your verified status hasn't changed. ` +
                  `Repeated flags can lead to your verification being revoked, so if this was a mistake or has ` +
                  `already been corrected, reply to this email or contact ` +
                  `<a href="mailto:disputes@midnightloadboard.com">disputes@midnightloadboard.com</a> to explain.</p>`;

  return sendEmail(carrierEmail, subject, text, html);
}

export async function sendCarrierRevokedEmail(carrierEmail, companyName) {
        const subject = "Your verified status has been revoked - Midnight Loadboard";
        const text =
                  `Hi,\n\n` +
                  `${companyName}'s verified status on Midnight Loadboard has been revoked, and your company ` +
                  `now appears on our public Revoked Credentials page.\n\n` +
                  `If you believe this is a mistake, or you've corrected the underlying issue, contact ` +
                  `disputes@midnightloadboard.com. You can reapply for verification at any time once the ` +
                  `issue is resolved.`;
        const html =
                  `<p>Hi,</p>` +
                  `<p><strong>${companyName}</strong>'s verified status on Midnight Loadboard has been revoked, ` +
                  `and your company now appears on our public ` +
                  `<a href="https://midnightloadboard.com/revoked-carriers">Revoked Credentials</a> page.</p>` +
                  `<p>If you believe this is a mistake, or you've corrected the underlying issue, contact ` +
                  `<a href="mailto:disputes@midnightloadboard.com">disputes@midnightloadboard.com</a>. ` +
                  `You can reapply for verification at any time once the issue is resolved.</p>`;

  return sendEmail(carrierEmail, subject, text, html);
}

export async function sendLoadOnHoldEmail(shipperEmail, pickupCity, deliveryCity, manageUrl) {
        const subject = "Your load needs attention - Midnight Loadboard";
        const text =
                  `Hi,\n\n` +
                  `Your load from ${pickupCity} to ${deliveryCity} has been put on hold. The driver assigned ` +
                  `to it was not able to confirm they're covered under the carrier's active insurance policy ` +
                  `for this trip, so we've paused it rather than let it proceed.\n\n` +
                  `The load is no longer visible to other carriers while it's on hold. You can reopen it to ` +
                  `the board (so another verified carrier can claim it) using your private management link:\n\n` +
                  `${manageUrl}\n\n` +
                  `If you have questions about what happened, contact support@midnightloadboard.com.`;
        const html =
                  `<p>Hi,</p>` +
                  `<p>Your load from <strong>${pickupCity}</strong> to <strong>${deliveryCity}</strong> has been ` +
                  `put on hold. The driver assigned to it was not able to confirm they're covered under the ` +
                  `carrier's active insurance policy for this trip, so we've paused it rather than let it ` +
                  `proceed.</p>` +
                  `<p>The load is no longer visible to other carriers while it's on hold. You can reopen it to ` +
                  `the board (so another verified carrier can claim it) using your private management link:</p>` +
                  `<p><a href="${manageUrl}">${manageUrl}</a></p>` +
                  `<p style="color:#888;font-size:13px;">If you have questions about what happened, contact ` +
                  `<a href="mailto:support@midnightloadboard.com">support@midnightloadboard.com</a>.</p>`;

  return sendEmail(shipperEmail, subject, text, html);
}
