"use client";
import { useEffect, useState } from "react";

// Per-lead "add a note" box. Notes are appended with a date by
// /api/admin/dispatch-leads/[id]/notes, never overwritten.
function NoteBox({ id, onSaved }) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  async function save() {
    if (!text.trim()) return;
    setSaving(true);
    setErr(null);
    const res = await fetch(`/api/admin/dispatch-leads/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: text }),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setErr(d.error || "Couldn't save the note."); return; }
    setText("");
    onSaved();
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") save(); }}
          placeholder="Add a note (call outcome, next step…)"
          aria-label="Add a note"
          style={{
            flex: 1, minWidth: 0, padding: "8px 10px", fontSize: 14, borderRadius: 6,
            border: "1px solid #e2e5ea", background: "#ffffff", color: "#14181f",
          }} />
        <button onClick={save} disabled={saving || !text.trim()} style={{
          background: "#14181f", color: "#ffffff", border: "none", borderRadius: 6,
          padding: "6px 14px", fontSize: 12, fontWeight: 700,
          cursor: saving || !text.trim() ? "default" : "pointer", opacity: text.trim() ? 1 : 0.5,
        }}>{saving ? "Saving…" : "Add note"}</button>
      </div>
      {err && <p style={{ color: "#991b1b", fontSize: 12, margin: "4px 0 0" }}>{err}</p>}
    </div>
  );
}

const statusColor = {
  new: "#1d4ed8",
  contacted: "#92400e",
  closed: "#4b5568",
};


// Last activity = the newest of the lead's submit date and any "[Mon D]"
// stamp the Add note box wrote. No database column needed. A stamp that
// would land in the future is read as last year (notes don't store years).
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const STALE_DAYS = 14;
function lastActivity(l, now) {
  let latest = new Date(l.created_at);
  // Automated check lines ("FMCSA check…", "SAFER confirms…") aren't contact, so they don't count.
  for (const m of String(l.notes || "").matchAll(/\[([A-Z][a-z]{2}) (\d{1,2})\] (?!FMCSA check|CORRECTION \(SAFER|SAFER confirms)/g)) {
    const mi = MONTHS.indexOf(m[1]);
    if (mi < 0) continue;
    let d = new Date(now.getFullYear(), mi, Number(m[2]));
    if (d > now) d = new Date(now.getFullYear() - 1, mi, Number(m[2]));
    if (d > latest) latest = d;
  }
  return latest;
}
const daysSince = (d, now) => Math.floor((now - d) / 864e5);

export default function AdminDispatchLeads() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState("open"); // "followup" | "open" | "all"

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

  const now = new Date();
  const decorated = leads.map((l) => {
    const last = lastActivity(l, now);
    const days = daysSince(last, now);
    return { ...l, _last: last, _days: days, _stale: l.status !== "closed" && days >= STALE_DAYS };
  });
  const counts = {
    followup: decorated.filter((l) => l._stale).length,
    open: decorated.filter((l) => l.status !== "closed").length,
    all: decorated.length,
  };
  const shown = view === "followup"
    ? decorated.filter((l) => l._stale).sort((a, b) => a._last - b._last) // longest-waiting first
    : view === "open" ? decorated.filter((l) => l.status !== "closed") : decorated;
  const tabs = [["followup", "Needs follow-up"], ["open", "Open"], ["all", "All"]];

  return (
    <div>
      <h1 style={{ color: "#14181f" }}>Dispatcher Leads</h1>
      <p style={{ color: "#4b5568", marginBottom: 20 }}>
        Submissions from carriers with their own MC/DOT authority looking for dispatch service.
        Private — never shown publicly.
      </p>
      <div role="tablist" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {tabs.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={view === key} onClick={() => setView(key)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer",
            border: view === key ? "1px solid #14181f" : "1px solid #e2e5ea",
            background: view === key ? "#14181f" : "#ffffff",
            color: view === key ? "#ffffff" : key === "followup" && counts.followup ? "#92400e" : "#14181f",
          }}>{label} ({counts[key]})</button>
        ))}
      </div>
      {shown.length === 0 && (
        <p style={{ color: "#4b5568" }}>
          {view === "followup" ? `Nothing waiting. Every open lead has activity in the last ${STALE_DAYS} days.` : "No leads yet."}
        </p>
      )}
      {shown.map((l) => (
        <div key={l.id} style={{
          background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
          padding: 16, marginBottom: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontWeight: 700, color: "#14181f", margin: 0 }}>{l.company_name}</p>
            <span style={{ fontSize: 12, color: statusColor[l.status] || "#4b5568", fontWeight: 700, whiteSpace: "nowrap" }}>
              {l._stale && (
                <span style={{ background: "#fef3c7", color: "#92400e", borderRadius: 20, padding: "2px 8px", marginRight: 8 }}>
                  {l._days} days quiet
                </span>
              )}
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
              border: "1px solid #e2e5ea", borderRadius: 6, padding: "8px 10px", whiteSpace: "pre-line" }}>
              {l.notes}
            </p>
          )}
          <p style={{ fontSize: 11, color: "#8a92a0", margin: "6px 0 10px" }}>
            Last activity {l._last.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {l._days > 0 ? ` (${l._days} day${l._days === 1 ? "" : "s"} ago)` : " (today)"} · Submitted {new Date(l.created_at).toLocaleString()}
            {l.source ? ` · from: ${l.source}` : ""}
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
          <NoteBox id={l.id} onSaved={load} />
        </div>
      ))}
    </div>
  );
}
