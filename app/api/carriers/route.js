import { getServiceClient } from "../../../lib/supabase";
import { hashPassword, createSessionCookie } from "../../../lib/carrier-auth";
import { checkRateLimit } from "../../../lib/rate-limit";
import { lookupCarrierByDot, lookupCarrierByMc } from "../../../lib/fmcsa";

export async function POST(req) {
        const body = await req.json();

    // Honeypot: real users never see or fill this field (it's hidden in the
    // UI). If it's filled, something automated did it - pretend to succeed
    // so bots don't learn to adapt, but skip the actual insert.
    if (body.website) {
                return Response.json({ ok: true }, { status: 201 });
    }

    const rateLimit = await checkRateLimit(req, "carrier_signup", { maxPerWindow: 3, windowMinutes: 1440 });
        if (!rateLimit.allowed) {
                    return Response.json(
                        { error: `Too many signups from this network. Try again in ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? "" : "s"}.` },
                        { status: 429 }
                                );
        }

    const supabase = getServiceClient();

    if (!body.password || body.password.length < 8) {
                return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const { data, error } = await supabase
            .from("carriers")
            .insert({
                            company_name: body.company_name,
                            contact_email: body.contact_email,
                            contact_phone: body.contact_phone || null,
                            dot_number: body.dot_number || null,
                            mc_number: body.mc_number || null,
                            cdl_class: body.cdl_class || null,
                            cdl_link: body.cdl_link || null,
                            insurance_link: body.insurance_link || null,
                            authority_link: body.authority_link || null,
                            insurance_expiration_date: body.insurance_expiration_date || null,
                            verified_status: "pending",
                            password_hash: hashPassword(body.password),
            })
            .select("id, company_name, verified_status")
            .single();

    if (error) {
                console.error(error);
                return Response.json({ error: error.message }, { status: 500 });
    }

    // Run the FMCSA check right away so it's already sitting on this
    // carrier's row by the time an admin opens the Carrier Review panel —
    // same live data the "Check FMCSA" button pulls (lib/fmcsa.js), just
    // saved automatically instead of requiring a manual click. Awaited
    // (not fire-and-forget) because this is a Vercel serverless function —
    // work kicked off after the response is sent isn't guaranteed to
    // finish. Never blocks signup itself: any failure here (no FMCSA
    // record, FMCSA_WEB_KEY missing, API error) is caught and recorded on
    // the row instead of failing the request — the admin can always
    // re-check manually later via the existing button.
    if (body.dot_number || body.mc_number) {
                try {
                    const snapshot = body.dot_number
                        ? await lookupCarrierByDot(body.dot_number)
                        : await lookupCarrierByMc(body.mc_number);
                    await supabase
                            .from("carriers")
                            .update({
                                            fmcsa_checked_at: new Date().toISOString(),
                                            fmcsa_snapshot: snapshot,
                                            fmcsa_error: snapshot ? null : "No FMCSA record found for the submitted DOT/MC number.",
                            })
                            .eq("id", data.id);
                } catch (fmcsaErr) {
                    console.error("FMCSA auto-check failed:", fmcsaErr);
                    await supabase
                            .from("carriers")
                            .update({ fmcsa_checked_at: new Date().toISOString(), fmcsa_error: fmcsaErr.message })
                            .eq("id", data.id);
                }
    }

    const res = Response.json({ carrier: data }, { status: 201 });
        res.headers.set("Set-Cookie", createSessionCookie(data.id));
        return res;
}

export async function GET() {
        const supabase = getServiceClient();
        const { data, error } = await supabase
            .from("carriers")
            .select("id, company_name, verified_status, verified_date")
            .eq("verified_status", "verified");

    if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ carriers: data });
}
