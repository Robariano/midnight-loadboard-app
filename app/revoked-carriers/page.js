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
      <h1 style={{ color: "#14181f" }}>Revoked Credentials</h1>
      <p style={{ color: "#4b5568", lineHeight: 1.6 }}>
        Midnight Loadboard revokes a carrier's verified status if their authority, insurance, or
        safety standing no longer checks out, or if they've been flagged for repeatedly assigning
        loads to drivers who weren't actually covered. This page is public so any shipper or
        carrier can double-check a company's standing before doing business with them.
      </p>
      <p style={{ color: "#4b5568", lineHeight: 1.6, marginBottom: 24 }}>
        A revoked carrier can reapply for verification at any time by correcting the issue that
        led to revocation. This list only reflects verification status on Midnight Loadboard — it
        is not a substitute for checking a carrier's FMCSA record directly.
      </p>

      {carriers.length === 0 ? (
        <div
          style={{
            background: "#f7f8fa",
            border: "1px solid #e2e5ea",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
          }}
        >
          <p style={{ color: "#166534", fontWeight: 700, margin: 0 }}>
            No carriers currently have a revoked credential.
          </p>
        </div>
      ) : (
        <div>
          {carriers.map((c) => (
            <div
              key={c.id}
              style={{
                background: "#f7f8fa",
                border: "1px solid #e2e5ea",
                borderLeft: "3px solid #991b1b",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontWeight: 700, color: "#14181f", margin: 0 }}>{c.company_name}</p>
                <span style={{ fontSize: 12, color: "#991b1b", fontWeight: 700 }}>REVOKED</span>
              </div>
              <p style={{ fontSize: 12, color: "#4b5568", margin: "6px 0 0" }}>
                DOT {c.dot_number || "—"} · MC {c.mc_number || "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      <p style={{ color: "#6b7280", fontSize: 12, marginTop: 24 }}>
        Believe a listing here is a mistake? Contact{" "}
        <a href="mailto:disputes@midnightloadboard.com" style={{ color: "#1d4ed8" }}>
          disputes@midnightloadboard.com
        </a>.
      </p>
    </div>
  );
}
