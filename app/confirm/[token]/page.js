"use client";
import { useEffect, useState } from "react";

const optionStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "16px 14px",
  marginBottom: 10,
  background: "#f7f8fa",
  border: "1px solid #e2e5ea",
  borderRadius: 10,
  color: "#14181f",
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
        background: danger ? "#fdecec" : pressed ? "#f0f2f5" : "#f7f8fa",
        border: danger ? "1px solid #991b1b" : "1px solid #e2e5ea",
        color: danger ? "#991b1b" : "#14181f",
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
          border: "3px solid #e2e5ea",
          borderTopColor: "#1d4ed8",
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
          background: "#fdecec",
          border: "1px solid #991b1b",
          borderRadius: 12,
          padding: 20,
          textAlign: "center",
        }}
      >
        <p style={{ color: "#991b1b", fontWeight: 700, margin: "0 0 6px" }}>Something's not right</p>
        <p style={{ color: "#991b1b", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{error}</p>
      </div>
    );
  }

  if (!info) return <Spinner />;

  if (submitted) {
    return (
      <div
        style={{
          background: "#e9f7ef",
          border: "1px solid #166534",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#166534", fontSize: 20, margin: "0 0 8px" }}>✓ Confirmed</h1>
        <p style={{ color: "#4b5568", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
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
    background: "#f7f8fa",
    border: "1px solid #e2e5ea",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  }}
>
  <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>You've been assigned a load</p>
  {info.load ? (
    <>
      <p style={{ fontWeight: 700, color: "#14181f", fontSize: 17, margin: "0 0 10px", wordBreak: "break-word" }}>
        {info.load.pickup_city} → {info.load.delivery_city}
      </p>
      <p style={{ color: "#4b5568", fontSize: 13, margin: 0 }}>
        Carrier: {info.carrier.company_name} · Pickup {info.load.pickup_date}
      </p>
    </>
  ) : (
    <p style={{ color: "#4b5568", fontSize: 13, margin: 0 }}>
      Carrier: {info.carrier.company_name}
    </p>
  )}
</div>

      <div style={{ background: "#f0f2f5", borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#14181f", margin: "0 0 6px" }}>
          What "covered" actually means
        </p>
        <p style={{ fontSize: 13, color: "#4b5568", margin: 0, lineHeight: 1.7 }}>
          Being covered means you're a named or listed driver on the carrier's active commercial insurance
          policy for this trip. A truck can carry valid insurance papers while you personally are not
          covered under them. If you're unsure, ask the carrier directly before you drive — don't assume.
        </p>
      </div>

      <p style={{ fontSize: 15, color: "#14181f", marginBottom: 12, fontWeight: 700 }}>
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
        <p style={{ fontSize: 13, color: "#4b5568", textAlign: "center", marginTop: 10 }}>Submitting…</p>
      )}

      <p style={{ fontSize: 12, color: "#6b7280", textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
        Your response is private and cannot be seen or changed by the carrier.
      </p>
    </div>
  );
}
