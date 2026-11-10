"use client";
import { useState } from "react";
import { snapshotRows, saferUrl } from "../nightwatch/_snapshotRows";

const card = { background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12, padding: "16px 20px", marginBottom: 16 };
const label = { display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 };
const input = { width: "100%", boxSizing: "border-box", padding: 8, marginBottom: 10, background: "#fff", border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13 };
const smsEnabled = process.env.NEXT_PUBLIC_AUTHORITY_WATCH_SMS === "true";
const step = { color: "#14181f", fontWeight: 700, fontSize: 14, margin: "0 0 10px" };

export default function AuthorityWatchForm() {
  const [f, setF] = useState({ number: "", numberType: "dot", phone: "", email: "" });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const hasPhone = smsEnabled && !!f.phone.trim();
  const canSubmit = f.number.trim() && (hasPhone || f.email.trim()) && (!hasPhone || consent) && !submitting;

  async function submit() {
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/authority-watch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [f.numberType === "dot" ? "dot_number" : "mc_number"]: f.number,
          phone: f.phone, email: f.email, sms_consent: consent,
        }),
      });
      setResult(await res.json());
    } catch {
      setResult({ error: "Something went wrong. Check your connection and try again." });
    }
    setSubmitting(false);
  }

  if (result?.snapshot) return <Result result={result} />;

  return (
    <div style={{ maxWidth: 600 }}>
      {result?.error && <p style={{ color: "#991b1b", fontSize: 13, marginBottom: 12 }}>{result.error}</p>}

      <div style={card}>
        <p style={step}>1. Your company</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {["dot", "mc"].map((t) => (
            <button key={t} type="button" onClick={() => setF({ ...f, numberType: t })}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: "pointer",
                border: "1px solid " + (f.numberType === t ? "#166534" : "#e2e5ea"),
                background: f.numberType === t ? "#e9f7ef" : "#fff", color: f.numberType === t ? "#166534" : "#4b5568",
              }}>
              {t.toUpperCase()} number
            </button>
          ))}
        </div>
        <input value={f.number} onChange={set("number")} inputMode="numeric"
          placeholder={f.numberType === "dot" ? "USDOT number, e.g. 1234567" : "MC number, e.g. 123456"} style={{ ...input, marginBottom: 0 }} />
      </div>

      <div style={card}>
        <p style={step}>2. Where to send alerts</p>
        {smsEnabled && (<>
        <label style={label}>Cell phone (for text alerts)</label>
        <input value={f.phone} onChange={set("phone")} placeholder="(555) 123-4567" inputMode="tel" style={input} />
        </>)}
        {hasPhone && (
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
            <span>I agree to receive Authority Watch alert texts from Nightlane at this number (a welcome text, then only when my
              FMCSA status changes). Message and data rates may apply. Reply STOP to opt out.</span>
          </label>
        )}
        <label style={label}>Email</label>
        <input value={f.email} onChange={set("email")} placeholder="you@company.com" inputMode="email" style={{ ...input, marginBottom: 0 }} />
        <p style={{ fontSize: 11, color: "#8a92a0", margin: "8px 0 0" }}>{smsEnabled ? "Use one or both." : "Text alerts are coming soon. For now, alerts come by email."}</p>
      </div>

      <button onClick={submit} disabled={!canSubmit}
        style={{
          background: canSubmit ? "#166534" : "#9aa1ac", color: "#fff", border: "none", borderRadius: 8,
          padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed",
        }}>
        {submitting ? "Checking FMCSA..." : "Start watching my authority"}
      </button>
    </div>
  );
}

function Result({ result }) {
  const s = result.snapshot;
  const rows = snapshotRows(s);
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ ...card, borderLeft: "4px solid #166534" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#166534", margin: "0 0 8px" }}>
          {result.alreadyWatching ? "You're already signed up for this DOT." : "You're signed up. We'll check every morning."}
        </p>
        <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 4px" }}>DOT {s.dotNumber}</p>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#14181f", margin: "0 0 4px" }}>{s.legalName || "Unknown name"}</p>
        {s.dbaName && <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 8px" }}>DBA {s.dbaName}</p>}

        <p style={{ fontSize: 12, fontWeight: 700, color: "#4b5568", margin: "12px 0 6px" }}>Where you stand right now (FMCSA public data)</p>
        <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
          <tbody>
            {rows.slice(0, 4).map((r) => (
              <tr key={r.label} style={{ borderTop: "1px solid #e2e5ea" }}>
                <td style={{ padding: "6px 0", color: "#4b5568" }}>{r.label}</td>
                <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 700, color: r.ok ? "#166534" : "#991b1b" }}>{r.value}</td>
              </tr>
            ))}
            {s.powerUnits != null && (
              <tr style={{ borderTop: "1px solid #e2e5ea" }}>
                <td style={{ padding: "6px 0", color: "#4b5568" }}>Power units on file</td>
                <td style={{ padding: "6px 0", textAlign: "right", fontWeight: 700, color: s.powerUnits > 0 ? "#166534" : "#92400e" }}>{s.powerUnits}</td>
              </tr>
            )}
          </tbody>
        </table>

        {result.notes?.length > 0 && (
          <div style={{ background: "#fef3e2", borderRadius: 8, padding: "10px 12px", marginTop: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", margin: "0 0 4px" }}>Worth a look</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#4b5568", lineHeight: 1.6 }}>
              {result.notes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        )}

        <p style={{ fontSize: 12, color: "#4b5568", margin: "12px 0 0", lineHeight: 1.6 }}>
          Confirm on <a href={saferUrl(s.dotNumber)} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8" }}>FMCSA SAFER</a>.
          {!result.alreadyWatching && (
            <> {result.smsSent ? "We sent you a welcome text. " : ""}{result.emailSent ? "We emailed you a welcome note with your stop link. " : ""}</>
          )}
        </p>
      </div>
    </div>
  );
}
