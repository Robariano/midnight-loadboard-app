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
        Find real repair and towing help near you — free, no account needed. A breakdown
        doesn't just cost you a tow bill, it costs you a delivery — getting back on the road
        fast protects the reliability every broker and shipper is counting on.
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

      <div style={{
        background: "#eef6f0", border: "1px solid #c6e3cf", borderRadius: 10,
        padding: "12px 16px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#14532d", margin: "0 0 4px" }}>
          Before you call a tow
        </p>
        <p style={{ fontSize: 13, color: "#14532d", margin: 0, lineHeight: 1.5 }}>
          If it won&apos;t start but the dash lights are dim, or you only hear a click, it may be the
          battery. A portable jump starter (about $60 to $100) can get you going, but a battery
          that&apos;s too far gone won&apos;t take a jump and has to be replaced. On many newer vehicles the
          battery is hard to reach, so if you don&apos;t have the right tools, a tow to a professional is
          often the smarter call.
        </p>
      </div>

      <div style={{
        background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 10,
        padding: "12px 16px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1e3a8a", margin: "0 0 4px" }}>
          If your semi has to be towed
        </p>
        <p style={{ fontSize: 13, color: "#1e3a8a", margin: 0, lineHeight: 1.5 }}>
          When a big rig is towed with its drive wheels on the ground, the wrecker operator should
          disconnect the driveshaft (or pull the axle shafts) first. Left connected, the wheels spin
          the transmission with the engine off and no lubrication moving, and that can ruin it. After
          a rollover, they&apos;ll do the same before winching it out, since oil may have drained and the
          driveline may be damaged. It&apos;s fair to ask, &quot;Are you pulling the driveshaft?&quot; A good
          operator won&apos;t mind. Flooded roads, washouts and bad weather like southwest Colorado has
          seen this fall make these tows more common, so know your coverage and keep a tow number
          handy before you need it.
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

      <div style={{
        borderLeft: "4px solid #f5a623", background: "#f7f8fa", borderRadius: "0 10px 10px 0",
        padding: "16px 20px", marginTop: 32,
      }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", margin: "0 0 4px", letterSpacing: 1 }}>
          WHY THIS PAGE EXISTS
        </p>
        <p style={{ fontSize: 14, color: "#14181f", margin: "0 0 10px", lineHeight: 1.6 }}>
          When I moved back to Durango from Aztec, I spent a night in my Jeep waiting for my apartment
          to be ready. The next morning it wouldn&apos;t start. A jump didn&apos;t work, and I didn&apos;t know the
          battery was done and needed replacing. I had no tools to take it out, so I called a tow truck.
          My insurance didn&apos;t include towing, so the whole bill came out of my pocket.
        </p>
        <p style={{ fontSize: 14, color: "#14181f", margin: "0 0 10px", lineHeight: 1.6 }}>
          Years before that, my 2005 Ford Explorer taught me the other side of repairs. The transmission
          went out after an extended-warranty
          inspection at a shop in town, and a mechanic I trusted believed it had been put back
          together wrong. We put in a new transmission. It took every dollar I had saved, but he did
          the job right.
        </p>
        <p style={{ fontSize: 14, color: "#14181f", margin: "0 0 10px", lineHeight: 1.6 }}>
          A couple of months later, the same mechanic tried to fix an engine rattle and got it wrong,
          so I did the job myself. I had every part on the bench except one: the thin spacer plate that
          sits between the engine and the transmission. When I mated the engine back to the
          transmission, that plate slipped off the dowel pins, and the job wasn&apos;t right. One small
          missing part undid all that work.
        </p>
        <p style={{ fontSize: 14, color: "#14181f", margin: 0, lineHeight: 1.6 }}>
          What I learned: know what your insurance covers before you need it, carry basic tools,
          keep some cash set aside for repairs, and find a mechanic you trust before you break down.
          On any job, have every part in hand before you start. Dispatch is the same: I check the
          broker, the rate con, the pickup numbers and your hours before your truck rolls, because one
          missed detail can cost you the whole load. That&apos;s why this page lists real shops that
          answer the phone. – Rob, founder
        </p>
      </div>
    </div>
  );
}
