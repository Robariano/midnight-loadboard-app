"use client";
import { useEffect, useState } from "react";

export default function ConfirmPage({ params }) {
  const { token } = params;
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/attestations/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setInfo(d);
      });
  }, [token]);

  async function respond(response) {
    await fetch(`/api/attestations/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    setSubmitted(true);
  }

  if (error) return <p style={{ color: "#ff6b6b" }}>{error}</p>;
  if (!info) return <p style={{ color: "#888" }}>Loading...</p>;

  if (submitted) {
    return (
      <div>
        <h1 style={{ color: "#4caf50" }}>✓ Confirmed</h1>
        <p style={{ color: "#888" }}>Thanks — your response has been recorded privately. It cannot be seen by the carrier.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>You've been assigned a load</p>
        <p style={{ fontWeight: 700, color: "#fff", fontSize: 16, margin: "0 0 10px" }}>
          {info.load.pickup_city} → {info.load.delivery_city}
        </p>
        <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
          Carrier: {info.carrier.company_name} · Pickup {info.load.pickup_date}
        </p>
      </div>

      <div style={{ background: "#1a1a2e", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", margin: "0 0 6px" }}>
          What "covered" actually means
        </p>
        <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.7 }}>
          Being covered means you're a named or listed driver on the carrier's active commercial insurance
          policy for this trip. A truck can carry valid insurance papers while you personally are not
          covered under them. If you're unsure, ask the carrier directly before you drive — don't assume.
        </p>
      </div>

      <p style={{ fontSize: 14, color: "#fff", marginBottom: 10 }}>Are you covered for this trip?</p>

      <button onClick={() => respond("covered_under_policy")}
        style={{
          display: "block", width: "100%", textAlign: "left", padding: 12, marginBottom: 8,
          background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#e0e0e0",
          fontSize: 13, cursor: "pointer",
        }}>
        Yes, I'm listed on {info.carrier.company_name}'s active policy
      </button>
      <button onClick={() => respond("own_authority")}
        style={{
          display: "block", width: "100%", textAlign: "left", padding: 12, marginBottom: 8,
          background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 8, color: "#e0e0e0",
          fontSize: 13, cursor: "pointer",
        }}>
        Yes, I'm running under my own authority and insurance
      </button>
      <button onClick={() => respond("neither")}
        style={{
          display: "block", width: "100%", textAlign: "left", padding: 12, marginBottom: 8,
          background: "#3a1a1a", border: "1px solid #ff6b6b", borderRadius: 8, color: "#ff6b6b",
          fontSize: 13, cursor: "pointer",
        }}>
        No, or I'm not sure — I have not confirmed coverage
      </button>

      <p style={{ fontSize: 12, color: "#666", textAlign: "center", marginTop: 14 }}>
        Your response is private and cannot be seen or changed by the carrier.
      </p>
    </div>
  );
}
