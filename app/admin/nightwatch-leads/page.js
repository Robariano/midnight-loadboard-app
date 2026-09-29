"use client";
import { useEffect, useState } from "react";

const statusColor = {
  new: "#1d4ed8",
  contacted: "#92400e",
  closed: "#4b5568",
};

export default function AdminNightwatchLeads() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    fetch("/api/admin/nightwatch-leads")
      .then((r) => {
        if (r.status === 401) throw new Error("unauthorized");
        return r.json();
      })
      .then((d) => setLeads(d.leads))
      .catch(() => setError("unauthorized"));
  }

  useEffect(load, []);

  async function setStatus(id, status) {
    await fetch(`/api/admin/nightwatch-leads/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (error === "unauthorized") {
    return (
      <div>
        <p style={{ color: "#991b1b" }}>Not logged in.</p>
        <a href="/admin" style={{ color: "#1d4ed8" }}>Go to admin login &rarr;</a>
      </div>
    );
  }
  if (!leads) return <p style={{ color: "#4b5568" }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ color: "#14181f" }}>Nightwatch Early-Access Requests</h1>
      <p style={{ color: "#4b5568", marginBottom: 20 }}>
        Brokers who asked to be notified when Nightwatch launches. Private — never shown publicly.
      </p>
      {leads.length === 0 && <p style={{ color: "#4b5568" }}>No requests yet.</p>}
      {leads.map((l) => (
        <div key={l.id} style={{
          background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
          padding: 16, marginBottom: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontWeight: 700, color: "#14181f", margin: 0 }}>{l.company_name}</p>
            <span style={{ fontSize: 12, color: statusColor[l.status] || "#4b5568", fontWeight: 700 }}>
              {l.status}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
            {l.contact_name || "No name given"}
            {l.contact_email ? ` · ${l.contact_email}` : ""}
            {l.contact_phone ? ` · ${l.contact_phone}` : ""}
          </p>
          {l.notes && (
            <p style={{ fontSize: 13, color: "#14181f", margin: "8px 0", background: "#ffffff",
              border: "1px solid #e2e5ea", borderRadius: 6, padding: "8px 10px" }}>
              {l.notes}
            </p>
          )}
          <p style={{ fontSize: 11, color: "#8a92a0", margin: "6px 0 10px" }}>
            Submitted {new Date(l.created_at).toLocaleString()}
            {l.source ? ` · from: ${l.source}` : ""}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {l.status !== "contacted" && (
              <button onClick={() => setStatus(l.id, "contacted")} style={{
                background: "transparent", color: "#1d4ed8", border: "1px solid #1d4ed8",
                borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Mark contacted</button>
            )}
            {l.status !== "closed" && (
              <button onClick={() => setStatus(l.id, "closed")} style={{
                background: "transparent", color: "#4b5568", border: "1px solid #e2e5ea",
                borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Close</button>
            )}
            {l.status !== "new" && (
              <button onClick={() => setStatus(l.id, "new")} style={{
                background: "transparent", color: "#1d4ed8", border: "1px solid #1d4ed8",
                borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Reopen</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
