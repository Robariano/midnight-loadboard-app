import { getServiceClient } from "../../../lib/supabase";

// Private, single-recipient view of a carrier's verification status and
// documents - reached only via an unguessable link the carrier generated
// themselves (see /my-documents). Never indexed, never listed publicly.
// Every load here counts as a "view" and is logged back to the carrier.
export const dynamic = "force-dynamic";

const statusBadge = {
  verified: { bg: "#e9f7ef", color: "#166534", label: "Documents Reviewed" },
  pending: { bg: "#fef3e2", color: "#92400e", label: "Verification pending" },
  pending_reverification: { bg: "#fef3e2", color: "#92400e", label: "Re-verification pending" },
  revoked: { bg: "#fdecec", color: "#991b1b", label: "Revoked" },
};

async function getShare(token) {
  const supabase = getServiceClient();
  const { data: share, error } = await supabase
    .from("document_shares")
    .select("id, carrier_id, recipient_label, document_ids, expires_at, revoked_at")
    .eq("share_token", token)
    .single();
  if (error || !share) return { share: null, reason: "not_found" };
  if (share.revoked_at) return { share: null, reason: "revoked" };
  if (new Date(share.expires_at) < new Date()) return { share: null, reason: "expired" };
  return { share, reason: null };
}

async function logView(shareId) {
  const supabase = getServiceClient();
  // Read-then-write (no atomic increment in supabase-js) - fine at this volume.
  const { data } = await supabase.from("document_shares").select("view_count").eq("id", shareId).single();
  await supabase
    .from("document_shares")
    .update({ view_count: (data?.view_count || 0) + 1, last_viewed_at: new Date().toISOString() })
    .eq("id", shareId);
}

async function getCarrier(carrierId) {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("carriers")
    .select("company_name, dot_number, mc_number, verified_status, verified_date")
    .eq("id", carrierId)
    .single();
  return data;
}

async function getDocuments(carrierId, documentIds) {
  const supabase = getServiceClient();
  let query = supabase
    .from("driver_documents")
    .select("id, document_type, file_url, original_filename, notes, submitted_at")
    .eq("carrier_id", carrierId)
    .order("submitted_at", { ascending: false });
  if (documentIds) query = query.in("id", documentIds);
  const { data } = await query;
  return data || [];
}

function NoticeCard({ children }) {
  return (
    <div style={{
      background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 10,
      padding: 20, color: "#4b5568", fontSize: 14,
    }}>
      {children}
    </div>
  );
}

export default async function SharedDocuments({ params }) {
  const { share, reason } = await getShare(params.token);

  if (!share) {
    const message = {
      expired: "This link has expired. Ask the carrier for a new one.",
      revoked: "This link has been turned off by the carrier who shared it.",
      not_found: "This link isn't valid.",
    }[reason] || "This link isn't valid.";
    return <NoticeCard>{message}</NoticeCard>;
  }

  await logView(share.id);

  const carrier = await getCarrier(share.carrier_id);
  if (!carrier) return <NoticeCard>Carrier not found.</NoticeCard>;

  const documents = await getDocuments(share.carrier_id, share.document_ids);
  const badge = statusBadge[carrier.verified_status] || statusBadge.pending;

  return (
    <div>
      <p style={{ color: "#8a92a0", fontSize: 12, marginBottom: 20 }}>
        Shared privately with <strong>{share.recipient_label}</strong> — this page is not public
        and every view is logged back to the carrier.
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <h1 style={{ color: "#14181f", margin: 0 }}>{carrier.company_name}</h1>
        <span style={{
          fontSize: 12, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
          background: badge.bg, color: badge.color, whiteSpace: "nowrap",
        }}>
          {badge.label}
        </span>
      </div>
      <p style={{ color: "#4b5568", fontSize: 13, marginBottom: 24 }}>
        DOT {carrier.dot_number || "—"} · MC {carrier.mc_number || "—"}
      </p>

      <h2 style={{ color: "#14181f", fontSize: 16, marginBottom: 12 }}>Documents</h2>
      {documents.length === 0 && <p style={{ color: "#4b5568", fontSize: 14 }}>No documents to show.</p>}
      {documents.map((d) => (
        <a
          key={d.id}
          href={d.file_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block", background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 10,
            padding: 14, marginBottom: 10, textDecoration: "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#14181f", fontWeight: 700, fontSize: 14 }}>{d.document_type}</span>
            <span style={{ color: "#6b7280", fontSize: 12 }}>
              {new Date(d.submitted_at).toLocaleDateString()}
            </span>
          </div>
          {d.notes && <p style={{ color: "#4b5568", fontSize: 13, margin: "4px 0 0" }}>{d.notes}</p>}
          <p style={{ color: "#1d4ed8", fontSize: 12, margin: "6px 0 0", fontWeight: 700 }}>
            View / download &rarr;
          </p>
        </a>
      ))}
    </div>
  );
}
