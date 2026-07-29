// Twilio SMS helper — sends the driver their private coverage confirmation
// link automatically when a carrier assigns them to a load.
//
// Uses Twilio's REST API directly via fetch (no SDK dependency needed).
// Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER —
// see .env.local.example.

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// driver_contact is free text (phone or email — see supabase-schema.sql).
// Only attempt SMS when it actually looks like a phone number; email
// contacts are left as a TODO (would need an email service like Resend).
export function looksLikePhoneNumber(contact) {
  if (!contact || contact.includes("@")) return false;
  const digits = contact.replace(/\D/g, "");
  return digits.length >= 7;
}

// Best-effort normalizer for US numbers. Assumes +1 if no country code is present.
export function normalizeToE164(rawContact) {
  const trimmed = rawContact.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

async function sendSMS(toPhone, body) {
  if (!accountSid || !authToken || !fromNumber) {
    throw new Error(
      "Twilio is not configured — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER."
    );
  }

  const resp = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: toPhone,
        From: fromNumber,
        Body: body,
      }),
    }
  );

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.message || `Twilio request failed with status ${resp.status}`);
  }

  return { sid: data.sid, status: data.status };
}

export async function sendCoverageConfirmationSMS(driverPhone, driverName, confirmUrl) {
  const body =
    `Hi${driverName ? ` ${driverName}` : ""}, you've been assigned a load on Midnight Loadboard. ` +
    `Confirm your coverage here: ${confirmUrl}`;
  return sendSMS(driverPhone, body);
}

// Warns a carrier their on-file insurance is about to expire (or already
// has), so their verified status doesn't silently lapse.
export async function sendInsuranceExpirationSMS(carrierPhone, companyName, expirationDate) {
  const body =
    `Midnight Loadboard: ${companyName}'s insurance on file expires ${expirationDate}. ` +
    `Upload updated proof of insurance to keep your verified status active.`;
  return sendSMS(carrierPhone, body);
}
