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
const labelStyle = { display: "block", fontSize: 13, color: "#4b5568", marginBottom: 4 };

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN",
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT",
  "VT", "VA", "WA", "WV", "WI", "WY",
];

// Hidden from sighted users and unreachable by keyboard tab order - real
// visitors never touch this field. Simple bots that fill in every input
// often fill this one too, which is how we catch them (see /api/loads).
const honeypotStyle = { position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 };

export default function PostLoad() {
      const [form, setForm] = useState({
              pickup_city: "",
              pickup_state: "",
              delivery_city: "",
              delivery_state: "",
              pickup_date: "",
              equipment_type: "Dry Van",
              rate: "",
              commodity: "",
              weight_lbs: "",
              notes: "",
              shipper_name: "",
              shipper_email: "",
              website: "",
      });
      const [status, setStatus] = useState(null);

  function update(field, value) {
          setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
          e.preventDefault();
          setStatus("submitting");
          // Combine the separate city + state dropdown into one "City, ST"
          // string for the API - keeps the geocoder from ever having to
          // guess a state.
          const res = await fetch("/api/loads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                              ...form,
                              pickup_city: `${form.pickup_city.trim()}, ${form.pickup_state}`,
                              delivery_city: `${form.delivery_city.trim()}, ${form.delivery_state}`,
                    }),
          });
          setStatus(res.ok ? "success" : "error");
  }

  if (status === "success") {
          return (
                    <div>
                      <h1 style={{ color: "#166534" }}>✓ Load Posted</h1>
            <p style={{ color: "#4b5568" }}>Your load is live. Verified carriers can now see and claim it.</p>
        <p style={{ color: "#4b5568", marginTop: 12 }}>
          We just emailed you a private link to check its status, update the rate/notes, or cancel it later -
                        keep that email, since posting doesn't require an account.
              </p>
        <a href="/loads" style={{ color: "#1d4ed8" }}>View open loads →</a>
              </div>
    );
}

  return (
          <div>
            <h1 style={{ color: "#14181f" }}>Post a Load</h1>
      <p style={{ color: "#4b5568", marginBottom: 24 }}>
        Every carrier is pre-verified. Payment terms are clear upfront. No surprises.
            </p>
      <form onSubmit={handleSubmit}>
                    <label style={labelStyle}>Pickup City & State</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input style={{ ...inputStyle, marginBottom: 0, flex: 1 }} required value={form.pickup_city} placeholder="City"
            onChange={(e) => update("pickup_city", e.target.value)} />
          <select style={{ ...inputStyle, marginBottom: 0, width: 90 }} required value={form.pickup_state}
            onChange={(e) => update("pickup_state", e.target.value)}>
            <option value="">State</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

                      <label style={labelStyle}>Delivery City & State</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input style={{ ...inputStyle, marginBottom: 0, flex: 1 }} required value={form.delivery_city} placeholder="City"
            onChange={(e) => update("delivery_city", e.target.value)} />
          <select style={{ ...inputStyle, marginBottom: 0, width: 90 }} required value={form.delivery_state}
            onChange={(e) => update("delivery_state", e.target.value)}>
            <option value="">State</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

                      <label style={labelStyle}>Pickup Date</label>
        <input style={inputStyle} type="date" required value={form.pickup_date}
          onChange={(e) => update("pickup_date", e.target.value)} />

                      <label style={labelStyle}>Equipment Type</label>
        <select style={inputStyle} value={form.equipment_type}
          onChange={(e) => update("equipment_type", e.target.value)}>
                        <option>Dry Van</option>
          <option>Flatbed</option>
          <option>Reefer</option>
          <option>Tanker</option>
          <option>Step Deck</option>
          <option>Other</option>
              </select>

        <label style={labelStyle}>Weight (lbs)</label>
        <input style={inputStyle} type="number" value={form.weight_lbs}
          onChange={(e) => update("weight_lbs", e.target.value)} />

                      <label style={labelStyle}>Commodity</label>
        <input style={inputStyle} value={form.commodity}
          onChange={(e) => update("commodity", e.target.value)} />

                      <label style={labelStyle}>Your Rate Offer ($)</label>
        <input style={inputStyle} type="number" required value={form.rate}
          onChange={(e) => update("rate", e.target.value)} />

                      <label style={labelStyle}>Additional Notes</label>
        <textarea style={{ ...inputStyle, minHeight: 70 }} value={form.notes}
          onChange={(e) => update("notes", e.target.value)} />

                      <label style={labelStyle}>Your Name</label>
        <input style={inputStyle} required value={form.shipper_name}
          onChange={(e) => update("shipper_name", e.target.value)} />

                      <label style={labelStyle}>Your Email</label>
        <input style={inputStyle} type="email" required value={form.shipper_email}
          onChange={(e) => update("shipper_email", e.target.value)} />

                      <input type="text" name="website" value={form.website} tabIndex={-1} autoComplete="off"
          aria-hidden="true" style={honeypotStyle}
          onChange={(e) => update("website", e.target.value)} />

                      <button type="submit" disabled={status === "submitting"}
                        style={{
                          width: "100%", padding: "14px", background: "#1d4ed8", color: "#fff",
                          border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>
{status === "submitting" ? "Posting..." : "Submit Load"}
</button>
    </form>
    </div>
  );
}
