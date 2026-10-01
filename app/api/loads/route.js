import { getServiceClient } from "../../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { sendLoadPostedEmail, looksLikeEmail } from "../../../lib/email";
import { checkRateLimit } from "../../../lib/rate-limit";
import { getCarrierIdFromRequest } from "../../../lib/carrier-auth";
import { geocodeLoadCities } from "../../../lib/geocode";

export async function POST(req) {
        const body = await req.json();

    // Honeypot: real users never see or fill this field (it's hidden in the
    // UI). If it's filled, something automated did it - pretend to succeed
    // so bots don't learn to adapt, but skip the actual insert.
    if (body.website) {
                return Response.json({ ok: true }, { status: 201 });
    }

    const rateLimit = await checkRateLimit(req, "load_post", { maxPerWindow: 5, windowMinutes: 60 });
        if (!rateLimit.allowed) {
                    return Response.json(
                        { error: `Too many loads posted from this network. Try again in ${rateLimit.retryAfterMinutes} minute${rateLimit.retryAfterMinutes === 1 ? "" : "s"}.` },
                        { status: 429 }
                                );
        }

    const supabase = getServiceClient();

    // A shipper posts anonymously (no account), so the manage_token is the
    // only way they can ever get back into this load afterward - it's sent
    // once, in the confirmation email, and never shown again.
    const manageToken = uuidv4();

    // Best-effort - a slow or failed geocode just means no map coordinates
    // get saved, never blocks the load from posting.
    const { pickup: pickupGeo, delivery: deliveryGeo } = await geocodeLoadCities(
                body.pickup_city,
                body.delivery_city
    );

    const { data, error } = await supabase
            .from("loads")
            .insert({
                            pickup_city: body.pickup_city,
                            delivery_city: body.delivery_city,
                            pickup_date: body.pickup_date,
                            equipment_type: body.equipment_type,
                            rate: body.rate || null,
                            commodity: body.commodity || null,
                            weight_lbs: body.weight_lbs || null,
                            notes: body.notes || null,
                            shipper_name: body.shipper_name,
                            shipper_email: body.shipper_email,
                            status: "open",
                            manage_token: manageToken,
                            pickup_lat: pickupGeo?.lat ?? null,
                            pickup_lng: pickupGeo?.lng ?? null,
                            delivery_lat: deliveryGeo?.lat ?? null,
                            delivery_lng: deliveryGeo?.lng ?? null,
                            hard_to_cover: body.hard_to_cover === true,
            })
            .select()
            .single();

    if (error) {
                console.error(error);
                return Response.json({ error: error.message }, { status: 500 });
    }

    if (looksLikeEmail(body.shipper_email)) {
                const baseUrl = process.env.APP_BASE_URL || "https://midnightloadboard.com";
                const manageUrl = `${baseUrl}/loads/manage/${manageToken}`;
                try {
                                await sendLoadPostedEmail(body.shipper_email.trim(), body.pickup_city, body.delivery_city, manageUrl);
                } catch (err) {
                                // Don't fail the whole post just because the confirmation email
                    // didn't go out - the load itself was already saved successfully.
                    console.error(`[email] Failed to email shipper for load ${data.id}:`, err.message);
                }
    }

    return Response.json({ load: data }, { status: 201 });
}

export async function GET(req) {
        const supabase = getServiceClient();
        const params = req.nextUrl.searchParams;
    const carrierId = getCarrierIdFromRequest(req);

    let query = supabase.from("loads").select("*, carrier:carriers(id, company_name)");

    // Default to only showing open loads unless the caller explicitly asks
    // for everything. "All" doesn't mean every carrier's claimed loads to
    // every visitor though - that would leak other carriers' rates and
    // assignments. It means: open loads (public, anyone can browse those)
    // plus whatever the logged-in carrier has claimed themselves. Someone
    // not logged in just gets open loads either way.
    const status = params.get("status");
        if (status === "all") {
                    query = carrierId
              ? query.or(`status.eq.open,claimed_by_carrier_id.eq.${carrierId}`)
              : query.eq("status", "open");
        } else if (status) {
                    query = query.eq("status", status);
                    if (status !== "open") {
                      query = carrierId
                        ? query.eq("claimed_by_carrier_id", carrierId)
                        : query.eq("id", "00000000-0000-0000-0000-000000000000"); // not logged in: no claimed loads visible
                    }
        } else {
                    query = query.eq("status", "open");
        }

    const originCity = params.get("origin_city");
        if (originCity) query = query.ilike("pickup_city", `%${originCity}%`);

    const destCity = params.get("destination_city");
        if (destCity) query = query.ilike("delivery_city", `%${destCity}%`);

    const equipmentType = params.get("equipment_type");
        if (equipmentType) query = query.eq("equipment_type", equipmentType);

    const hardToCover = params.get("hard_to_cover");
        if (hardToCover === "true") query = query.eq("hard_to_cover", true);

    const pickupAfter = params.get("pickup_after");
        if (pickupAfter) query = query.gte("pickup_date", pickupAfter);

    const pickupBefore = params.get("pickup_before");
        if (pickupBefore) query = query.lte("pickup_date", pickupBefore);

    const minRate = params.get("min_rate");
        if (minRate) query = query.gte("rate", Number(minRate));

    const sort = params.get("sort");
        if (sort === "rate_desc") query = query.order("rate", { ascending: false, nullsFirst: false });
        else if (sort === "rate_asc") query = query.order("rate", { ascending: true, nullsFirst: false });
        else if (sort === "pickup_date") query = query.order("pickup_date", { ascending: true });
        else query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ loads: data });
}
