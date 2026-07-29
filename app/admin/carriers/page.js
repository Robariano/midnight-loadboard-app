"use client";
import { useEffect, useState } from "react";

const statusColor = {
  pending: "#e0a94c",
  verified: "#4caf50",
  pending_reverification: "#e0a94c",
  revoked: "#ff6b6b",
};

export default function AdminCarriers() {
  const [carriers, setCarriers] = useState(null);
  const [error, setError] = useState(null);
  const [fmcsa, setFmcsa] = useState({}); // { [carrierId]: { loading, snapshot, error } }

  function load() {
    fetch("/api/admin/carriers")
      .then((r) => {
        if (r.status === 401) throw new Error("unauthorized");
        return r.json();
      })
      .then((d) => setCarriers(d.carriers))
      .catch(() => setError("unauthorized"));
  }

  useEffect(load, []);

  async function approve(id) {
    await fetch(`/api/admin/carriers/${id}/approve`, { method: "POST" });
    load();
  }
  async function revoke(id) {
    if (!confirm("Revoke this carrier's credential? This is public-facing on the Revoked Credentials page.")) return;
    await fetch(`/api/admin/carriers/${id}/revoke`, { method: "POST" });
    load();
  }

  async function checkFmcsa(id) {
    setFmcsa((f) => ({ ...f, [id]: { loading: true } }));
    const res = await fetch(`/api/admin/carriers/${id}/fmcsa`);
    const data = await res.json();
    if (res.ok) {
      setFmcsa((f) => ({ ...f, [id]: { snapshot: data.snapshot } }));
    } else {
      setFmcsa((f) => ({ ...f, [id]: { error: data.error || "Lookup failed." } }));
    }
  }

  if (error === "unauthorized") {
    return (
      <div>
        <p style={{ color: "#ff6b6b" }}>Not logged in.</p>
        <a href="/admin" style={{ color: "#5c5cff" }}>Go to admin login →</a>
      </div>
    );
  }
  if (!carriers) return <p style={{ color: "#888" }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ color: "#fff" }}>Carrier Review</h1>
      <p style={{ color: "#888", marginBottom: 8 }}>
        Approve carriers after checking their submitted CDL, insurance, and authority links.
      </p>
      <p style={{ color: "#888", marginBottom: 20 }}>
        <a href="/admin/flags" style={{ color: "#5c5cff" }}>View coverage flags →</a>
      </p>
      {carriers.map((c) => (
        <div key={c.id} style={{
          background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 12,
          padding: 16, marginBottom: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontWeight: 700, color: "#fff", margin: 0 }}>{c.company_name}</p>
            <span style={{ fontSize: 12, color: statusColor[c.verified_status] || "#888" }}>
              {c.verified_status}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>
            {c.contact_email} · DOT {c.dot_number || "—"} · MC {c.mc_number || "—"}
          </p>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>
            Carrier ID: <code style={{ color: "#5c5cff" }}>{c.id}</code>
          </p>
          <p style={{ fontSize: 12, margin: "0 0 4px" }}>
            {c.cdl_link && <a href={c.cdl_link} target="_blank" style={{ color: "#5c5cff", marginRight: 12 }}>CDL</a>}
            {c.insurance_link && <a href={c.insurance_link} target="_blank" style={{ color: "#5c5cff", marginRight: 12 }}>Insurance</a>}
            {c.authority_link && <a href={c.authority_link} target="_blank" style={{ color: "#5c5cff" }}>Authority</a>}
          </p>
          <p style={{ fontSize: 12, color: c.open_flag_count > 0 ? "#ff6b6b" : "#888", margin: "0 0 10px" }}>
            Lifetime flags: {c.lifetime_flag_count} · Open flags: {c.open_flag_count}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {c.verified_status !== "verified" && (
              <button onClick={() => approve(c.id)} style={{
                background: "#4caf50", color: "#fff", border: "none", borderRadius: 6,
                padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Approve</button>
            )}
            {c.verified_status !== "revoked" && (
              <button onClick={() => revoke(c.id)} style={{
                background: "transparent", color: "#ff6b6b", border: "1px solid #ff6b6b",
                borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>Revoke</button>
            )}
            {c.dot_number && (
              <button onClick={() => checkFmcsa(c.id)} disabled={fmcsa[c.id]?.loading} style={{
                background: "transparent", color: "#5c5cff", border: "1px solid #5c5cff",
                borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>
                {fmcsa[c.id]?.loading ? "Checking FMCSA..." : "Check FMCSA"}
              </button>
            )}
          </div>

          {fmcsa[c.id]?.error && (
            <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 10 }}>{fmcsa[c.id].error}</p>
          )}

          {fmcsa[c.id]?.snapshot && (
            <FmcsaSnapshot snapshot={fmcsa[c.id].snapshot} submittedName={c.company_name} />
          )}
        </div>
      ))}
    </div>
  );
}

function FmcsaSnapshot({ snapshot, submittedName }) {
  const nameMismatch =
    submittedName &&
    snapshot.legalName &&
    !submittedName.toLowerCase().includes(snapshot.legalName.toLowerCase().split(" ")[0]) &&
    !snapshot.legalName.toLowerCase().includes(submittedName.toLowerCase().split(" ")[0]);

  return (
    <div style={{
      marginTop: 12, background: "#0a0a12", border: "1px solid #2a2a3e",
      borderRadius: 8, padding: 12,
    }}>
      <p style={{ fontSize: 11, color: "#666", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>
        FMCSA live snapshot — DOT {snapshot.dotNumber}
      </p>
      <p style={{ fontSize: 12, margin: "0 0 4px", color: snapshot.allowToOperate ? "#4caf50" : "#ff6b6b" }}>
        {snapshot.allowToOperate ? "✓ Allowed to operate" : "✗ NOT allowed to operate"}
        {snapshot.outOfService && " · OUT OF SERVICE" + (snapshot.outOfServiceDate ? ` (${snapshot.outOfServiceDate})` : "")}
      </p>
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>
        Legal name on file: {snapshot.legalName || "—"}{snapshot.dbaName ? ` (DBA ${snapshot.dbaName})` : ""}
      </p>
      {nameMismatch && (
        <p style={{ fontSize: 12, color: "#e0a94c", margin: "0 0 4px" }}>
          ⚠ Submitted name doesn't obviously match the FMCSA legal name — worth a second look.
        </p>
      )}
      <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>
        Complaints on file: {snapshot.complaintCount}
      </p>
      {snapshot.authorities?.length > 0 && (
        <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>
          Authority: {snapshot.authorities.map((a, i) => `${a.type || "—"}: ${a.status || "—"}`).join(" · ")}
        </p>
      )}
      <p style={{ fontSize: 11, color: "#666", margin: "8px 0 0" }}>
        Checked {new Date(snapshot.checkedAt).toLocaleString()} · this is a live cross-check, not a
        replacement for reading the submitted insurance/authority documents.
      </p>
    </div>
  );
}
