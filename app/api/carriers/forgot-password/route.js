import { getServiceClient } from "../../../../lib/supabase";
import { sendPasswordResetEmail } from "../../../../lib/email";
import { v4 as uuidv4 } from "uuid";

const RESEND_COOLDOWN_MS = 2 * 60 * 1000;
const TOKEN_LIFETIME_MS = 60 * 60 * 1000;

export async function POST(req) {
  const generic = Response.json({
    ok: true,
    message: "If that email is registered, a reset link has been sent.",
  });

  try {
    const { email } = await req.json();
    if (!email) return generic;

    const supabase = getServiceClient();

    // Multiple carriers can legitimately share a contact email (e.g. one
    // person/company running several DOT numbers under one inbox). Using
    // .maybeSingle() here used to throw whenever that happened, which
    // silently broke password reset for every carrier on that email -
    // the frontend showed "success" regardless, so nobody could tell.
    // Instead: fetch all matches, and if there's more than one, send a
    // reset link for each of them rather than erroring.
    const { data: carriers, error } = await supabase
      .from("carriers")
      .select("id, company_name, password_reset_expires_at")
      .ilike("contact_email", email.trim());

    if (error) {
      console.error("[forgot-password] Lookup failed:", error.message);
      return generic;
    }
    if (!carriers || carriers.length === 0) return generic;

    for (const carrier of carriers) {
      if (carrier.password_reset_expires_at) {
        const msRemaining = new Date(carrier.password_reset_expires_at) - new Date();
        if (msRemaining > TOKEN_LIFETIME_MS - RESEND_COOLDOWN_MS) {
          continue; // this one's in cooldown, skip it, still process any others
        }
      }

      const token = uuidv4();
      const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS).toISOString();

      await supabase
        .from("carriers")
        .update({ password_reset_token: token, password_reset_expires_at: expiresAt })
        .eq("id", carrier.id);

      const baseUrl = process.env.APP_BASE_URL || "https://midnightloadboard.com";
      const resetUrl = `${baseUrl}/reset-password/${token}`;

      try {
        await sendPasswordResetEmail(email.trim(), carrier.company_name, resetUrl);
      } catch (err) {
        console.error("[forgot-password] Failed to send reset email:", err.message);
      }
    }

    return generic;
  } catch (err) {
    // Any unexpected failure still returns the generic response - never
    // leak whether an email is registered, and never crash visibly.
    console.error("[forgot-password] Unexpected error:", err.message);
    return generic;
  }
}
