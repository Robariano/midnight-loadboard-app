export async function GET(req) {
    const res = Response.json({ ok: true, cookieHeaderSeen: req.headers.get("cookie") || null });
    res.headers.set("Set-Cookie", "debug_test=hello123; Path=/; SameSite=Lax; Max-Age=300");
    return res;
}
