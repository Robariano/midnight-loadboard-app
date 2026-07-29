import { getServiceClient } from "../../lib/supabase";

export const metadata = {
  title: "Revoked Credentials — Midnight Loadboard",
};

// Public trust page. Anyone can look up whether a carrier's verified
// status has been revoked on Midnight Loadboard — no login required.
// Deliberately shows only public-safe fields: company name, DOT/MC
// numbers, and revoked status. No contact info, no documents, no
// internal flag counts.
export const revalidate = 60; // re-check every minute rather than on every request

async function getRevokedCarriers() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("carriers")
    .select("id, company_name, dot_number, mc_number, verified_date")
    .eq("verified_status", "revoked")
    .order("verified_date", { ascending: false });

  if (error) {
    console.error("Failed to load revoked carriers:", error.message);
    return [];
  }
  return data || [];
}

export default async function RevokedCarriers() {
  const carriers = await getRevokedCarriers();

  return (
    <div>
      <h1 style={{ color: "#fff" }}>Revoked Credentials</h1>
      <p style={{ color: "#888", lineHeight: 1.6 }}>
        Midnight Loadboard revokes a carrier's verified status if their authority, insurance, or
        safety standing no longer checks out, or if they've been flagged for repeatedly assigning
        loads to drivers who weren't actually covered. This page is public so any shipper or
        carrier can double-check a company's standing before doing business with them.
      </p>
      <p style={{ color: "#888", lineHeight: 1.6, marginBottom: 24 }}>
        A revoked carrier can reapply for verification at any time by correcting the issue that
        led to revocation. This list only reflects verification status on Midnight Loadboard — it
        is not a substitute for checking a carrier's FMCSA record directly.
      </p>

      {carriers.length === 0 ? (
        <div
          style={{
            background: "#12121e",
            border: "1px solid #2a2a3e",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
          }}
        >
          <p style={{ color: "#4caf50", fontWeight: 700, margin: 0 }}>
            No carriers currently have a revoked credential.
          </p>
        </div>
      ) : (
        <div>
          {carriers.map((c) => (
            <div
              key={c.id}
              style={{
                background: "#12121e",
                border: "1px solid #2a2a3e",
                borderLeft: "3px solid #ff6b6b",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontWeight: 700, color: "#fff", margin: 0 }}>{c.company_name}</p>
                <span style={{ fontSize: 12, color: "#ff6b6b", fontWeight: 700 }}>REVOKED</span>
              </div>
              <p style={{ fontSize: 12, color: "#888", margin: "6px 0 0" }}>
                DOT {c.dot_number || "—"} · MC {c.mc_number || "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      <p style={{ color: "#666", fontSize: 12, marginTop: 24 }}>
        Believe a listing here is a mistake? Contact{" "}
        <a href="mailto:robertariano@gmail.com" style={{ color: "#5c5cff" }}>
          robertariano@gmail.com
        </a>.
      </p>
    </div>
  );
}
