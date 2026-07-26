"use client";
import { useState } from "react";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 14,
  background: "#12121e",
  border: "1px solid #2a2a3e",
  borderRadius: 6,
  color: "#e0e0e0",
  fontSize: 14,
};

const labelStyle = { display: "block", fontSize: 13, color: "#888", marginBottom: 4 };

export default function GetVerified() {
  const [form, setForm] = useState({
    company_name: "",
    contact_email: "",
    contact_phone: "",
    dot_number: "",
    mc_number: "",
    cdl_class: "Class A",
    cdl_link: "",
    insurance_link: "",
    authority_link: "",
    insurance_expiration_date: "",
  });
  const [status, setStatus] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    const res = await fetch("/api/carriers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div>
        <h1 style={{ color: "#4caf50" }}>✓ Submitted</h1>
        <p style={{ color: "#888" }}>
          Your documents were submitted. We review everything within 24–48 hours. You'll hear from us at{" "}
          {form.contact_email}.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: "#fff" }}>Get Your Carrier Credential</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Verification is free. No fees. No subscriptions. New authority? You don't need history — just real,
        current documents.
      </p>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Company / Full Name</label>
        <input style={inputStyle} required value={form.company_name}
          onChange={(e) => update("company_name", e.target.value)} />

        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" required value={form.contact_email}
          onChange={(e) => update("contact_email", e.target.value)} />

        <label style={labelStyle}>Phone</label>
        <input style={inputStyle} value={form.contact_phone}
          onChange={(e) => update("contact_phone", e.target.value)} />

        <label style={labelStyle}>DOT Number</label>
        <input style={inputStyle} value={form.dot_number}
          onChange={(e) => update("dot_number", e.target.value)} />

        <label style={labelStyle}>MC Number</label>
        <input style={inputStyle} value={form.mc_number}
          onChange={(e) => update("mc_number", e.target.value)} />

        <label style={labelStyle}>CDL Class</label>
        <select style={inputStyle} value={form.cdl_class}
          onChange={(e) => update("cdl_class", e.target.value)}>
          <option>Class A</option>
          <option>Class B</option>
          <option>Class C</option>
        </select>

        <label style={labelStyle}>Link to CDL (Drive/Dropbox)</label>
        <input style={inputStyle} value={form.cdl_link}
          onChange={(e) => update("cdl_link", e.target.value)} />

        <label style={labelStyle}>Link to Insurance Certificate</label>
        <input style={inputStyle} value={form.insurance_link}
          onChange={(e) => update("insurance_link", e.target.value)} />

        <label style={labelStyle}>Insurance Expiration Date</label>
        <input style={inputStyle} type="date" value={form.insurance_expiration_date}
          onChange={(e) => update("insurance_expiration_date", e.target.value)} />

        <label style={labelStyle}>Link to FMCSA / Operating Authority</label>
        <input style={inputStyle} value={form.authority_link}
          onChange={(e) => update("authority_link", e.target.value)} />

        <button type="submit" disabled={status === "submitting"}
          style={{
            width: "100%", padding: "14px", background: "#4caf50", color: "#fff",
            border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>
          {status === "submitting" ? "Submitting..." : "Submit for Verification"}
        </button>
        {status === "error" && (
          <p style={{ color: "#ff6b6b", marginTop: 12 }}>Something went wrong — please try again.</p>
        )}
      </form>
    </div>
  );
}
