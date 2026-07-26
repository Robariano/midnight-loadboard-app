export async function POST(req) {
  const { password } = await req.json();

  if (!process.env.ADMIN_PASSWORD) {
    return Response.json(
      { error: "ADMIN_PASSWORD is not set in your environment variables." },
      { status: 500 }
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = Response.json({ ok: true });
  // Simple cookie-based session for a single admin user (you).
  // Not meant for multiple admin accounts — fine for a solo founder running this by hand.
  res.headers.set(
    "Set-Cookie",
    `admin_pw=${encodeURIComponent(password)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`
  );
  return res;
}
