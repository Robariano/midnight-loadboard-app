import { getServiceClient } from "../../../lib/supabase";

// Public carrier profile — shows verification standing and shipper ratings.
// Deliberately public-safe: no contact info, no document links, no internal
// flag counts (same privacy stance as app/revoked-carriers/page.js).
export const revalidate = 30;

async function getCarrier(id) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("carriers")
    .select("id, company_name, dot_number, mc_number, verified_status, verified_date")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data;
}

async function getRatings(id) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("carrier_ratings")
    .select("id, rating, comment, rater_name, created_at")
    .eq("carrier_id", id)
    .order("created_at", { ascending: false });
  if (error) return { ratings: [], average: null, count: 0 };
  const count = data.length;
  const average = count ? data.reduce((sum, r) => sum + r.rating, 0) / count : null;
  return { ratings: data, average, count };
}

const statusBadge = {
  verified: { bg: "#1a3a1a", color: "#4caf50", label: "Verified" },
  pending: { bg: "#3a331a", color: "#e0a94c", label: "Verification pending" },
  pending_reverification: { bg: "#3a331a", color: "#e0a94c", label: "Re-verification pending" },
  revoked: { bg: "#3a1a1a", color: "#ff6b6b", label: "Revoked" },
};

function Stars({ value }) {
  const rounded = Math.round(value);
  return (
    <span style={{ color: "#e0a94c", fontSize: 16, letterSpacing: 1 }}>
      {"★".repeat(rounded)}
      <span style={{ color: "#2a2a3e" }}>{"★".repeat(5 - rounded)}</span>
    </span>
  );
}

export default async function CarrierProfile({ params }) {
  const carrier = await getCarrier(params.id);

  if (!carrier) {
    return <p style={{ color: "#ff6b6b" }}>Carrier not found.</p>;
  }

  const { ratings, average, count } = await getRatings(params.id);
  const badge = statusBadge[carrier.verified_status] || statusBadge.pending;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <h1 style={{ color: "#fff", margin: 0 }}>{carrier.company_name}</h1>
        <span style={{
          fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
          background: badge.bg, color: badge.color, whiteSpace: "nowrap",
        }}>
          {badge.label}
        </span>
      </div>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 24 }}>
        DOT {carrier.dot_number || "—"} · MC {carrier.mc_number || "—"}
      </p>

      <div style={{
        background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 12,
        padding: 20, marginBottom: 24,
      }}>
        {count === 0 ? (
          <p style={{ color: "#888", margin: 0, fontSize: 14 }}>No ratings yet.</p>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Stars value={average} />
            <p style={{ color: "#fff", fontWeight: 700, margin: 0, fontSize: 15 }}>
              {average.toFixed(1)} / 5
            </p>
            <p style={{ color: "#888", margin: 0, fontSize: 13 }}>
              ({count} {count === 1 ? "rating" : "ratings"})
            </p>
          </div>
        )}
      </div>

      {ratings.length > 0 && (
        <div>
          <h2 style={{ color: "#fff", fontSize: 16, marginBottom: 12 }}>Shipper reviews</h2>
          {ratings.map((r) => (
            <div key={r.id} style={{
              background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 10,
              padding: 14, marginBottom: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <Stars value={r.rating} />
                <span style={{ color: "#666", fontSize: 12 }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.comment && (
                <p style={{ color: "#e0e0e0", fontSize: 13, margin: "0 0 4px", lineHeight: 1.6 }}>
                  {r.comment}
                </p>
              )}
              {r.rater_name && (
                <p style={{ color: "#666", fontSize: 12, margin: 0 }}>— {r.rater_name}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
