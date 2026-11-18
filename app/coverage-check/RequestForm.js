"use client";
import { useState } from "react";

const input = { padding: "10px 12px", fontSize: 15, border: "1px solid #cbd2db", borderRadius: 8, width: "100%", boxSizing: "border-box" };
const label = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 4px" };

// A broker asks a carrier for a private coverage proof.
export default function RequestForm() {
  const [f, setF] = useState({ request: "", dot: "", liability: "1000000", cargo: "100000", through: "", contact: "" });
  const [state, setState] = useState({ busy: false, error: null, done: null });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: null, done: null });
    const res = await fetch("/api/coverage-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return setState({ busy: false, error: d.error || "Couldn't send the request.", done: null });
    setState({ busy: false, error: null, done: d.request });
  }

  if (state.done) {
    return (
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 16 }}>
        <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#1e3a8a" }}>Request sent</p>
        <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
          Nightlane will ask the carrier to approve it. Once they do, the proof is made on Midnight. Check back with
          the request &ldquo;<b>{state.done}</b>&rdquo; in the box above.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12, padding: 16 }}>
      <div>
        <label style={label} htmlFor="cr-request">Request name (you&apos;ll use it to look up the answer)</label>
        <input id="cr-request" style={input} value={f.request} onChange={set("request")} placeholder="MC 123456 load 1001" required maxLength={120} />
      </div>
      <div>
        <label style={label} htmlFor="cr-dot">Carrier DOT number</label>
        <input id="cr-dot" style={input} value={f.dot} onChange={set("dot")} inputMode="numeric" placeholder="1234567" required />
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 140px" }}>
          <label style={label} htmlFor="cr-liab">Minimum liability ($)</label>
          <input id="cr-liab" style={input} value={f.liability} onChange={set("liability")} inputMode="numeric" required />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={label} htmlFor="cr-cargo">Minimum cargo ($)</label>
          <input id="cr-cargo" style={input} value={f.cargo} onChange={set("cargo")} inputMode="numeric" required />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={label} htmlFor="cr-through">Covered through</label>
          <input id="cr-through" type="date" style={input} value={f.through} onChange={set("through")} required />
        </div>
      </div>
      <div>
        <label style={label} htmlFor="cr-contact">Your email or phone (optional)</label>
        <input id="cr-contact" style={input} value={f.contact} onChange={set("contact")} maxLength={120} />
      </div>
      {state.error && <p style={{ margin: 0, color: "#991b1b", fontSize: 14 }}>{state.error}</p>}
      <button type="submit" disabled={state.busy} style={{ padding: "10px 18px", fontSize: 15, fontWeight: 700, borderRadius: 8, border: 0, background: "#14181f", color: "#fff", cursor: "pointer" }}>
        {state.busy ? "Sending…" : "Ask the carrier for a proof"}
      </button>
    </form>
  );
}
