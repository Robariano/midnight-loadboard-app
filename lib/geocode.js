// Turns a free-text city like "Durango, CO" into approximate coordinates,
// so the app can tell when a carrier's phone is physically near a load's
// pickup or delivery city. Uses OpenStreetMap's free Nominatim service -
// no API key, no cost, no account. Best-effort only: a failed or missing
// result just means no distance-based nudge shows up later, nothing else
// depends on it. Nominatim's usage policy asks for an identifying
// User-Agent and roughly 1 request/second, which easily covers how often
// loads get created here.
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Nightlane-LoadTracking/1.0 (midnightloadboard.com)";

export async function geocodeCity(cityText) {
  if (!cityText || typeof cityText !== "string" || !cityText.trim()) return null;

  try {
    const params = new URLSearchParams({
      q: cityText.trim(),
      format: "json",
      limit: "1",
      // Almost all loads here are domestic US freight, and without this a
      // bare city name like "Durango" or "Lebanon" can resolve to a more
      // prominent same-named place in another country entirely, which
      // silently breaks the distance check later.
      countrycodes: "us",
    });
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    const results = await res.json();
    if (!Array.isArray(results) || results.length === 0) return null;

    const lat = parseFloat(results[0].lat);
    const lng = parseFloat(results[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return { lat, lng };
  } catch (err) {
    // Network hiccup, timeout, or Nominatim being slow - never let this
    // block a load from being posted or tracked.
    console.error("[geocode] Failed to geocode city:", cityText, err.message);
    return null;
  }
}

// Geocodes a load's pickup and delivery cities one after another, never at
// the same time. Nominatim's free usage policy caps automated use at
// roughly one request per second - running both lookups in parallel (as
// this used to do) risks the second one getting silently throttled, which
// is why some loads ended up with no coordinates saved at all.
export async function geocodeLoadCities(pickupCity, deliveryCity) {
  const pickup = await geocodeCity(pickupCity);
  await new Promise((resolve) => setTimeout(resolve, 1100));
  const delivery = await geocodeCity(deliveryCity);
  return { pickup, delivery };
}

// Straight-line distance between two coordinates, in miles. Good enough
// for "is this driver roughly near the delivery city" - not turn-by-turn
// routing distance, just a nudge threshold.
export function milesBetween(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth's radius in miles
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
