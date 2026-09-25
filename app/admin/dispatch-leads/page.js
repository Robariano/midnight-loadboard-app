"use client";
import { useEffect, useState } from "react";

const statusColor = {
  new: "#1d4ed8",
  contacted: "#92400e",
  closed: "#4b5568",
};

export default function AdminDispatchLeads() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    fetch("/api/admin/dispatch-leads")
      .then((r) => {
        if (r.status === 401) throw new Error("unauthorized");
        return r.json();
      })
      .then((d) => setLeads(d.leads))
      .catch(() => setError("unauthorized"));
  }

  useEffect(load, []);

  async function setStatus(id, status) {
    await fetch(`/api/admin/dispatch-leads/${id}/status`, {
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
      <h1 style={{ color: "#14181f" }}>Dispatcher Leads</h1>
      <p style={{ color: "#4b5568", marginBottom: 20 }}>
        Submissions from carriers with their own MC/DOT authority looking for dispatch service.
        Private — never shown publicly.
      </p>
      {leads.length === 0 && <p style={{ color: "#4b5568" }}>No leads yet.</p>}
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
          <span style={{
            display: "inline-block", fontSize: 11, fontWeight: 700, padding: "2px 8px",
            borderRadius: 20, marginBottom: 6,
            background: l.has_own_authority ? "#eef2ff" : "#fef3e2",
            color: l.has_own_authority ? "#1d4ed8" : "#92400e",
          }}>
            {l.has_own_authority ? "Has own authority — can sign directly" : "No own authority — approach the fleet holder"}
          </span>
          {l.has_own_authority ? (
            <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
              MC {l.mc_number || "-"} &middot; DOT {l.dot_number || "-"}
            </p>
          ) : (
            <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
              Runs under: {l.leased_under_company || "-"}
            </p>
          )}
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
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {l.status !== "contacted" && (
              <button onClick={() => setStatus(l.id, "contacted")} style={{
                background: "transparent", color: "#92400e", border: "1px solid #92400e",
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
