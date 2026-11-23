"use client";
import { useEffect, useState } from "react";
import { ALL_STATUSES, statusInfo } from "../../../lib/driverStatus";

// Admin: make a private status link for a driver and update it as the
// load moves. The driver opens /status/<token> on their phone.

const input = {
  width: "100%", padding: "10px 12px", fontSize: 15, borderRadius: 8,
  border: "1px solid #e2e5ea", background: "#ffffff", color: "#14181f", boxSizing: "border-box",
};
const card = { background: "#ffffff", border: "1px solid #e2e5ea", borderRadius: 12, padding: 16, marginBottom: 14 };
const btn = (bg, color = "#fff") => ({
  background: bg, color, border: "none", borderRadius: 8, padding: "9px 14px",
  fontSize: 14, fontWeight: 700, cursor: "pointer",
});

function linkUrl(token) {
  return `${window.location.origin}/status/${token}`;
}

async function copy(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

function NewLink({ onCreated }) {
  const [form, setForm] = useState({ driver_name: "", lane: "", pickup_text: "", status: "looking", message: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function create(e) {
    e.preventDefault();
    setSaving(true); setErr(null);
    const res = await fetch("/api/admin/driver-status", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setErr(d.error || "Couldn't make the link."); return; }
    setForm({ driver_name: "", lane: "", pickup_text: "", status: "looking", message: "" });
    onCreated(d.link);
  }

  return (
    <form onSubmit={create} style={card}>
      <h2 style={{ fontSize: 17, margin: "0 0 10px", color: "#14181f" }}>New driver link</h2>
      <div style={{ display: "grid", gap: 8 }}>
        <input style={input} placeholder="Driver first name (e.g. Arttie)" value={form.driver_name} onChange={set("driver_name")} aria-label="Driver name" />
        <input style={input} placeholder="Load (optional), e.g. Tulsa, OK → Nederland, CO" value={form.lane} onChange={set("lane")} aria-label="Load" />
        <input style={input} placeholder="Pickup (optional), e.g. Tue 11/24, 10 AM Central" value={form.pickup_text} onChange={set("pickup_text")} aria-label="Pickup" />
        <select style={input} value={form.status} onChange={set("status")} aria-label="Status">
          {ALL_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <textarea style={{ ...input, minHeight: 60 }} placeholder="Message to the driver (optional). Don't put rates here unless you mean to." value={form.message} onChange={set("message")} aria-label="Message" />
        <button type="submit" disabled={saving || !form.driver_name.trim()} style={{ ...btn("#1d4ed8"), opacity: form.driver_name.trim() ? 1 : 0.5 }}>
          {saving ? "Making link…" : "Make link"}
        </button>
        {err && <p style={{ color: "#991b1b", margin: 0, fontSize: 13 }}>{err}</p>}
      </div>
    </form>
  );
}

function LinkCard({ link, onChanged, fresh }) {
  const [status, setStatus] = useState(link.status);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(fresh ? "New link made. Copy the text below and send it to the driver." : null);
  const off = !!link.revoked_at || new Date(link.expires_at) < new Date();

  async function save(body) {
    setSaving(true); setNote(null);
    const res = await fetch(`/api/admin/driver-status/${link.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setNote(d.error || "Couldn't save."); return; }
    setMessage("");
    setNote("Saved. The driver's page shows it within a minute.");
    onChanged();
  }

  async function copyText() {
    const text = `Hey ${link.driver_name}, here's a private link where you can see your load status anytime (bid sent, booked, pickup info). I'll keep it updated: ${linkUrl(link.token)}`;
    setNote((await copy(text)) ? "Text copied. Paste it into a message to the driver." : linkUrl(link.token));
  }

  return (
    <div style={{ ...card, opacity: off ? 0.6 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#14181f" }}>{link.driver_name}</div>
          {link.lane && <div style={{ fontSize: 14, color: "#2b3340" }}>{link.lane}</div>}
          {link.pickup_text && <div style={{ fontSize: 13, color: "#4b5568" }}>Pickup: {link.pickup_text}</div>}
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "#4b5568" }}>
          <div style={{ fontWeight: 700, color: "#1d4ed8", fontSize: 14 }}>{statusInfo(link.status).label}</div>
          <div>{link.view_count ? `Driver opened it ${link.view_count}×` : "Not opened yet"}</div>
          {off && <div style={{ color: "#991b1b" }}>{link.revoked_at ? "Turned off" : "Expired"}</div>}
        </div>
      </div>

      {!off && (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          <select style={input} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="New status">
            {ALL_STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <input style={input} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message to driver (optional)" aria-label="Message to driver" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => save({ status, message })} disabled={saving} style={btn("#14181f")}>{saving ? "Saving…" : "Update driver"}</button>
            <button onClick={copyText} style={btn("#e8eefc", "#1d4ed8")}>Copy text for driver</button>
            <a href={`/status/${link.token}`} target="_blank" rel="noreferrer" style={{ ...btn("#f2f4f7", "#14181f"), textDecoration: "none" }}>View page</a>
            <button onClick={() => { if (confirm("Turn this link off? The driver won't be able to open it.")) save({ revoke: true }); }} style={btn("#fdecec", "#991b1b")}>Turn off</button>
          </div>
        </div>
      )}
      {note && <p style={{ fontSize: 13, color: "#2b3340", margin: "8px 0 0", wordBreak: "break-all" }}>{note}</p>}
    </div>
  );
}

export default function DriverStatusAdmin() {
  const [links, setLinks] = useState(null);
  const [err, setErr] = useState(null);
  const [freshId, setFreshId] = useState(null);

  async function load() {
    const res = await fetch("/api/admin/driver-status");
    if (res.status === 401) { window.location.href = "/admin"; return; }
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(d.error || "Couldn't load links."); return; }
    setLinks(d.links);
  }
  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ color: "#14181f", fontSize: 22 }}>Driver status links</h1>
      <p style={{ color: "#4b5568", fontSize: 14, marginTop: -6 }}>
        Send a driver one private link. Update it here as the load moves, and they always know where things stand.
      </p>
      <NewLink onCreated={(l) => { setFreshId(l.id); load(); }} />
      {err && <p style={{ color: "#991b1b" }}>{err}</p>}
      {links === null && !err && <p style={{ color: "#4b5568" }}>Loading…</p>}
      {links && links.length === 0 && <p style={{ color: "#4b5568" }}>No links yet.</p>}
      {links && links.map((l) => <LinkCard key={l.id + l.updated_at} link={l} onChanged={load} fresh={l.id === freshId} />)}
    </div>
  );
}
