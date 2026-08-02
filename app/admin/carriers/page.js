"use client";
import { useEffect, useState } from "react";

const statusColor = {
    pending: "#92400e",
    verified: "#166534",
    pending_reverification: "#92400e",
    revoked: "#991b1b",
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
    async function requestReverification(id) {
          if (!confirm("Mark this carrier as needing re-verification? They'll need to submit fresh documents via their /reverify link before they can claim loads again.")) return;
          await fetch(`/api/admin/carriers/${id}/request-reverification`, { method: "POST" });
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
                  <p style={{ color: "#991b1b" }}>Not logged in.</p>
          <a href="/admin" style={{ color: "#1d4ed8" }}>Go to admin login &rarr;</a>
  </div>
    );
}
  if (!carriers) return <p style={{ color: "#4b5568" }}>Loading...</p>;

  return (
        <div>
          <h1 style={{ color: "#14181f" }}>Carrier Review</h1>
      <p style={{ color: "#4b5568", marginBottom: 8 }}>
        Approve carriers after checking their submitted CDL, insurance, and authority links.
          </p>
      <p style={{ color: "#4b5568", marginBottom: 20 }}>
        <a href="/admin/flags" style={{ color: "#1d4ed8" }}>View coverage flags &rarr;</a>
          </p>
{carriers.map((c) => (
          <div key={c.id} style={{
            background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
            padding: 16, marginBottom: 12,
}}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontWeight: 700, color: "#14181f", margin: 0 }}>{c.company_name}</p>
            <span style={{ fontSize: 12, color: statusColor[c.verified_status] || "#4b5568" }}>
{c.verified_status}
</span>
  </div>
          <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
{c.contact_email} &middot; DOT {c.dot_number || "-"} &middot; MC {c.mc_number || "-"}
</p>
          <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
            Carrier ID: <code style={{ color: "#1d4ed8" }}>{c.id}</code>
              </p>
          <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
            Secret: <code style={{ color: "#1d4ed8" }}>{c.carrier_secret}</code>
{" "}<span style={{ color: "#6b7280" }}>(only needed if they signed up before this was added - send it to them once, privately)</span>
  </p>
          <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
            Reverify link: <code style={{ color: "#1d4ed8" }}>https://midnightloadboard.com/reverify/{c.id}</code>
            {" "}<span style={{ color: "#6b7280" }}>(send this if they need to resubmit documents - they'll still need their secret)</span>
              </p>

          <p style={{ fontSize: 12, margin: "0 0 4px" }}>
{c.cdl_link && <a href={c.cdl_link} target="_blank" style={{ color: "#1d4ed8", marginRight: 12 }}>CDL</a>}
{c.insurance_link && <a href={c.insurance_link} target="_blank" style={{ color: "#1d4ed8", marginRight: 12 }}>Insurance</a>}
{c.authority_link && <a href={c.authority_link} target="_blank" style={{ color: "#1d4ed8" }}>Authority</a>}
  </p>
          <p style={{ fontSize: 12, color: c.open_flag_count > 0 ? "#991b1b" : "#4b5568", margin: "0 0 10px" }}>
            Lifetime flags: {c.lifetime_flag_count} &middot; Open flags: {c.open_flag_count}
</p>
          <div style={{ display: "flex", gap: 8 }}>
{c.verified_status !== "verified" && (
                <button onClick={() => approve(c.id)} style={{
                  background: "#166534", color: "#fff", border: "none", borderRadius: 6,
                  padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
}}>Approve</button>
            )}
{c.verified_status !== "revoked" && (
                <button onClick={() => revoke(c.id)} style={{
                  background: "transparent", color: "#991b1b", border: "1px solid #991b1b",
                  borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
}}>Revoke</button>
            )}
{c.verified_status === "verified" && (
                <button onClick={() => requestReverification(c.id)} style={{
                  background: "transparent", color: "#92400e", border: "1px solid #92400e",
                  borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
}}>Request Re-verification</button>
            )}
{c.dot_number && (
                <button onClick={() => checkFmcsa(c.id)} disabled={fmcsa[c.id]?.loading} style={{
                  background: "transparent", color: "#1d4ed8", border: "1px solid #1d4ed8",
                  borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
}}>
{fmcsa[c.id]?.loading ? "Checking FMCSA..." : "Check FMCSA"}
</button>
            )}
</div>

{fmcsa[c.id]?.error && (
              <p style={{ color: "#991b1b", fontSize: 12, marginTop: 10 }}>{fmcsa[c.id].error}</p>
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
          marginTop: 12, background: "#ffffff", border: "1px solid #e2e5ea",
          borderRadius: 8, padding: 12,
  }}>
      <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.5 }}>
        FMCSA live snapshot - DOT {snapshot.dotNumber}
</p>
      <p style={{ fontSize: 12, margin: "0 0 4px", color: snapshot.allowToOperate ? "#166534" : "#991b1b" }}>
{snapshot.allowToOperate ? "Allowed to operate" : "NOT allowed to operate"}
{snapshot.outOfService && " - OUT OF SERVICE" + (snapshot.outOfServiceDate ? ` (${snapshot.outOfServiceDate})` : "")}
</p>
      <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
        Legal name on file: {snapshot.legalName || "-"}{snapshot.dbaName ? ` (DBA ${snapshot.dbaName})` : ""}
</p>
{nameMismatch && (
          <p style={{ fontSize: 12, color: "#92400e", margin: "0 0 4px" }}>
          Submitted name doesn't obviously match the FMCSA legal name - worth a second look.
            </p>
      )}
      <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
        Complaints on file: {snapshot.complaintCount}
</p>
{snapshot.authorities?.length > 0 && (
          <p style={{ fontSize: 12, color: "#4b5568", margin: "0 0 4px" }}>
          Authority: {snapshot.authorities.map((a, i) => `${a.type || "-"}: ${a.status || "-"}`).join(" | ")}
</p>
      )}
      <p style={{ fontSize: 11, color: "#6b7280", margin: "8px 0 0" }}>
        Checked {new Date(snapshot.checkedAt).toLocaleString()} - this is a live cross-check, not a
        replacement for reading the submitted insurance/authority documents.
          </p>
          </div>
  );
}
