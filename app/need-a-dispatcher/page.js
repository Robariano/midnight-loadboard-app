"use client";
import { useState } from "react";

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

export default function NeedADispatcher() {
  const [hasOwnAuthority, setHasOwnAuthority] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [mcNumber, setMcNumber] = useState("");
  const [dotNumber, setDotNumber] = useState("");
  const [leasedUnderCompany, setLeasedUnderCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const res = await fetch("/api/dispatch-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: companyName,
        has_own_authority: hasOwnAuthority,
        mc_number: mcNumber,
        dot_number: dotNumber,
        leased_under_company: leasedUnderCompany,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        notes,
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
      <div>
        <h1 style={{ color: "#14181f" }}>Need a Dispatcher?</h1>
        <div style={{
          background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
          padding: "16px 20px",
        }}>
          <p style={{ color: "#166534", fontSize: 14, margin: 0 }}>
            Got it — thanks. You'll hear back directly, not through an automated system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: "#14181f", marginBottom: 4 }}>Need a Dispatcher?</h1>
      <p style={{ color: "#4b5568", fontSize: 13, marginBottom: 20 }}>
        Help finding loads, negotiating rates, and handling the back-office work — not a load board
        listing, just a direct line to a real dispatcher. This isn't public; only goes to the person
        running Midnight Loadboard.
      </p>

      <form onSubmit={handleSubmit} style={{
        background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
        padding: "16px 20px",
      }}>
        <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
          Do you hold your own MC/DOT authority, or run under someone else's?
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button type="button" onClick={() => setHasOwnAuthority(true)} style={{
            flex: 1, padding: "8px", borderRadius: 6, cursor: "pointer",
            border: hasOwnAuthority ? "2px solid #1d4ed8" : "1px solid #e2e5ea",
            background: hasOwnAuthority ? "#eef2ff" : "#ffffff",
            color: "#14181f", fontWeight: 700, fontSize: 13,
          }}>
            I have my own authority
          </button>
          <button type="button" onClick={() => setHasOwnAuthority(false)} style={{
            flex: 1, padding: "8px", borderRadius: 6, cursor: "pointer",
            border: !hasOwnAuthority ? "2px solid #1d4ed8" : "1px solid #e2e5ea",
            background: !hasOwnAuthority ? "#eef2ff" : "#ffffff",
            color: "#14181f", fontWeight: 700, fontSize: 13,
          }}>
            I run under someone else's
          </button>
        </div>

        {!hasOwnAuthority && (
          <div style={{
            background: "#fef3e2", border: "1px solid #f5d999", borderRadius: 8,
            padding: "10px 14px", marginBottom: 14,
          }}>
            <p style={{ fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
              Freight can only legally be booked in the name of whoever holds the operating
              authority — so this can't turn into a direct dispatch agreement with you individually.
              What it can do: we reach out to the carrier whose authority you run under about
              dispatching for their whole fleet, which would include you. Still worth submitting —
              just setting honest expectations up front.
            </p>
          </div>
        )}

        <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
          {hasOwnAuthority ? "Company name" : "Your name"}
        </label>
        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
          placeholder={hasOwnAuthority ? "e.g. Acme Trucking LLC" : "e.g. John Smith"}
          style={inputStyle} />

        {hasOwnAuthority ? (
          <>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
                  MC number
                </label>
                <input value={mcNumber} onChange={(e) => setMcNumber(e.target.value)}
                  placeholder="e.g. 654321" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
                  DOT number
                </label>
                <input value={dotNumber} onChange={(e) => setDotNumber(e.target.value)}
                  placeholder="e.g. 1234567" style={inputStyle} />
              </div>
            </div>
            <p style={{ fontSize: 11, color: "#6b7280", marginTop: -10, marginBottom: 14 }}>
              At least one of these is required.
            </p>
          </>
        ) : (
          <>
            <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
              Name of the carrier whose authority you run under
            </label>
            <input value={leasedUnderCompany} onChange={(e) => setLeasedUnderCompany(e.target.value)}
              placeholder="e.g. Big Rig Carriers LLC" style={inputStyle} />
          </>
        )}

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
          What are you looking for? (equipment type, lanes, anything relevant)
        </label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="e.g. Box truck, mostly Southwest lanes, need help getting consistent freight"
          style={{ ...inputStyle, resize: "vertical" }} />

        <button type="submit" disabled={status === "submitting"} style={{
          width: "100%", padding: "14px", background: "#1d4ed8", color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15,
          cursor: status === "submitting" ? "not-allowed" : "pointer",
        }}>
          {status === "submitting" ? "Sending..." : "Send"}
        </button>
        {error && <p style={{ color: "#991b1b", marginTop: 10, fontSize: 13 }}>{error}</p>}
      </form>
    </div>
  );
}
