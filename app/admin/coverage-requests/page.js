"use client";
import { useEffect, useState } from "react";

const usd = (n) => `$${Number(n).toLocaleString("en-US")}`;
const color = { pending: "#92400e", approved: "#1d4ed8", proving: "#1d4ed8", proved: "#166534", declined: "#4b5568", failed: "#991b1b" };

const input = { padding: "8px 10px", fontSize: 14, borderRadius: 6, border: "1px solid #cbd2db", background: "#fff", color: "#14181f", width: "100%", boxSizing: "border-box" };

// Dispatcher fills in the broker's minimums and approves in one step.
function NewForBroker({ onDone }) {
  const [f, setF] = useState({ request: "", dot: "4523542", liability: "1000000", cargo: "100000", through: "", contact: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function save(e) {
    e.preventDefault();
    if (!window.confirm(`Create and approve for the carrier?\n\n${f.request}\nDOT ${f.dot}: ${usd(f.liability || 0)} liability, ${usd(f.cargo || 0)} cargo, through ${f.through}\n\nOnly for a real broker you're booking with, at the minimums they asked for, with the carrier's standing OK.`)) return;
    setSaving(true); setErr(null);
    const res = await fetch("/api/admin/coverage-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setErr(d.error || "Couldn't save.");
    setF({ ...f, request: "", through: "", contact: "" });
    onDone();
  }
  return (
    <form onSubmit={save} style={{ border: "1px solid #bcd0fb", background: "#f3f7ff", borderRadius: 10, padding: 12, marginBottom: 16 }}>
      <b style={{ color: "#14181f" }}>New request for a broker (you fill it in, it&apos;s approved right away)</b>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginTop: 8 }}>
        <label style={{ fontSize: 12, color: "#374151" }}>Request name (broker + load)<input style={input} value={f.request} onChange={set("request")} placeholder="Swick Logistics order 524584" /></label>
        <label style={{ fontSize: 12, color: "#374151" }}>Carrier DOT<input style={input} value={f.dot} onChange={set("dot")} /></label>
        <label style={{ fontSize: 12, color: "#374151" }}>Min. liability ($)<input style={input} value={f.liability} onChange={set("liability")} /></label>
        <label style={{ fontSize: 12, color: "#374151" }}>Min. cargo ($)<input style={input} value={f.cargo} onChange={set("cargo")} /></label>
        <label style={{ fontSize: 12, color: "#374151" }}>Covered through (delivery date)<input type="date" style={input} value={f.through} onChange={set("through")} /></label>
        <label style={{ fontSize: 12, color: "#374151" }}>Broker contact (optional)<input style={input} value={f.contact} onChange={set("contact")} placeholder="name / email" /></label>
      </div>
      <button type="submit" disabled={saving || !f.request.trim() || !f.through} style={{ marginTop: 8, padding: "8px 14px", fontSize: 14, borderRadius: 6, border: "none", background: "#166534", color: "#fff", fontWeight: 700, cursor: "pointer", opacity: f.request.trim() && f.through ? 1 : 0.5 }}>
        {saving ? "Saving…" : "Create and approve"}
      </button>
      {err && <p style={{ color: "#991b1b", fontSize: 13, margin: "6px 0 0" }}>{err}</p>}
    </form>
  );
}

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

  async function decide(r, decision) {
    if (decision === "approve") {
      const ok = window.confirm(
        `Approve for the carrier?\n\n${r.request_text}\nDOT ${r.dot_number}: ${usd(r.min_liability)} liability, ${usd(r.min_cargo)} cargo, through ${r.covered_through}\n\nCheck: it's a real broker you're booking with, the minimums are what they asked for, the date is the delivery date, and the carrier OK'd you approving proofs.`
      );
      if (!ok) return;
    }
    const res = await fetch(`/api/admin/coverage-requests/${r.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) setError(d.error || "Couldn't save.");
    load();
  }

  const answerLink = (r) => `${window.location.origin}/coverage-check?q=${encodeURIComponent(r.request_text)}`;
  async function copyBroker(r) {
    const text = `Here's proof our insurance meets your minimums for ${r.request_text}, confirmed directly with our agent: ${answerLink(r)}  The COI with your name on it will follow.`;
    try { await navigator.clipboard.writeText(text); setCopied("b" + r.id); } catch { window.prompt("Copy this text:", text); }
  }

  const link = (r) => `${window.location.origin}/coverage-approve/${r.approve_token}`;
  async function copy(r) {
    const text = `Hi, it's Rob with Steady Wake / Nightlane. A broker asked for proof your insurance meets their minimums (${r.request_text}). Your COI stays private. Approve here: ${link(r)}`;
    try { await navigator.clipboard.writeText(text); setCopied(r.id); } catch { window.prompt("Copy this text:", text); }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ color: "#14181f" }}>Coverage proof requests</h1>
      <p style={{ color: "#374151", fontSize: 14 }}>
        Approve for the carrier yourself (with the carrier&apos;s standing OK), or send the carrier its approve link.
        Approved requests are proved by the worker on your computer
        (<code>npm run worker</code> in midnight/coverage-proof).
      </p>
      <button onClick={load} style={{ marginBottom: 12, padding: "6px 12px", fontSize: 13, borderRadius: 6, border: "1px solid #cbd2db", background: "#fff", cursor: "pointer" }}>↻ Refresh list</button>
      <NewForBroker onDone={load} />
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
          {["approved", "proving", "proved"].includes(r.status) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
              <button onClick={() => copyBroker(r)} style={{ padding: "6px 12px", fontSize: 13, borderRadius: 6, border: "1px solid #bcd0fb", background: "#e8eefc", color: "#1d4ed8", fontWeight: 700, cursor: "pointer" }}>
                {copied === "b" + r.id ? "Copied ✓" : "Copy text for broker"}
              </button>
              <a href={answerLink(r)} target="_blank" rel="noopener" style={{ fontSize: 13 }}>View broker&apos;s answer page</a>
              {r.status !== "proved" && <span style={{ fontSize: 12, color: "#92400e" }}>Not proved yet: the answer shows once the worker on your computer finishes.</span>}
            </div>
          )}
          {r.status === "pending" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <button onClick={() => decide(r, "approve")} style={{ padding: "6px 12px", fontSize: 13, borderRadius: 6, border: "none", background: "#166534", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                Approve for carrier
              </button>
              <button onClick={() => decide(r, "decline")} style={{ padding: "6px 12px", fontSize: 13, borderRadius: 6, border: "1px solid #cbd2db", background: "#fff", color: "#991b1b", cursor: "pointer" }}>
                Decline
              </button>
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
