"use client";
import { useEffect, useState } from "react";

const badgeColor = {
  open: { bg: "#e9f7ef", color: "#166534" },
  claimed: { bg: "#fef3e2", color: "#92400e" },
  coverage_pending: { bg: "#fef3e2", color: "#92400e" },
  confirmed: { bg: "#e9f7ef", color: "#166534" },
  picked_up: { bg: "#e0ecfc", color: "#1d4ed8" },
  in_transit: { bg: "#e0ecfc", color: "#1d4ed8" },
  on_hold: { bg: "#fdecec", color: "#991b1b" },
  delivered: { bg: "#f0f2f5", color: "#4b5568" },
};

const filterInputStyle = {
  padding: "8px 10px",
  background: "#ffffff",
  border: "1px solid #e2e5ea",
  borderRadius: 6,
  color: "#14181f",
  fontSize: 13,
};

const EQUIPMENT_TYPES = ["Dry Van", "Flatbed", "Reefer", "Tanker", "Step Deck", "Other"];

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN",
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT",
  "VT", "VA", "WA", "WV", "WI", "WY",
];

// How close (in miles) counts as "near" a load's pickup/delivery city before
// showing a location-based nudge. Cities are geocoded to their center point,
// not an exact dock address, so this stays generous on purpose.
const NEARBY_MILES = 15;

// A carrier's account is "new" for this many days after signup - long enough
// to still be hunting for a first broker relationship, short enough that the
// nudge goes away once they're established.
const NEW_CARRIER_DAYS = 30;

