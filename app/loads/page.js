"use client";
import { useEffect, useState } from "react";

const badgeColor = {
  open: { bg: "#1a3a1a", color: "#4caf50" },
  claimed: { bg: "#3a331a", color: "#e0a94c" },
  coverage_pending: { bg: "#3a331a", color: "#e0a94c" },
  confirmed: { bg: "#1a3a1a", color: "#4caf50" },
  on_hold: { bg: "#3a1a1a", color: "#ff6b6b" },
  delivered: { bg: "#1a1a2e", color: "#888" },
};

export default function Loads() {
  const [loads, setLoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null); // load id being claimed
  const [carrierId, setCarrierId] = useState("");
  const [driverType, setDriverType] = useState("self"); // self or assigned
  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [claimResult, setClaimResult] = useState(null);

  useEffect(() => {
    fetch("/api/loads")
      .then((r) => r.json())
      .then((d) => setLoads(d.loads || []))
      .finally(() => setLoading(false));
  }, []);

  async function submitClaim(loadId) {
    const res = await fetch(`/api/loads/${loadId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carrier_id: carrierId,
        is_self_attestation: driverType === "self",
        driver_name: driverType === "self" ? null : driverName,
        driver_contact: driverType === "self" ? null : driverContact,
      }),
    });
    const data = await res.json();
    setClaimResult(data);
  }

  if (loading) return <p style={{ color: "#888" }}>Loading loads...</p>;

  return (
    <div>
      <h1 style={{ color: "#fff" }}>Available Loads</h1>
      {loads.length === 0 && (
        <p style={{ color: "#888" }}>
          No loads available right now. Check back soon or{" "}
          <a href="/post-load" style={{ color: "#5c5cff" }}>post a load</a>.
        </p>
      )}
      {loads.map((load) => {
        const b = badgeColor[load.status] || badgeColor.open;
        return (
          <div key={load.id} style={{
            background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 12,
            padding: "16px 20px", marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontWeight: 700, color: "#fff", margin: 0 }}>
                {load.pickup_city} → {load.delivery_city}
              </p>
              <span style={{
                fontSize: 12, padding: "3px 10px", borderRadius: 20,
                background: b.bg, color: b.color,
              }}>
                {load.status.replace("_", " ")}
              </span>
            </div>
            <p style={{ color: "#888", fontSize: 13, margin: "0 0 10px" }}>
              {load.equipment_type} · ${load.rate} · Pickup {load.pickup_date}
            </p>

            {load.status === "open" && claiming !== load.id && (
              <button onClick={() => { setClaiming(load.id); setClaimResult(null); }}
                style={{
                  background: "#5c5cff", color: "#fff", border: "none", borderRadius: 6,
                  padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}>
                Claim this load
              </button>
            )}

            {claiming === load.id && !claimResult && (
              <div style={{ borderTop: "1px solid #2a2a3e", paddingTop: 12, marginTop: 8 }}>
                <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 4 }}>
                  Your verified Carrier ID
                </label>
                <input value={carrierId} onChange={(e) => setCarrierId(e.target.value)}
                  placeholder="paste your carrier ID from your verification email"
                  style={{
                    width: "100%", padding: 8, marginBottom: 10, background: "#0a0a12",
                    border: "1px solid #2a2a3e", borderRadius: 6, color: "#e0e0e0", fontSize: 13,
                  }} />

                <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6 }}>
                  Who's actually driving this load?
                </label>
                <label style={{ display: "block", fontSize: 13, color: "#e0e0e0", marginBottom: 6 }}>
                  <input type="radio" checked={driverType === "self"}
                    onChange={() => setDriverType("self")} /> I'm driving it myself
                </label>
                <label style={{ display: "block", fontSize: 13, color: "#e0e0e0", marginBottom: 10 }}>
                  <input type="radio" checked={driverType === "assigned"}
                    onChange={() => setDriverType("assigned")} /> I'm assigning a driver
                </label>

                {driverType === "assigned" && (
                  <>
                    <input value={driverName} onChange={(e) => setDriverName(e.target.value)}
                      placeholder="Driver's name"
                      style={{
                        width: "100%", padding: 8, marginBottom: 8, background: "#0a0a12",
                        border: "1px solid #2a2a3e", borderRadius: 6, color: "#e0e0e0", fontSize: 13,
                      }} />
                    <input value={driverContact} onChange={(e) => setDriverContact(e.target.value)}
                      placeholder="Driver's phone or email"
                      style={{
                        width: "100%", padding: 8, marginBottom: 10, background: "#0a0a12",
                        border: "1px solid #2a2a3e", borderRadius: 6, color: "#e0e0e0", fontSize: 13,
                      }} />
                  </>
                )}

                <button onClick={() => submitClaim(load.id)}
                  style={{
                    background: "#4caf50", color: "#fff", border: "none", borderRadius: 6,
                    padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  }}>
                  Confirm claim
                </button>
              </div>
            )}

            {claimResult && claiming === load.id && (
              <div style={{ borderTop: "1px solid #2a2a3e", paddingTop: 12, marginTop: 8 }}>
                {claimResult.error && <p style={{ color: "#ff6b6b", fontSize: 13 }}>{claimResult.error}</p>}
                {claimResult.selfAttestationNeeded && (
                  <SelfAttestPrompt token={claimResult.token} />
                )}
                {claimResult.assignedLinkSent && (
                  <p style={{ color: "#4caf50", fontSize: 13 }}>
                    A confirmation link was generated for the assigned driver. In production this gets
                    texted/emailed automatically — for now, here it is to copy:
                    <br />
                    <code style={{ color: "#5c5cff" }}>{claimResult.confirmUrl}</code>
                  </p>
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
  if (answered) return <p style={{ color: "#4caf50", fontSize: 13 }}>Thanks — recorded.</p>;
  return (
    <div>
      <p style={{ fontSize: 13, color: "#e0e0e0", marginBottom: 8 }}>
        Confirm: are you covered under your own active insurance/authority for this trip?
      </p>
      <button onClick={() => respond("own_authority")}
        style={{ marginRight: 8, background: "#4caf50", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
        Yes
      </button>
      <button onClick={() => respond("neither")}
        style={{ background: "#3a1a1a", color: "#ff6b6b", border: "1px solid #ff6b6b", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
        No / not sure
      </button>
    </div>
  );
}
