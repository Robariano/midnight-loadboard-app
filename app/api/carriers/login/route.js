import { getServiceClient } from "../../../../lib/supabase";
import { verifyPassword, createSessionCookie } from "../../../../lib/carrier-auth";
import { checkLocked, recordFailure, clearAttempts } from "../../../../lib/login-lockout";

export async function POST(req) {
    const { email, password } = await req.json();
    if (!email || !password) {
          return Response.json({ error: "Email and password are required." }, { status: 400 });
    }

  const supabase = getServiceClient();
    const normalizedEmail = email.trim().toLowerCase();

  const { locked, minutesLeft, record } = await checkLocked(
        supabase, "carrier_login_attempts", "email", normalizedEmail
      );
    if (locked) {
          return Response.json(
            { error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.` },
            { status: 429 }
                );
    }

  const { data: carrier, error } = await supabase
      .from("carriers")
      .select("*")
      .ilike("contact_email", email.trim())
      .maybeSingle();

  if (error || !carrier || !verifyPassword(password, carrier.password_hash)) {
        const { lockedUntil, lockoutMinutes } = await recordFailure(
                supabase, "carrier_login_attempts", "email", normalizedEmail, record
              );
        if (lockedUntil) {
                return Response.json(
                  { error: `Too many failed attempts. Try again in ${lockoutMinutes} minutes.` },
                  { status: 429 }
                        );
        }
        return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  }

  await clearAttempts(supabase, "carrier_login_attempts", "email", normalizedEmail, record);

  const res = Response.json({
        ok: true,
        carrier: { id: carrier.id, company_name: carrier.company_name, verified_status: carrier.verified_status },
  });
    res.headers.set("Set-Cookie", createSessionCookie(carrier.id));
    return res;
}
