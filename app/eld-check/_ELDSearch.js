"use client";
import { useMemo, useState } from "react";

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export default function ELDSearch({ devices, listUrl }) {
  const [q, setQ] = useState("");
  const query = norm(q);
  const matches = useMemo(() => {
    if (query.length < 2) return [];
    return devices
      .filter((d) => norm(d.name).includes(query) || norm(d.company).includes(query) || norm(d.eldId) === query || norm(d.model) === query)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [devices, query]);

  return (
    <div>
      <label htmlFor="eld-q" style={{ display: "block", fontWeight: 700, color: "#14181f", marginBottom: 6 }}>
        ELD brand, company or 6-character ELD ID
      </label>
      <input id="eld-q" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
        placeholder="e.g. 24HOS, Blue Link, or 024HOS"
        style={{ width: "100%", padding: "12px 14px", fontSize: 16, border: "1px solid #cbd2da", borderRadius: 8, marginBottom: 14 }} />

      {query.length >= 2 && matches.length === 0 && (
        <div style={{ background: "#ecfdf3", border: "1px solid #a7f3d0", borderRadius: 10, padding: "14px 16px" }}>
          <p style={{ color: "#166534", fontWeight: 700, margin: "0 0 4px" }}>Not on FMCSA&apos;s revoked list</p>
          <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Nothing matching &quot;{q}&quot; has been revoked. Names vary, so also try the ELD ID shown in your app&apos;s
            settings, and confirm your exact model is on FMCSA&apos;s{" "}
            <a href={listUrl} style={{ color: "#1d4ed8" }}>registered device list</a>.
          </p>
        </div>
      )}

      {matches.length > 0 && (
        <div>
          <p style={{ color: "#991b1b", fontWeight: 700, margin: "0 0 10px" }}>
            {matches.length} revoked device{matches.length === 1 ? "" : "s"} match &quot;{q}&quot;
          </p>
          {matches.slice(0, 25).map((d, i) => (
            <div key={`${d.eldId}-${d.model}-${i}`} style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
              <p style={{ color: "#14181f", fontWeight: 700, margin: "0 0 4px" }}>{d.name}</p>
              <p style={{ color: "#4b5568", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {d.company} · Model {d.model} · ELD ID {d.eldId}
                <br />
                <b style={{ color: "#991b1b" }}>{d.status === "Revoked" ? "Revoked by FMCSA" : "Withdrawn by its maker"}</b>
                {d.date ? ` on ${d.date}` : ""}
              </p>
            </div>
          ))}
          {matches.length > 25 && (
            <p style={{ color: "#6b7280", fontSize: 13 }}>Showing 25 of {matches.length}. Type more of the name to narrow it down.</p>
          )}
        </div>
      )}
    </div>
  );
}
