"use client";
import { useState } from "react";

const MESSAGES = {
  approved: "Approved. Nightlane is making the proof now; the broker can check it shortly.",
  proving: "Approved. The proof is being made on Midnight.",
  proved: "Done. The proof is on Midnight and the broker can see it.",
  declined: "Declined. Nothing was shared with the broker.",
  failed: "Approved, but the proof couldn't be made. Nightlane will follow up.",
};

export default function ApproveButtons({ token, status: initial, error: initialError }) {
  const [status, setStatus] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function answer(decision) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/coverage-approve/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(d.error || "Couldn't save your answer.");
    setStatus(d.status);
  }

  if (status !== "pending") {
    return (
      <p style={{ background: status === "declined" || status === "failed" ? "#f7f8fa" : "#f0fdf4", border: "1px solid #e2e5ea", borderRadius: 12, padding: 14, color: "#14181f" }}>
        {MESSAGES[status] || status}
        {status === "failed" && initialError ? <span style={{ display: "block", fontSize: 13, color: "#6b7280", marginTop: 6 }}>{initialError}</span> : null}
      </p>
    );
  }
  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button onClick={() => answer("approve")} disabled={busy} style={{ padding: "12px 22px", fontSize: 16, fontWeight: 800, borderRadius: 8, border: 0, background: "#166534", color: "#fff", cursor: "pointer" }}>
          {busy ? "Saving…" : "Approve"}
        </button>
        <button onClick={() => answer("decline")} disabled={busy} style={{ padding: "12px 22px", fontSize: 16, fontWeight: 700, borderRadius: 8, border: "1px solid #cbd2db", background: "#fff", color: "#14181f", cursor: "pointer" }}>
          Decline
        </button>
      </div>
      {error && <p style={{ color: "#991b1b", fontSize: 14 }}>{error}</p>}
    </div>
  );
}
