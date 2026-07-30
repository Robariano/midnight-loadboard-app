import { clearSessionCookie } from "../../../../lib/carrier-auth";

export async function POST() {
    const res = Response.json({ ok: true });
    res.headers.set("Set-Cookie", clearSessionCookie());
    return res;
}
