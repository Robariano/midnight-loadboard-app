import Link from "next/link";
import { getServiceClient } from "../../lib/supabase";

// Public directory of verified carriers. Deliberately public-safe, same
// stance as the individual profile page: no contact info, no document
// links, no internal flag counts - just enough to let a shipper browse
// and click through to a carrier's full profile.
export const revalidate = 30;

async function getVerifiedCarriers() {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("carriers")
    .select("id, company_name, dot_number, mc_number, verified_date")
    .eq("verified_status", "verified")
    .order("company_name", { ascending: true });
  if (error) return [];
  return data;
}

export default async function CarriersDirectory() {
  const carriers = await getVerifiedCarriers();

  return (
    <div>
      <h1 style={{ color: "#fff", marginBottom: 4 }}>Verified carriers</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
        Every carrier below has been reviewed and approved. Click one to see their verification
        details and shipper ratings.
      </p>

      {carriers.length === 0 ? (
        <div style={{
          background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 12,
          padding: 24, textAlign: "center",
        }}>
          <p style={{ color: "#888", margin: 0, fontSize: 14 }}>
            No verified carriers yet.{" "}
            <Link href="/get-verified" style={{ color: "#5c5cff" }}>Get verified</Link> to be the first.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {carriers.map((c) => (
            <Link
              key={c.id}
              href={`/carriers/${c.id}`}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 10,
                padding: "14px 18px", textDecoration: "none",
              }}
            >
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: "0 0 4px" }}>
                  {c.company_name}
                </p>
                <p style={{ color: "#888", fontSize: 12.5, margin: 0 }}>
                  DOT {c.dot_number || "—"} · MC {c.mc_number || "—"}
                </p>
              </div>
              <span style={{
                fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
                background: "#1a3a1a", color: "#4caf50", whiteSpace: "nowrap",
              }}>
                Verified
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
