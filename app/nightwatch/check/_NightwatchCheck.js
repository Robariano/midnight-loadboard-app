"use client";
import { useState } from "react";
import { snapshotRows, overallOk } from "../_snapshotRows";

const card = { background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12, padding: "16px 20px", marginBottom: 16 };
const label = { display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 };
const input = { width: "100%", boxSizing: "border-box", padding: 8, marginBottom: 10, background: "#fff", border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13 };
const step = { color: "#14181f", fontWeight: 700, fontSize: 14, margin: "0 0 10px" };

export default function NightwatchCheck() {
  const [f, setF] = useState({
    number: "", numberType: "dot", driver_name: "", driver_phone: "",
    checked_by_company: "", checked_by_name: "", load_reference: "",
  });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const wantsDriver = !!(f.driver_name.trim() || f.driver_phone.trim());
  const canSubmit = f.number.trim() && (!wantsDriver || consent) && !submitting;

  async function submit() {
    setSubmitting(true);
    setResult(null);
    const res = await fetch("/api/nightwatch/checks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [f.numberType === "dot" ? "dot_number" : "mc_number"]: f.number,
        driver_name: f.driver_name, driver_phone: f.driver_phone,
        driver_consent_confirmed: consent,
        checked_by_company: f.checked_by_company, checked_by_name: f.checked_by_name,
        load_reference: f.load_reference,
      }),
    });
    setResult(await res.json());
    setSubmitting(false);
  }

  function reset() {
    setResult(null);
    setConsent(false);
    setF({ ...f, number: "", driver_name: "", driver_phone: "", load_reference: "" });
  }

  if (result?.snapshot) return <Result result={result} onReset={reset} />;

  return (
    <div style={{ maxWidth: 600 }}>
      {result?.error && <p style={{ color: "#991b1b", fontSize: 13, marginBottom: 12 }}>{result.error}</p>}

      <div style={card}>
        <p style={step}>1. The carrier</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {["dot", "mc"].map((t) => (
            <button key={t} type="button" onClick={() => setF({ ...f, numberType: t })}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 700, borderRadius: 6, cursor: "pointer",
                border: "1px solid " + (f.numberType === t ? "#1d4ed8" : "#e2e5ea"),
                background: f.numberType === t ? "#e8effc" : "#fff", color: f.numberType === t ? "#1d4ed8" : "#4b5568",
              }}>
              {t.toUpperCase()} number
            </button>
          ))}
        </div>
        <input value={f.number} onChange={set("number")} inputMode="numeric"
          placeholder={f.numberType === "dot" ? "e.g. 1234567" : "e.g. 123456"} style={input} />
      </div>

      <div style={card}>
        <p style={step}>2. The driver <span style={{ fontWeight: 400, color: "#8a92a0", fontSize: 12 }}>(optional, recommended)</span></p>
        <p style={{ fontSize: 12, color: "#6b7280", margin: "-4px 0 10px", lineHeight: 1.5 }}>
          We text the driver a private link asking if they&apos;re covered under this carrier&apos;s policy.
          Your report shows confirmed, flagged, or waiting.
        </p>
        <label style={label}>Driver&apos;s name</label>
        <input value={f.driver_name} onChange={set("driver_name")} placeholder="Driver's name" style={input} />
        <label style={label}>Driver&apos;s cell phone</label>
        <input value={f.driver_phone} onChange={set("driver_phone")} placeholder="(555) 123-4567" inputMode="tel" style={input} />
        {wantsDriver && (
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#6b7280" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
            <span>The carrier confirmed this driver agreed to receive a one-time text to verify coverage for this load.</span>
          </label>
        )}
      </div>

      <div style={card}>
        <p style={step}>3. For your report <span style={{ fontWeight: 400, color: "#8a92a0", fontSize: 12 }}>(optional)</span></p>
        <label style={label}>Your company</label>
        <input value={f.checked_by_company} onChange={set("checked_by_company")} placeholder="Brokerage name" style={input} />
        <label style={label}>Your name</label>
        <input value={f.checked_by_name} onChange={set("checked_by_name")} placeholder="Who ran this check" style={input} />
        <label style={label}>Load or PO number</label>
        <input value={f.load_reference} onChange={set("load_reference")} placeholder="e.g. 448812" style={{ ...input, marginBottom: 0 }} />
      </div>

      <button onClick={submit} disabled={!canSubmit}
        style={{
          background: canSubmit ? "#14181f" : "#9aa1ac", color: "#fff", border: "none", borderRadius: 8,
          padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed",
        }}>
        {submitting ? "Checking..." : wantsDriver ? "Run check & text driver" : "Run carrier check"}
      </button>
    </div>
  );
}

function Result({ result, onReset }) {
  const s = result.snapshot;
  const ok = overallOk(s);
  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ ...card, borderLeft: `4px solid ${ok ? "#166534" : "#991b1b"}` }}>
        <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 4px" }}>DOT {s.dotNumber}</p>
        <p style={{ fontSize: 17, fontWeight: 700, color: "#14181f", margin: "0 0 4px" }}>{s.legalName || "Unknown name"}</p>
        {s.dbaName && <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>DBA {s.dbaName}</p>}
        <p style={{ fontSize: 13, fontWeight: 700, color: ok ? "#166534" : "#991b1b", margin: "8px 0 10px" }}>
          {ok ? "Carrier checks out with FMCSA" : "Something needs a closer look"}
        </p>
        {snapshotRows(s).map((r) => (
          <p key={r.label} style={{ fontSize: 13, margin: "4px 0", color: "#14181f" }}>
            <span style={{ color: r.ok ? "#166534" : "#991b1b", fontWeight: 700 }}>{r.ok ? "✓" : "✗"}</span> {r.label}: {r.value}
          </p>
        ))}
      </div>

      {result.driverTextSent === true && (
        <p style={{ color: "#166534", fontSize: 13, marginBottom: 12 }}>Text sent to the driver. Their answer will show on your report.</p>
      )}
      {result.driverTextSent === false && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ color: "#991b1b", fontSize: 13, marginBottom: 6 }}>The text couldn&apos;t be sent. Share this link with the driver:</p>
          <code style={{ fontSize: 12, background: "#fff", border: "1px solid #e2e5ea", padding: "6px 8px", borderRadius: 6, display: "block", wordBreak: "break-all" }}>{result.confirmUrl}</code>
        </div>
      )}

      {result.reportUrl ? (
        <div style={{ ...card, background: "#e8effc", borderColor: "#c9d8f5" }}>
          <p style={{ fontSize: 13, color: "#14181f", margin: "0 0 8px" }}>
            <b>Your report is saved.</b> Bookmark it or save it as a PDF. It updates when the driver answers.
          </p>
          <a href={result.reportUrl} style={{ color: "#1d4ed8", fontWeight: 700, fontSize: 14 }}>Open report &rarr;</a>
        </div>
      ) : (
        result.error && <p style={{ color: "#991b1b", fontSize: 13 }}>{result.error}</p>
      )}

      <button onClick={onReset} style={{ background: "transparent", color: "#4b5568", border: "1px solid #e2e5ea", borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
        Check another carrier
      </button>
    </div>
  );
}
