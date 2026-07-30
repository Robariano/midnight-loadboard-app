import { getServiceClient } from "../../../../lib/supabase";
import { hashPassword, createSessionCookie } from "../../../../lib/carrier-auth";

export async function POST(req) {
    const { token, password } = await req.json();
    if (!token || !password) {
          return Response.json({ error: "Token and new password are required." }, { status: 400 });
    }
    if (password.length < 8) {
          return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

  const supabase = getServiceClient();
    const { data: carrier, error } = await supabase
      .from("carriers")
      .select("id, password_reset_expires_at")
      .eq("password_reset_token", token)
      .maybeSingle();

  if (error || !carrier) {
        return Response.json({ error: "This reset link is invalid or has already been used." }, { status: 400 });
  }
    if (!carrier.password_reset_expires_at || new Date(carrier.password_reset_expires_at) < new Date()) {
          return Response.json({ error: "This reset link has expired. Request a new one." }, { status: 400 });
    }

  await supabase
      .from("carriers")
      .update({
              password_hash: hashPassword(password),
              password_reset_token: null,
              password_reset_expires_at: null,
      })
      .eq("id", carrier.id);

  const res = Response.json({ ok: true });
    res.headers.set("Set-Cookie", createSessionCookie(carrier.id));
    return res;
}
