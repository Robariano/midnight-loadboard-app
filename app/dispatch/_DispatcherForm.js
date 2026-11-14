"use client";
import { useState } from "react";
import { SOURCE_STORAGE_KEY } from "./_SourceTracker";

// The actual lead-capture form, unchanged from the original
// app/need-a-dispatcher/page.js — moved here so it has one home now that
// /need-a-dispatcher just redirects to /dispatch/contact instead of
// duplicating this component. Still posts to the same /api/dispatch-leads
// endpoint, same admin panel.

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

export default function DispatcherLeadForm() {
  const [hasOwnAuthority, setHasOwnAuthority] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [mcNumber, setMcNumber] = useState("");
  const [dotNumber, setDotNumber] = useState("");
  const [leasedUnderCompany, setLeasedUnderCompany] = useState("");
  const [carrierNumber, setCarrierNumber] = useState("");
  const [carrierContact, setCarrierContact] = useState("");
  const [okToMention, setOkToMention] = useState(false);
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
    let source = null;
    try {
      source = window.localStorage.getItem(SOURCE_STORAGE_KEY);
    } catch {
      // ignore — source tracking is best-effort, never worth failing the form over
    }
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
        notes: hasOwnAuthority ? notes : [
          carrierNumber.trim() && `Carrier MC/DOT: ${carrierNumber.trim()}`,
          carrierContact.trim() && `Best contact at carrier: ${carrierContact.trim()}`,
          `OK to mention this driver to the carrier: ${okToMention ? "yes" : "no"}`,
          notes.trim() && `About the carrier: ${notes.trim()}`,
        ].filter(Boolean).join("\n"),
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
          Got it — thanks. You'll hear back directly, not through an automated system.
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
        Do you hold your own MC/DOT authority, or are you leased on to a carrier?
      </label>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button type="button" onClick={() => setHasOwnAuthority(true)} style={{
          flex: 1, padding: "8px", borderRadius: 6, cursor: "pointer",
          border: hasOwnAuthority ? "2px solid #7a2e1f" : "1px solid #e2e5ea",
          background: hasOwnAuthority ? "#f1e6cc" : "#ffffff",
          color: "#14181f", fontWeight: 700, fontSize: 13,
        }}>
          I have my own authority
        </button>
        <button type="button" onClick={() => setHasOwnAuthority(false)} style={{
          flex: 1, padding: "8px", borderRadius: 6, cursor: "pointer",
          border: !hasOwnAuthority ? "2px solid #7a2e1f" : "1px solid #e2e5ea",
          background: !hasOwnAuthority ? "#f1e6cc" : "#ffffff",
          color: "#14181f", fontWeight: 700, fontSize: 13,
        }}>
          I&apos;m leased on to a carrier
        </button>
      </div>

      {!hasOwnAuthority && (
        <div style={{
          background: "#fef3e2", border: "1px solid #f5d999", borderRadius: 8,
          padding: "10px 14px", marginBottom: 14,
        }}>
          <p style={{ fontSize: 12, color: "#7a2e1f", margin: 0, lineHeight: 1.5 }}>
            <b>Introduce me to your carrier.</b> Since you run under their authority, loads are
            booked through them. A lot of carriers with leased owner-operators get stretched thin on
            dispatch. Tell me who you run under and I&apos;ll reach out to them about backup dispatch
            help, for their trucks and yours. Anything you tell me about your pay or how you&apos;re
            treated stays between us.
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
          <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
            Their MC or DOT number (if you know it)
          </label>
          <input value={carrierNumber} onChange={(e) => setCarrierNumber(e.target.value)}
            placeholder="e.g. MC 654321" style={inputStyle} />
          <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
            Best person to talk to there (name, role, phone or email if you have it)
          </label>
          <input value={carrierContact} onChange={(e) => setCarrierContact(e.target.value)}
            placeholder="e.g. Mike, owner, (555) 555-5555" style={inputStyle} />
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#4b5568", marginBottom: 14 }}>
            <input type="checkbox" checked={okToMention} onChange={(e) => setOkToMention(e.target.checked)} style={{ marginTop: 2 }} />
            <span>It&apos;s OK to tell them you sent me</span>
          </label>
        </>
      )}

      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        {hasOwnAuthority ? "Email" : "Your email"}
      </label>
      <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
        placeholder="you@example.com" style={inputStyle} />

      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        {hasOwnAuthority ? "Phone" : "Your phone"}
      </label>
      <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
        placeholder="(555) 555-5555" style={inputStyle} />
      <p style={{ fontSize: 11, color: "#6b7280", marginTop: -10, marginBottom: 14 }}>
        At least one of email or phone is required.
      </p>

      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        {hasOwnAuthority === false
          ? "About that carrier (how many trucks they run, what freight they haul, who handles their dispatch)"
          : "What are you looking for? (equipment type, lanes, anything relevant)"}
      </label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
        placeholder={hasOwnAuthority === false
          ? "e.g. About 10 trucks, flatbed and hotshot, owner is Mike, they do their own dispatch but get busy"
          : "e.g. Semi dry van or 40-ft hotshot, Colorado and Texas lanes"}
        style={{ ...inputStyle, resize: "vertical" }} />

      <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, margin: "0 0 10px" }}>
        By sending, you agree Steady Wake Dispatch may call or text you about dispatch services.
        Message and data rates may apply. Reply STOP to opt out.
      </p>
      <button type="submit" disabled={status === "submitting"} style={{
        width: "100%", padding: "14px", background: "#7a2e1f", color: "#fff",
        border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15,
        cursor: status === "submitting" ? "not-allowed" : "pointer",
      }}>
        {status === "submitting" ? "Sending..." : "Send"}
      </button>
      {error && <p style={{ color: "#991b1b", marginTop: 10, fontSize: 13 }}>{error}</p>}
    </form>
  );
}
