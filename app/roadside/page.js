"use client";
import { useState, useEffect } from "react";

const inputStyle = {
    padding: "10px 12px",
    background: "#f7f8fa",
    border: "1px solid #e2e5ea",
    borderRadius: 6,
    color: "#14181f",
    fontSize: 14,
};

export default function Roadside() {
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [listings, setListings] = useState(null);
    const [loading, setLoading] = useState(false);

  async function search(e) {
        if (e) e.preventDefault();
        setLoading(true);
        const params = new URLSearchParams();
        if (city) params.set("city", city);
        if (state) params.set("state", state);
        const res = await fetch(`/api/roadside?${params.toString()}`);
        const data = await res.json().catch(() => ({}));
        setListings(data.listings || []);
        setLoading(false);
  }

  useEffect(() => {
        search();
        // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
        <div>
          <h1 style={{ color: "#14181f" }}>Roadside &amp; Repair</h1>
      <p style={{ color: "#4b5568", marginBottom: 20 }}>
        Find real repair and towing help near you — free, no account needed.
      </p>

      <div style={{
        display: "flex", gap: 10, alignItems: "flex-start", background: "#fef3e2",
        border: "1px solid #f5d999", borderRadius: 10, padding: "12px 16px", marginBottom: 24,
      }}>
        <span style={{ fontSize: 18 }}>ⓘ</span>
        <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.5 }}>
          Without roadside coverage, you're on your own for the tow bill — and stranded if you don't
          have the cash on hand. Note: after a wreck, insurance-arranged tows are simple, but some
          independent tow operators won't move a wrecked vehicle without a police report. Having
          accident coverage doesn't mean you have roadside assistance too — ask your insurance
          company directly, before you need it.
        </p>
      </div>

      <form onSubmit={search} style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={city} onChange={(e) => setCity(e.target.value)}
          placeholder="City" style={{ ...inputStyle, width: 160 }} />
        <input value={state} onChange={(e) => setState(e.target.value)}
          placeholder="State" style={{ ...inputStyle, width: 100 }} />
        <button type="submit" style={{
          background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 6,
          padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          Search
        </button>
      </form>

      {loading && <p style={{ color: "#4b5568" }}>Loading...</p>}

      {!loading && listings && listings.length === 0 && (
        <div style={{
          background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 10,
          padding: 20, textAlign: "center",
        }}>
          <p style={{ color: "#4b5568", margin: 0, fontSize: 14 }}>
            No listings here yet. This directory is brand new and growing — check back soon.
          </p>
        </div>
      )}

      {!loading && listings && listings.map((l) => (
        <div key={l.id} style={{
          background: "#f7f8fa", border: l.featured ? "2px solid #1d4ed8" : "1px solid #e2e5ea",
          borderRadius: 10, padding: "14px 18px", marginBottom: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              {l.founder_owned && (
                <span style={{
                  fontSize: 11, background: "#eef2ff", color: "#1d4ed8", padding: "2px 8px",
                  borderRadius: 20, fontWeight: 700, marginBottom: 6, display: "inline-block",
                }}>
                  Founder-owned
                </span>
              )}
              <p style={{ fontWeight: 700, fontSize: 15, margin: "4px 0 2px", color: "#14181f" }}>
                {l.business_name}
              </p>
              <p style={{ fontSize: 13, color: "#4b5568", margin: 0 }}>
                {l.service_type} · {l.city}, {l.state}
              </p>
              {l.notes && <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{l.notes}</p>}
            </div>
            {l.phone && (
              <a href={`tel:${l.phone}`} style={{
                color: "#1d4ed8", fontSize: 13, fontWeight: 700, textDecoration: "none",
              }}>
                {l.phone}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
