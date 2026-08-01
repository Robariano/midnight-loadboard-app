"use client";
import { useEffect, useState } from "react";

const badgeColor = {
  open: { bg: "#e9f7ef", color: "#166534" },
  claimed: { bg: "#fef3e2", color: "#92400e" },
  coverage_pending: { bg: "#fef3e2", color: "#92400e" },
  confirmed: { bg: "#e9f7ef", color: "#166534" },
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
  const [showAllStatuses, setShowAllStatuses] = useState(false);

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

    fetch(`/api/loads?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setLoads(d.loads || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchLoads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function markDelivered(loadId) {
    const res = await fetch(`/api/loads/${loadId}/complete`, { method: "POST" });
    const data = await res.json();
    if (data.load) {
      setLoads((prev) => prev.map((l) => (l.id === loadId ? { ...l, status: data.load.status } : l)));
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ color: "#14181f", margin: 0 }}>Available Loads</h1>
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
              <span style={{
                fontSize: 12, padding: "3px 10px", borderRadius: 20,
                background: b.bg, color: b.color,
              }}>
                {load.status.replace("_", " ")}
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

            {load.status === "confirmed" && (
              <button onClick={() => markDelivered(load.id)}
                style={{
                  background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
                  padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8,
                }}>
                Mark delivered
              </button>
            )}

            {load.status === "delivered" && load.carrier && (
              <RatingForm loadId={load.id} carrierName={load.carrier.company_name} />
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

function RatingForm({ loadId, carrierName }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [raterName, setRaterName] = useState("");
  const [result, setResult] = useState(null);

  async function submit() {
    const res = await fetch(`/api/loads/${loadId}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment, rater_name: raterName }),
    });
    const data = await res.json();
    setResult(data);
  }

  if (result?.rating) {
    return <p style={{ color: "#166534", fontSize: 13 }}>Thanks - your rating for {carrierName} was recorded.</p>;
  }

  return (
    <div style={{ borderTop: "1px solid #e2e5ea", paddingTop: 12, marginTop: 8 }}>
      <p style={{ fontSize: 13, color: "#14181f", marginBottom: 8 }}>Rate {carrierName} on this load</p>
      {result?.error && <p style={{ color: "#991b1b", fontSize: 12, marginBottom: 8 }}>{result.error}</p>}
      <select value={rating} onChange={(e) => setRating(Number(e.target.value))}
        style={{
          padding: 8, marginBottom: 8, background: "#ffffff", border: "1px solid #e2e5ea",
          borderRadius: 6, color: "#14181f", fontSize: 13,
        }}>
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"*".repeat(n)} ({n})</option>)}
      </select>

      <input value={raterName} onChange={(e) => setRaterName(e.target.value)}
        placeholder="Your name (optional)"
        style={{
          display: "block", width: "100%", padding: 8, marginBottom: 8, background: "#ffffff",
          border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
        }} />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="How'd it go? (optional)" rows={2}
        style={{
          display: "block", width: "100%", padding: 8, marginBottom: 8, background: "#ffffff",
          border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13, resize: "vertical",
        }} />
      <button onClick={submit}
        style={{
          background: "#166534", color: "#fff", border: "none", borderRadius: 6,
          padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
        Submit rating
      </button>
    </div>
  );
}
