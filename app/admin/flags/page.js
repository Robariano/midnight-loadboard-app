"use client";
import { useEffect, useState } from "react";

const statusColor = {
  open: "#991b1b",
  escalated: "#92400e",
  resolved: "#166534",
};

export default function AdminFlags() {
  const [flags, setFlags] = useState(null);
  const [error, setError] = useState(null);
  const [noteDraft, setNoteDraft] = useState({}); // { [flagId]: text }

  function load() {
    fetch("/api/admin/flags")
      .then((r) => {
        if (r.status === 401) throw new Error("unauthorized");
        return r.json();
      })
      .then((d) => setFlags(d.flags))
      .catch(() => setError("unauthorized"));
  }

  useEffect(load, []);

  async function resolve(id) {
    await fetch(`/api/admin/flags/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution_note: noteDraft[id] || null }),
    });
    load();
  }

  async function escalate(id) {
    await fetch(`/api/admin/flags/${id}/escalate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution_note: noteDraft[id] || null }),
    });
    load();
  }

  if (error === "unauthorized") {
    return (
      <div>
        <p style={{ color: "#991b1b" }}>Not logged in.</p>
        <a href="/admin" style={{ color: "#1d4ed8" }}>Go to admin login →</a>
      </div>
    );
  }
  if (!flags) return <p style={{ color: "#4b5568" }}>Loading...</p>;

  const openFlags = flags.filter((f) => f.status !== "resolved");
  const resolvedFlags = flags.filter((f) => f.status === "resolved");

  return (
    <div>
      <h1 style={{ color: "#14181f" }}>Coverage Flags</h1>
      <p style={{ color: "#4b5568", marginBottom: 12 }}>
        <a href="/admin/carriers" style={{ color: "#1d4ed8" }}>← Carrier Review</a>
      </p>
      <p style={{ color: "#4b5568", marginBottom: 20 }}>
        Created whenever a driver answers "No / not sure" on a coverage confirmation. Resolving a
        flag clears it from the carrier's open count below — it does not automatically release
        the load from hold, so handle that separately if appropriate. Escalating keeps it counted
        as open and is meant for cases serious enough to consider revoking the carrier from Carrier
        Review.
      </p>

      <h2 style={{ color: "#14181f", fontSize: 16, marginTop: 24 }}>
        Open / escalated ({openFlags.length})
      </h2>
      {openFlags.length === 0 && <p style={{ color: "#4b5568" }}>None right now.</p>}
      {openFlags.map((f) => (
        <FlagCard
          key={f.id}
          flag={f}
          noteDraft={noteDraft}
          setNoteDraft={setNoteDraft}
          onResolve={() => resolve(f.id)}
          onEscalate={() => escalate(f.id)}
        />
      ))}

      <h2 style={{ color: "#14181f", fontSize: 16, marginTop: 24 }}>
        Resolved ({resolvedFlags.length})
      </h2>
      {resolvedFlags.length === 0 && <p style={{ color: "#4b5568" }}>None yet.</p>}
      {resolvedFlags.map((f) => (
        <FlagCard key={f.id} flag={f} readOnly />
      ))}
    </div>
  );
}

function FlagCard({ flag, noteDraft, setNoteDraft, onResolve, onEscalate, readOnly }) {
  const load = flag.attestation?.load;
  return (
    <div style={{
      background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
      padding: 16, marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontWeight: 700, color: "#14181f", margin: 0 }}>
          {flag.carrier?.company_name || "Unknown carrier"}
        </p>
        <span style={{ fontSize: 12, color: statusColor[flag.status] || "#4b5568" }}>
          {flag.status}
        </span>
      </div>
      <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
        {load ? `${load.pickup_city} → ${load.delivery_city} (load ${load.status})` : "Load not found"}
      </p>
      <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
        Driver: {flag.attestation?.driver_name || "—"} · Contact: {flag.attestation?.driver_contact || "—"}
      </p>
      <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 10px" }}>
        Flagged {new Date(flag.created_at).toLocaleString()}
      </p>

      {flag.resolution_note && (
        <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px" }}>
          Note: {flag.resolution_note}
        </p>
      )}

      {!readOnly && (
        <>
          <input
            value={noteDraft[flag.id] || ""}
            onChange={(e) => setNoteDraft((d) => ({ ...d, [flag.id]: e.target.value }))}
            placeholder="Optional note (why resolved/escalated)"
            style={{
              width: "100%", padding: 8, marginBottom: 10, background: "#ffffff",
              border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onResolve} style={{
              background: "#166534", color: "#fff", border: "none", borderRadius: 6,
              padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>
              Resolve
            </button>
            {flag.status !== "escalated" && (
              <button onClick={onEscalate} style={{
                background: "transparent", color: "#92400e", border: "1px solid #92400e",
                borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>
                Escalate
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