function milesBetween(lat1, lng1, lat2, lng2) {
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

export default function Loads() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(undefined);
  const [claiming, setClaiming] = useState(null);
  const [driverType, setDriverType] = useState("self");
  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [driverConsent, setDriverConsent] = useState(false);
  const [claimResult, setClaimResult] = useState(null);

  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [minRate, setMinRate] = useState("");
  const [pickupAfter, setPickupAfter] = useState("");
  const [sort, setSort] = useState("");
  const [showAllStatuses, setShowAllStatuses] = useState(true);
  const [hardToCoverOnly, setHardToCoverOnly] = useState(false);

  const [trackOpen, setTrackOpen] = useState(false);
  const [trackForm, setTrackForm] = useState({
    pickup_city: "", pickup_state: "", delivery_city: "", delivery_state: "", pickup_date: "",
    equipment_type: "", rate: "", shipper_name: "", notes: "",
  });
  const [trackStatus, setTrackStatus] = useState(null);
  const [trackResult, setTrackResult] = useState(null);

  // One-time, best-effort location check so the status buttons below can
  // nudge "looks like you're here" instead of requiring the driver to
  // remember to tap them. Browser asks permission; a decline or an
  // unsupported browser just means no nudge ever shows up - nothing breaks.
  const [myCoords, setMyCoords] = useState(null);

  function isNear(lat, lng) {
    if (!myCoords || lat == null || lng == null) return false;
    return milesBetween(myCoords.lat, myCoords.lng, lat, lng) <= NEARBY_MILES;
  }

  // New carriers don't have a broker relationship or a track record yet -
  // taking on a load nobody else wants is one of the fastest ways to earn
  // both, so point them at the filter instead of making them discover it.
  const isNewCarrier =
    !!me?.created_at &&
    (Date.now() - new Date(me.created_at).getTime()) / (1000 * 60 * 60 * 24) <= NEW_CARRIER_DAYS;

  useEffect(() => {
    fetch("/api/carriers/me")
      .then((r) => r.json())
      .then((d) => setMe(d.carrier))
      .catch(() => setMe(null));
  }, []);

  function fetchLoads() {
    setLoading(true);
    const params = new URLSearchParams();
    if (originCity) params.set("origin_city", originCity);
    if (destinationCity) params.set("destination_city", destinationCity);
    if (equipmentType) params.set("equipment_type", equipmentType);
    if (minRate) params.set("min_rate", minRate);
    if (pickupAfter) params.set("pickup_after", pickupAfter);
    if (sort) params.set("sort", sort);
    if (showAllStatuses) params.set("status", "all");
    if (hardToCoverOnly) params.set("hard_to_cover", "true");

    fetch(`/api/loads?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setLoads(d.loads || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchLoads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (myCoords || typeof navigator === "undefined" || !navigator.geolocation) return;
    const needsLocation = loads.some(
      (l) => l.status === "confirmed" || l.status === "picked_up" || l.status === "in_transit"
    );
    if (!needsLocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => setMyCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}, // denied or unavailable - just skip the nudge silently
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loads]);

  function applyFilters(e) {
    e.preventDefault();
    fetchLoads();
  }

  function clearFilters() {
    setOriginCity("");
    setDestinationCity("");
    setEquipmentType("");
    setMinRate("");
    setPickupAfter("");
    setSort("");
    setShowAllStatuses(false);
    setHardToCoverOnly(false);
    setLoading(true);
    fetch("/api/loads")
      .then((r) => r.json())
      .then((d) => setLoads(d.loads || []))
      .finally(() => setLoading(false));
  }

  async function submitClaim(loadId) {
    const res = await fetch(`/api/loads/${loadId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_self_attestation: driverType === "self",
        driver_name: driverType === "self" ? null : driverName,
        driver_contact: driverType === "self" ? null : driverContact,
        driver_consent_confirmed: driverType === "self" ? undefined : driverConsent,
      }),
    });
    const data = await res.json();
    setClaimResult(data);
  }

  async function updateLoadStatus(loadId, endpoint) {
    const res = await fetch(`/api/loads/${loadId}/${endpoint}`, { method: "POST" });
    const data = await res.json();
    if (data.load) {
      setLoads((prev) => prev.map((l) => (l.id === loadId ? { ...l, status: data.load.status } : l)));
    }
  }

  const markPickedUp = (loadId) => updateLoadStatus(loadId, "mark-picked-up");
  const markInTransit = (loadId) => updateLoadStatus(loadId, "mark-in-transit");
  const markDelivered = (loadId) => updateLoadStatus(loadId, "complete");

  async function submitTrack(e) {
    e.preventDefault();
    setTrackStatus("saving");
    // Combine the separate city + state dropdown into one "City, ST" string
    // for the API - keeps the geocoder from ever having to guess a state.
    const res = await fetch("/api/loads/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...trackForm,
        pickup_city: `${trackForm.pickup_city.trim()}, ${trackForm.pickup_state}`,
        delivery_city: `${trackForm.delivery_city.trim()}, ${trackForm.delivery_state}`,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setTrackResult(data);
      setTrackStatus("done");
      setTrackForm({
        pickup_city: "", pickup_state: "", delivery_city: "", delivery_state: "", pickup_date: "",
        equipment_type: "", rate: "", shipper_name: "", notes: "",
      });
      fetchLoads();
    } else {
      setTrackStatus("error");
      setTrackResult(data);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ color: "#14181f", margin: 0 }}>My Loads</h1>
        {me !== undefined && (
          <p style={{ color: "#4b5568", fontSize: 13, margin: 0 }}>
            {me ? (
              <>Logged in as <a href="/account" style={{ color: "#1d4ed8" }}>{me.company_name}</a></>
            ) : (
              <a href="/login?next=/loads" style={{ color: "#1d4ed8" }}>Log in to claim loads</a>
            )}
          </p>
        )}
      </div>

      {me && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => setTrackOpen((v) => !v)}
            style={{
              background: "transparent", color: "#1d4ed8", border: "1px solid #1d4ed8",
              borderRadius: 6, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
            {trackOpen ? "Cancel" : "+ Track a load you already have"}
          </button>
          <p style={{ color: "#4b5568", fontSize: 12, margin: "6px 0 0" }}>
            Got a load from DAT, Truckstop, or a phone call? Log it here to use status tracking and
            document sending on it too - no posting, no claiming needed.
          </p>

          {trackOpen && (
            <form onSubmit={submitTrack} style={{
              background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
              padding: 16, marginTop: 12, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end",
            }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Pickup city & state</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input required value={trackForm.pickup_city} placeholder="City"
                    onChange={(e) => setTrackForm((f) => ({ ...f, pickup_city: e.target.value }))}
                    style={{ ...filterInputStyle, width: 100 }} />
                  <select required value={trackForm.pickup_state}
                    onChange={(e) => setTrackForm((f) => ({ ...f, pickup_state: e.target.value }))}
                    style={{ ...filterInputStyle, width: 68 }}>
                    <option value="">State</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Delivery city & state</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input required value={trackForm.delivery_city} placeholder="City"
                    onChange={(e) => setTrackForm((f) => ({ ...f, delivery_city: e.target.value }))}
                    style={{ ...filterInputStyle, width: 100 }} />
                  <select required value={trackForm.delivery_state}
                    onChange={(e) => setTrackForm((f) => ({ ...f, delivery_state: e.target.value }))}
                    style={{ ...filterInputStyle, width: 68 }}>
                    <option value="">State</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Pickup date</label>
                <input required type="date" value={trackForm.pickup_date}
                  onChange={(e) => setTrackForm((f) => ({ ...f, pickup_date: e.target.value }))}
                  style={{ ...filterInputStyle, width: 140 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Equipment</label>
                <select required value={trackForm.equipment_type}
                  onChange={(e) => setTrackForm((f) => ({ ...f, equipment_type: e.target.value }))}
                  style={{ ...filterInputStyle, width: 130 }}>
                  <option value="">Select...</option>
                  {EQUIPMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Rate ($)</label>
                <input type="number" value={trackForm.rate}
                  onChange={(e) => setTrackForm((f) => ({ ...f, rate: e.target.value }))}
                  style={{ ...filterInputStyle, width: 100 }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Got it from (optional)</label>
                <input value={trackForm.shipper_name} placeholder="e.g. Eric / broker name"
                  onChange={(e) => setTrackForm((f) => ({ ...f, shipper_name: e.target.value }))}
                  style={{ ...filterInputStyle, width: 160 }} />
              </div>
              <button type="submit" disabled={trackStatus === "saving"} style={{
                background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
                padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
                {trackStatus === "saving" ? "Saving..." : "Start Tracking"}
              </button>
            </form>
          )}

          {trackStatus === "done" && trackResult?.manageUrl && (
            <div style={{ background: "#e9f7ef", border: "1px solid #166534", borderRadius: 8, padding: 12, marginTop: 12 }}>
              <p style={{ color: "#166534", fontSize: 13, margin: "0 0 6px", fontWeight: 700 }}>
                Now tracking. Share this private link with whoever you got the load from so they can see its status:
              </p>
              <input readOnly value={trackResult.manageUrl} onFocus={(e) => e.target.select()}
                style={{ ...filterInputStyle, width: "100%" }} />
            </div>
          )}
          {trackStatus === "error" && (
            <p style={{ color: "#991b1b", fontSize: 13, marginTop: 8 }}>{trackResult?.error || "Something went wrong."}</p>
          )}
        </div>
      )}

      {isNewCarrier && (
        <div style={{
          background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10,
          padding: "12px 16px", marginBottom: 16,
        }}>
          <p style={{ color: "#9a3412", fontSize: 13, margin: 0 }}>
            <strong>New here?</strong> Brokers give repeat business to carriers they trust, and taking on loads
            that are hard to cover is one of the fastest ways to earn that. Try the{" "}
            <strong>🔥 Hard to cover only</strong> filter below.
          </p>
        </div>
      )}

      <form
        onSubmit={applyFilters}
        style={{
          background: "#f7f8fa",
          border: "1px solid #e2e5ea",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "flex-end",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Origin city</label>
          <input value={originCity} onChange={(e) => setOriginCity(e.target.value)}
            placeholder="e.g. Chicago" style={{ ...filterInputStyle, width: 130 }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Destination city</label>
          <input value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)}
            placeholder="e.g. Dallas" style={{ ...filterInputStyle, width: 130 }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Equipment</label>
          <select value={equipmentType} onChange={(e) => setEquipmentType(e.target.value)}
            style={{ ...filterInputStyle, width: 130 }}>
            <option value="">Any</option>
            {EQUIPMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Min rate ($)</label>
          <input type="number" value={minRate} onChange={(e) => setMinRate(e.target.value)}
            placeholder="0" style={{ ...filterInputStyle, width: 90 }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Pickup on/after</label>
          <input type="date" value={pickupAfter} onChange={(e) => setPickupAfter(e.target.value)}
            style={{ ...filterInputStyle, width: 140 }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "#4b5568", marginBottom: 4 }}>Sort by</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            style={{ ...filterInputStyle, width: 140 }}>
            <option value="">Newest first</option>
            <option value="rate_desc">Highest rate</option>
            <option value="rate_asc">Lowest rate</option>
            <option value="pickup_date">Pickup date</option>
          </select>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#4b5568", marginBottom: 2 }}>
          <input type="checkbox" checked={showAllStatuses} onChange={(e) => setShowAllStatuses(e.target.checked)} />
          Show claimed/completed too
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9a3412", marginBottom: 2 }}>
          <input type="checkbox" checked={hardToCoverOnly} onChange={(e) => setHardToCoverOnly(e.target.checked)} />
          🔥 Hard to cover only
        </label>
        <button type="submit" style={{
          background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
          padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          Apply filters
        </button>
        <button type="button" onClick={clearFilters} style={{
          background: "transparent", color: "#4b5568", border: "1px solid #e2e5ea", borderRadius: 6,
          padding: "8px 16px", fontSize: 13, cursor: "pointer",
        }}>
          Clear
        </button>
      </form>

      {loading && <p style={{ color: "#4b5568" }}>Loading loads...</p>}
      {!loading && loads.length === 0 && (
        <p style={{ color: "#4b5568" }}>
          No loads match your filters. Try widening your search or{" "}
          <a href="/post-load" style={{ color: "#1d4ed8" }}>post a load</a>.
        </p>
      )}
      {loads.map((load) => {
        const b = badgeColor[load.status] || badgeColor.open;
        return (
          <div key={load.id} style={{
            background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
            padding: "16px 20px", marginBottom: 12,
          }}>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontWeight: 700, color: "#14181f", margin: 0 }}>
                {load.pickup_city} → {load.delivery_city}
              </p>
              <span>
                {load.hard_to_cover && (
                  <span style={{
                    fontSize: 12, padding: "3px 10px", borderRadius: 20, marginRight: 6,
                    background: "#fff7ed", color: "#9a3412", fontWeight: 700,
                  }}>
                    🔥 Hard to cover
                  </span>
                )}
                <span style={{
                  fontSize: 12, padding: "3px 10px", borderRadius: 20,
                  background: b.bg, color: b.color,
                }}>
                  {load.status.replace("_", " ")}
                </span>
              </span>
            </div>
            <p style={{ color: "#4b5568", fontSize: 13, margin: "0 0 10px" }}>
              {load.equipment_type} · ${load.rate} · Pickup {load.pickup_date}
              {load.carrier && (
                <>
                  {" "}· Carrier:{" "}
                  <a href={`/carriers/${load.carrier.id}`} style={{ color: "#1d4ed8" }}>
                    {load.carrier.company_name}
                  </a>
                </>
              )}
            </p>

            {(load.status === "confirmed" || load.status === "picked_up") && (
              <div style={{ marginBottom: 8 }}>
                {load.status === "confirmed" && isNear(load.pickup_lat, load.pickup_lng) && (
                  <p style={{
                    background: "#e9f7ef", color: "#166534", fontSize: 12, fontWeight: 700,
                    borderRadius: 6, padding: "6px 10px", margin: "0 0 8px", display: "inline-block",
                  }}>
                    📍 Looks like you&apos;re near pickup
                  </p>
                )}
                {load.status === "picked_up" && isNear(load.delivery_lat, load.delivery_lng) && (
                  <p style={{
                    background: "#e9f7ef", color: "#166534", fontSize: 12, fontWeight: 700,
                    borderRadius: 6, padding: "6px 10px", margin: "0 0 8px", display: "inline-block",
                  }}>
                    📍 Looks like you&apos;re near the delivery location
                  </p>
                )}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {load.status === "confirmed" && (
                    <button onClick={() => markPickedUp(load.id)}
                      style={{
                        background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
                        padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}>
                      Mark picked up
                    </button>
                  )}
                  {load.status === "picked_up" && (
                    <button onClick={() => markInTransit(load.id)}
                      style={{
                        background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
                        padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}>
                      Mark in transit
                    </button>
                  )}
                  <button onClick={() => markDelivered(load.id)}
                    style={{
                      background: "#fff", border: "1.5px solid #1d4ed8", borderRadius: 6,
                      padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#1d4ed8", cursor: "pointer",
                    }}>
                    Skip to delivered
                  </button>
                </div>
              </div>
            )}

            {load.status === "in_transit" && (
              <div style={{ marginBottom: 8 }}>
                {isNear(load.delivery_lat, load.delivery_lng) && (
                  <p style={{
                    background: "#e9f7ef", color: "#166534", fontSize: 12, fontWeight: 700,
                    borderRadius: 6, padding: "6px 10px", margin: "0 0 8px", display: "inline-block",
                  }}>
                    📍 Looks like you&apos;re near the delivery location
                  </p>
                )}
                <button onClick={() => markDelivered(load.id)}
                  style={{
                    background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
                    padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}>
                  Mark delivered
                </button>
              </div>
            )}

            {load.status === "open" && claiming !== load.id && (
              <button
                onClick={() => {
                  if (!me) {
                    window.location.href = "/login?next=/loads";
                    return;
                  }
                  setClaiming(load.id);
                  setClaimResult(null);
                }}
                style={{
                  background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
                  padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>
                {me ? "Claim this load" : "Log in to claim"}
              </button>
            )}

            {claiming === load.id && !claimResult && me && me.verified_status !== "verified" && (
              <div style={{ borderTop: "1px solid #e2e5ea", paddingTop: 12, marginTop: 8 }}>
                <p style={{ color: "#92400e", fontSize: 13 }}>
                  Your account isn't verified yet (status: {me.verified_status}). You'll be able to claim
                  loads once an admin approves your documents.
                </p>
              </div>
            )}

            {claiming === load.id && !claimResult && me && me.verified_status === "verified" && (
              <div style={{ borderTop: "1px solid #e2e5ea", paddingTop: 12, marginTop: 8 }}>
                <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
                  Who's actually driving this load?
                </label>
                <label style={{ display: "block", fontSize: 13, color: "#14181f", marginBottom: 6 }}>
                  <input type="radio" checked={driverType === "self"}
                    onChange={() => setDriverType("self")} /> I'm driving it myself
                </label>
                <label style={{ display: "block", fontSize: 13, color: "#14181f", marginBottom: 10 }}>
                  <input type="radio" checked={driverType === "assigned"}
                    onChange={() => setDriverType("assigned")} /> I'm assigning a driver
                </label>

                {driverType === "assigned" && (
                  <>
                    <input value={driverName} onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Driver's name"
                      style={{
                        width: "100%", padding: 8, marginBottom: 8, background: "#ffffff",
                        border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
                      }} />
                    <input value={driverContact} onChange={(e) => setDriverContact(e.target.value)}
                      placeholder="Driver's email"
                      style={{
                        width: "100%", padding: 8, marginBottom: 8, background: "#ffffff",
                        border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
                      }} />
                    <p style={{ fontSize: 11, color: "#6b7280", marginTop: -4, marginBottom: 10 }}>
                      Texting isn't available right now — we'll email the driver a private confirmation link instead.
                    </p>

                    <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
                      <input type="checkbox" checked={driverConsent}
                        onChange={(e) => setDriverConsent(e.target.checked)}
                        style={{ marginTop: 2 }} />
                      <span>
                        I confirm this driver has agreed, as part of our working relationship, to receive
                        this one-time text or email to verify insurance coverage for this load.
                      </span>
                    </label>
                  </>
                )}

                <button onClick={() => submitClaim(load.id)}
                  disabled={driverType === "assigned" && !driverConsent}
                  style={{
                    background: (driverType === "assigned" && !driverConsent) ? "#d1e7dd" : "#166534",
                    color: "#fff", border: "none", borderRadius: 6,
                    padding: "8px 16px", fontSize: 13, fontWeight: 700,
                    cursor: (driverType === "assigned" && !driverConsent) ? "not-allowed" : "pointer",
                  }}>
                  Confirm claim
                </button>
              </div>
            )}

            {claimResult && claiming === load.id && (
              <div style={{ borderTop: "1px solid #e2e5ea", paddingTop: 12, marginTop: 8 }}>
                {claimResult.error && <p style={{ color: "#991b1b", fontSize: 13 }}>{claimResult.error}</p>}
                {claimResult.selfAttestationNeeded && (
                  <SelfAttestPrompt token={claimResult.token} />
                )}
                {claimResult.assignedLinkSent && (
                  <div style={{ marginTop: 4 }}>
                    <p style={{ color: "#166534", fontSize: 12, marginBottom: 8 }}>
                      Confirmation email sent to the driver automatically.
                    </p>
                    <p style={{ color: "#4b5568", fontSize: 12, marginBottom: 6 }}>
                      You can also share this link directly if needed:
                    </p>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8, background: "#ffffff",
                      border: "1px solid #e2e5ea", borderRadius: 6, padding: "8px 10px", marginBottom: 8,
                    }}>
                      <code style={{ color: "#1d4ed8", fontSize: 13, wordBreak: "break-all", flex: 1 }}>
                        {claimResult.confirmUrl}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(claimResult.confirmUrl)}
                        style={{
                          background: "#e2e5ea", color: "#14181f", border: "none", borderRadius: 6,
                          padding: "6px 10px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                        }}>
                        Copy link
                      </button>
                    </div>
                  </div>
                )}
                {claimResult.assignedLinkSent === false && claimResult.confirmUrl && (
                  <div style={{ marginTop: 4 }}>
                    <p style={{ color: "#991b1b", fontSize: 13, marginBottom: 6 }}>
                      {claimResult.error || "The confirmation email couldn't be sent."} Share this link with the driver yourself (text, call, email):
                    </p>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8, background: "#ffffff",
                      border: "1px solid #e2e5ea", borderRadius: 6, padding: "8px 10px", marginBottom: 8,
                    }}>
                      <code style={{ color: "#1d4ed8", fontSize: 13, wordBreak: "break-all", flex: 1 }}>
                        {claimResult.confirmUrl}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(claimResult.confirmUrl)}
                        style={{
                          background: "#e2e5ea", color: "#14181f", border: "none", borderRadius: 6,
                          padding: "6px 10px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                        }}>
                        Copy link
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SelfAttestPrompt({ token }) {
  const [answered, setAnswered] = useState(false);
  async function respond(response) {
    await fetch(`/api/attestations/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    setAnswered(true);
  }
  if (answered) return <p style={{ color: "#166534", fontSize: 13 }}>Thanks - recorded.</p>;
  return (
    <div>
      <p style={{ fontSize: 13, color: "#14181f", marginBottom: 8 }}>
        Confirm: are you covered under your own active insurance/authority for this trip?
      </p>
      <button onClick={() => respond("own_authority")}
        style={{ marginRight: 8, background: "#166534", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
        Yes
      </button>
      <button onClick={() => respond("neither")}
        style={{ background: "#fdecec", color: "#991b1b", border: "1px solid #991b1b", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
        No / not sure
      </button>
    </div>
  );
}
