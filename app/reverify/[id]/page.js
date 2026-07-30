"use client";
import { useEffect, useState } from "react";

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

export default function Reverify({ params }) {
      const { id: carrierId } = params;
      const [carrier, setCarrier] = useState(undefined);
      const [form, setForm] = useState({
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
      const [error, setError] = useState(null);

  useEffect(() => {
          fetch("/api/carriers/me")
            .then((r) => r.json())
            .then((d) => setCarrier(d.carrier))
            .catch(() => setCarrier(null));
  }, []);

  function update(field, value) {
          setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
          e.preventDefault();
          setStatus("submitting");
          setError(null);
          const res = await fetch(`/api/carriers/${carrierId}/reverify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
                    setStatus("success");
          } else {
                    setStatus("error");
                    setError(data.error || "Something went wrong - please try again.");
          }
  }

  if (carrier === undefined) return <p style={{ color: "#888" }}>Loading...</p>;

  if (!carrier) {
          return (
                    <div>
                      <h1 style={{ color: "#fff" }}>Update Your Verification</h1>
        <p style={{ color: "#888", marginBottom: 20 }}>
          Log in to your carrier account to submit updated documents.
              </p>
        <a href={`/login?next=/reverify/${carrierId}`} style={{
                        display: "inline-block", padding: "12px 20px", background: "#4caf50", color: "#fff",
                        borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none",
          }}>
          Log In
              </a>
              </div>
    );
}

  if (status === "success") {
          return (
                    <div>
                      <h1 style={{ color: "#4caf50" }}>Submitted</h1>
        <p style={{ color: "#888" }}>
          Your updated documents were submitted for review. We review everything within 24-48 hours,
                        and you'll be able to claim loads again once approved.
              </p>
              </div>
    );
}

  return (
          <div>
            <h1 style={{ color: "#fff" }}>Update Your Verification</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Logged in as <strong style={{ color: "#e0e0e0" }}>{carrier.company_name}</strong>. Use this if your
        insurance has expired or your documents are out of date - we review everything within 24-48 hours.
            </p>
      <form onSubmit={handleSubmit}>
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

                      <button
          type="submit"
          disabled={status === "submitting"}
                        style={{
                          width: "100%",
                          padding: "14px",
                          background: "#4caf50",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 15,
                          cursor: "pointer",
          }}
        >
{status === "submitting" ? "Submitting..." : "Submit Updated Documents"}
</button>
{status === "error" && <p style={{ color: "#ff6b6b", marginTop: 12 }}>{error}</p>}
    </form>
    </div>
  );
}
