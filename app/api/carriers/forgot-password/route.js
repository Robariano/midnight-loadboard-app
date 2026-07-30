import { getServiceClient } from "../../../../lib/supabase";
import { sendPasswordResetEmail } from "../../../../lib/email";
import { v4 as uuidv4 } from "uuid";

const RESEND_COOLDOWN_MS = 2 * 60 * 1000;
const TOKEN_LIFETIME_MS = 60 * 60 * 1000;

export async function POST(req) {
    const { email } = await req.json();
    const supabase = getServiceClient();

  const generic = Response.json({
        ok: true,
        message: "If that email is registered, a reset link has been sent.",
  });

  if (!email) return generic;

  const { data: carrier } = await supabase
      .from("carriers")
      .select("id, company_name, password_reset_expires_at")
      .ilike("contact_email", email.trim())
      .maybeSingle();

  if (!carrier) return generic;

  if (carrier.password_reset_expires_at) {
        const msRemaining = new Date(carrier.password_reset_expires_at) - new Date();
        if (msRemaining > TOKEN_LIFETIME_MS - RESEND_COOLDOWN_MS) {
                return generic;
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

  return generic;
}
