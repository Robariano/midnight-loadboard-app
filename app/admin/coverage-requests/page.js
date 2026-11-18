"use client";
import { useEffect, useState } from "react";

const usd = (n) => `$${Number(n).toLocaleString("en-US")}`;
const color = { pending: "#92400e", approved: "#1d4ed8", proving: "#1d4ed8", proved: "#166534", declined: "#4b5568", failed: "#991b1b" };

// Admin: coverage proof requests (Midnight pilot), with the carrier approve link to send.
export default function CoverageRequestsAdmin() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  async function load() {
    const res = await fetch("/api/admin/coverage-requests", { cache: "no-store" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setError(res.status === 401 ? "Log in at /admin first." : d.error || "Couldn't load.");
    setRows(d.requests);
  }
  useEffect(() => { load(); }, []);

  const link = (r) => `${window.location.origin}/coverage-approve/${r.approve_token}`;
  async function copy(r) {
    const text = `Hi, it's Rob with Steady Wake / Nightlane. A broker asked for proof your insurance meets their minimums (${r.request_text}). Your COI stays private. Approve here: ${link(r)}`;
    try { await navigator.clipboard.writeText(text); setCopied(r.id); } catch { window.prompt("Copy this text:", text); }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ color: "#14181f" }}>Coverage proof requests</h1>
      <p style={{ color: "#374151", fontSize: 14 }}>
        Send the carrier its approve link. Approved requests are proved by the worker on your computer
        (<code>npm run worker</code> in midnight/coverage-proof).
      </p>
      <button onClick={load} style={{ marginBottom: 12, padding: "6px 12px", fontSize: 13, borderRadius: 6, border: "1px solid #cbd2db", background: "#fff", cursor: "pointer" }}>↻ Refresh list</button>
      {error && <p style={{ color: "#991b1b" }}>{error}</p>}
      {rows && rows.length === 0 && <p>No requests yet.</p>}
      {rows?.map((r) => (
        <div key={r.id} style={{ border: "1px solid #e2e5ea", borderRadius: 10, padding: 12, marginBottom: 10, background: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <b style={{ color: "#14181f" }}>{r.request_text}</b>
            <span style={{ color: color[r.status], fontWeight: 700, textTransform: "uppercase", fontSize: 12 }}>{r.status}</span>
          </div>
          <div style={{ fontSize: 14, color: "#374151", marginTop: 4 }}>
            DOT {r.dot_number} · {usd(r.min_liability)} liability · {usd(r.min_cargo)} cargo · through {r.covered_through}
            {r.broker_contact ? ` · broker: ${r.broker_contact}` : ""}
          </div>
          {r.error && <div style={{ fontSize: 13, color: "#991b1b", marginTop: 4 }}>{r.error}</div>}
          {r.status === "pending" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <button onClick={() => copy(r)} style={{ padding: "6px 12px", fontSize: 13, borderRadius: 6, border: "1px solid #cbd2db", background: "#f7f8fa", cursor: "pointer" }}>
                {copied === r.id ? "Copied ✓" : "Copy text with approve link"}
              </button>
              <a href={`/coverage-approve/${r.approve_token}`} target="_blank" rel="noopener" style={{ padding: "6px 12px", fontSize: 13, borderRadius: 6, border: "1px solid #cbd2db", background: "#f7f8fa", color: "#14181f", textDecoration: "none" }}>
                Open approve page
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
