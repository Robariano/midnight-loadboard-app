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

  // Multiple carriers can share a contact email. .maybeSingle() used to
  // throw whenever that happened, and any thrown error here was treated
  // identically to "wrong password" - so a correct password would fail
  // with "Email or password is incorrect" for any carrier on a shared
  // email, even right after a successful password reset. Fetch all
  // matches instead, and log in as whichever one the password matches.
  const { data: carriers, error } = await supabase
    .from("carriers")
    .select("*")
    .ilike("contact_email", email.trim());

  const carrier = !error && carriers
    ? carriers.find((c) => verifyPassword(password, c.password_hash))
    : null;

  if (!carrier) {
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
