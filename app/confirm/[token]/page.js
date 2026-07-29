"use client";
import { useEffect, useState } from "react";

const optionStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "16px 14px",
  marginBottom: 10,
  background: "#12121e",
  border: "1px solid #2a2a3e",
  borderRadius: 10,
  color: "#e0e0e0",
  fontSize: 14,
  lineHeight: 1.4,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
  transition: "background 0.1s ease, transform 0.05s ease",
};

// A button that gives clear visual feedback on tap — important since this
// page is opened almost exclusively on a phone from an SMS/email link.
function Option({ onClick, danger, children }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        ...optionStyle,
        background: danger ? "#3a1a1a" : pressed ? "#1a1a2e" : "#12121e",
        border: danger ? "1px solid #ff6b6b" : "1px solid #2a2a3e",
        color: danger ? "#ff6b6b" : "#e0e0e0",
        transform: pressed ? "scale(0.98)" : "scale(1)",
      }}
    >
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
      <div
        style={{
          width: 28,
          height: 28,
          border: "3px solid #2a2a3e",
          borderTopColor: "#5c5cff",
          borderRadius: "50%",
          animation: "confirm-spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes confirm-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function ConfirmPage({ params }) {
  const { token } = params;
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/attestations/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setInfo(d);
      })
      .catch(() => setError("Couldn't load this confirmation link. Check your connection and try again."));
  }, [token]);

  async function respond(response) {
    setSubmitting(true);
    try {
      await fetch(`/api/attestations/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      setSubmitted(true);
    } catch {
      setSubmitting(false);
      setError("Something went wrong submitting your response. Please try again.");
    }
  }

  if (error) {
    return (
      <div
        style={{
          background: "#1a1212",
          border: "1px solid #ff6b6b",
          borderRadius: 12,
          padding: 20,
          textAlign: "center",
        }}
      >
        <p style={{ color: "#ff6b6b", fontWeight: 700, margin: "0 0 6px" }}>Something's not right</p>
        <p style={{ color: "#c88", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{error}</p>
      </div>
    );
  }

  if (!info) return <Spinner />;

  if (submitted) {
    return (
      <div
        style={{
          background: "#12211a",
          border: "1px solid #4caf50",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#4caf50", fontSize: 20, margin: "0 0 8px" }}>✓ Confirmed</h1>
        <p style={{ color: "#888", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          Thanks — your response has been recorded privately. It cannot be seen by the carrier. You can
          close this page now.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          background: "#12121e",
          border: "1px solid #2a2a3e",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>You've been assigned a load</p>
        <p style={{ fontWeight: 700, color: "#fff", fontSize: 17, margin: "0 0 10px", wordBreak: "break-word" }}>
          {info.load.pickup_city} → {info.load.delivery_city}
        </p>
        <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
          Carrier: {info.carrier.company_name} · Pickup {info.load.pickup_date}
        </p>
      </div>

      <div style={{ background: "#1a1a2e", borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#e0e0e0", margin: "0 0 6px" }}>
          What "covered" actually means
        </p>
        <p style={{ fontSize: 13, color: "#888", margin: 0, lineHeight: 1.7 }}>
          Being covered means you're a named or listed driver on the carrier's active commercial insurance
          policy for this trip. A truck can carry valid insurance papers while you personally are not
          covered under them. If you're unsure, ask the carrier directly before you drive — don't assume.
        </p>
      </div>

      <p style={{ fontSize: 15, color: "#fff", marginBottom: 12, fontWeight: 700 }}>
        Are you covered for this trip?
      </p>

      <Option onClick={() => !submitting && respond("covered_under_policy")}>
        Yes, I'm listed on {info.carrier.company_name}'s active policy
      </Option>
      <Option onClick={() => !submitting && respond("own_authority")}>
        Yes, I'm running under my own authority and insurance
      </Option>
      <Option danger onClick={() => !submitting && respond("neither")}>
        No, or I'm not sure — I have not confirmed coverage
      </Option>

      {submitting && (
        <p style={{ fontSize: 13, color: "#888", textAlign: "center", marginTop: 10 }}>Submitting…</p>
      )}

      <p style={{ fontSize: 12, color: "#666", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
        Your response is private and cannot be seen or changed by the carrier.
      </p>
    </div>
  );
}
