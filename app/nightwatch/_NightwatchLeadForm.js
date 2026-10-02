"use client";
import { useState } from "react";

// Early-access request form for Nightwatch. Posts to /api/nightwatch-leads,
// shows up in the admin panel at app/admin/nightwatch-leads/page.js.

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 14,
  background: "#f7f8fa",
  border: "1px solid #e2e5ea",
  borderRadius: 6,
  color: "#14181f",
  fontSize: 14,
};

export default function NightwatchLeadForm() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [carrierVolume, setCarrierVolume] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    let source = null;
    try {
      source = new URLSearchParams(window.location.search).get("src");
    } catch {
      // ignore — source tracking is best-effort, never worth failing the form over
    }
    const res = await fetch("/api/nightwatch-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: companyName,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        carrier_volume: carrierVolume,
        notes,
        source,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setStatus("done");
    } else {
      setError(data.error || "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div style={{
        background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
        padding: "16px 20px",
      }}>
        <p style={{ color: "#166534", fontSize: 14, margin: 0 }}>
          Got it — you're on the list. We'll reach out directly when Nightwatch launches.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
      padding: "16px 20px",
    }}>
      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        Brokerage / company name
      </label>
      <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
        placeholder="e.g. Acme Logistics" style={inputStyle} />

      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        Your name
      </label>
      <input value={contactName} onChange={(e) => setContactName(e.target.value)}
        placeholder="e.g. Jane Doe" style={inputStyle} />

      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        Email
      </label>
      <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
        placeholder="you@example.com" style={inputStyle} />

      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        Phone
      </label>
      <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
        placeholder="(555) 555-5555" style={inputStyle} />
      <p style={{ fontSize: 11, color: "#6b7280", marginTop: -10, marginBottom: 14 }}>
        At least one of email or phone is required.
      </p>

      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        How many carriers do you vet in a typical month? (optional)
      </label>
      <select value={carrierVolume} onChange={(e) => setCarrierVolume(e.target.value)} style={inputStyle}>
        <option value="">Select a range...</option>
        <option value="Under 25/month">Under 25/month</option>
        <option value="25-100/month">25-100/month</option>
        <option value="100-500/month">100-500/month</option>
        <option value="500+/month">500+/month</option>
        <option value="Not sure / varies">Not sure / varies</option>
      </select>

      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        Anything else about your current process? (optional)
      </label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
        placeholder="e.g. Mostly manual FMCSA lookups right now, biggest pain is re-checking insurance monthly"
        style={{ ...inputStyle, resize: "vertical" }} />

      <button type="submit" disabled={status === "submitting"} style={{
        width: "100%", padding: "14px", background: "#14181f", color: "#fff",
        border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15,
        cursor: status === "submitting" ? "not-allowed" : "pointer",
      }}>
        {status === "submitting" ? "Sending..." : "Request Early Access"}
      </button>
      {error && <p style={{ color: "#991b1b", marginTop: 10, fontSize: 13 }}>{error}</p>}
    </form>
  );
}
