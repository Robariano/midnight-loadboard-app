"use client";
import { useEffect, useState } from "react";

const statusColor = {
  pending: "#e0a94c",
  verified: "#4caf50",
  pending_reverification: "#e0a94c",
  revoked: "#ff6b6b",
};

export default function AdminCarriers() {
  const [carriers, setCarriers] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    fetch("/api/admin/carriers")
      .then((r) => {
        if (r.status === 401) throw new Error("unauthorized");
        return r.json();
      })
      .then((d) => setCarriers(d.carriers))
      .catch(() => setError("unauthorized"));
  }

  useEffect(load, []);

  async function approve(id) {
    await fetch(`/api/admin/carriers/${id}/approve`, { method: "POST" });
    load();
  }
  async function revoke(id) {
    if (!confirm("Revoke this carrier's credential? This is public-facing on the Revoked Credentials page.")) return;
    await fetch(`/api/admin/carriers/${id}/revoke`, { method: "POST" });
    load();
  }

  if (error === "unauthorized") {
    return (
      <div>
        <p style={{ color: "#ff6b6b" }}>Not logged in.</p>
        <a href="/admin" style={{ color: "#5c5cff" }}>Go to admin login →</a>
      </div>
    );
  }
  if (!carriers) return <p style={{ color: "#888" }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ color: "#fff" }}>Carrier Review</h1>
      <p style={{ color: "#888", marginBottom: 20 }}>
        Approve carriers after checking their submitted CDL, insurance, and authority links.
      </p>
      {carriers.map((c) => (
        <div key={c.id} style={{
          background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 12,
          padding: 16, marginBottom: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontWeight: 700, color: "#fff", margin: 0 }}>{c.company_name}</p>
            <span style={{ fontSize: 12, color: statusColor[c.verified_status] || "#888" }}>
              {c.verified_status}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>
            {c.contact_email} · DOT {c.dot_number || "—"} · MC {c.mc_number || "—"}
          </p>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>
            Carrier ID: <code style={{ color: "#5c5cff" }}>{c.id}</code>
          </p>
          <p style={{ fontSize: 12, margin: "0 0 4px" }}>
            {c.cdl_link && <a href={c.cdl_link} target="_blank" style={{ color: "#5c5cff", marginRight: 12 }}>CDL</a>}
            {c.insurance_link && <a href={c.insurance_link} target="_blank" style={{ color: "#5c5cff", marginRight: 12 }}>Insurance</a>}
            {c.authority_link && <a href={c.authority_link} target="_blank" style={{ color: "#5c5cff" }}>Authority</a>}
          </p>
          <p style={{ fontSize: 12, color: c.open_flag_count > 0 ? "#ff6b6b" : "#888", margin: "0 0 10px" }}>
            Lifetime flags: {c.lifetime_flag_count} · Open flags: {c.open_flag_count}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {c.verified_status !== "verified" && (
              <button onClick={() => approve(c.id)} style={{
                background: "#4caf50", color: "#fff", border: "none", borderRadius: 6,
                padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Approve</button>
            )}
            {c.verified_status !== "revoked" && (
              <button onClick={() => revoke(c.id)} style={{
                background: "transparent", color: "#ff6b6b", border: "1px solid #ff6b6b",
                borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Revoke</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
