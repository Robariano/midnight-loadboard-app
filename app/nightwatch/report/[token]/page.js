import { getServiceClient } from "../../../../lib/supabase";
import { snapshotRows, overallOk, driverStatus, saferUrl } from "../../_snapshotRows";
import PrintButton from "./_PrintButton";

// Saved Nightwatch Lite report: the FMCSA snapshot exactly as it was at
// check time, plus the driver's coverage confirmation status (read live, so
// the report updates once the driver answers). Reached only by its
// unguessable link; never indexed or listed.
export const dynamic = "force-dynamic";
export const metadata = { title: "Nightwatch Report | Nightlane", robots: { index: false, follow: false } };

const card = { background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12, padding: "16px 20px", marginBottom: 16 };
const row = { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, padding: "6px 0", borderBottom: "1px solid #e2e5ea" };

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-US", {
    timeZone: "America/Denver", month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });
}

async function getReport(token) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const supabase = getServiceClient();
  const { data: check } = await supabase.from("nightwatch_checks").select("*").eq("report_token", token).maybeSingle();
  if (!check) return null;
  let attestation = null;
  if (check.attestation_id) {
    const { data } = await supabase
      .from("coverage_attestations").select("response, submitted_at, created_at").eq("id", check.attestation_id).maybeSingle();
    attestation = data;
  }
  return { check, attestation };
}

export default async function NightwatchReport({ params }) {
  const report = await getReport(params.token);
  if (!report) {
    return (
      <div>
        <h1 style={{ color: "#14181f" }}>Report not found</h1>
        <p style={{ color: "#4b5568", fontSize: 14 }}>This report link is invalid. Check that you copied the whole link.</p>
      </div>
    );
  }
  const { check, attestation } = report;
  const s = check.carrier_snapshot || {};
  const ok = overallOk(s);
  const ds = check.attestation_id ? driverStatus(attestation?.response) : null;

  return (
    <div style={{ maxWidth: 680 }}>
      <style>{`@media print { .nw-noprint, header, footer, nav { display: none !important; } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 4px" }}>
            Nightwatch Lite · Verification Report
          </p>
          <h1 style={{ color: "#14181f", margin: 0, fontSize: 24 }}>{s.legalName || `DOT ${check.dot_number}`}</h1>
        </div>
        <PrintButton />
      </div>

      <div style={card}>
        <div style={row}><span style={{ color: "#4b5568" }}>Report ID</span><span style={{ fontFamily: "monospace", fontSize: 12 }}>{check.report_token.slice(0, 8).toUpperCase()}</span></div>
        <div style={row}><span style={{ color: "#4b5568" }}>Checked</span><span>{fmt(check.created_at)}</span></div>
        {check.checked_by_company && <div style={row}><span style={{ color: "#4b5568" }}>Company</span><span>{check.checked_by_company}</span></div>}
        {check.checked_by_name && <div style={row}><span style={{ color: "#4b5568" }}>Checked by</span><span>{check.checked_by_name}</span></div>}
        {check.load_reference && <div style={{ ...row, borderBottom: "none" }}><span style={{ color: "#4b5568" }}>Load / PO</span><span>{check.load_reference}</span></div>}
      </div>

      <h2 style={{ fontSize: 16, color: "#14181f", margin: "0 0 8px" }}>1. Carrier (FMCSA record at time of check)</h2>
      <div style={{ ...card, borderLeft: `4px solid ${ok ? "#166534" : "#991b1b"}` }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: ok ? "#166534" : "#991b1b", margin: "0 0 8px" }}>
          {ok ? "Carrier checked out with FMCSA" : "Some items need confirming"}
        </p>
        <div style={row}><span style={{ color: "#4b5568" }}>DOT number</span><span>{s.dotNumber || check.dot_number}</span></div>
        {s.dbaName && <div style={row}><span style={{ color: "#4b5568" }}>DBA</span><span>{s.dbaName}</span></div>}
        {snapshotRows(s).map((r) => (
          <div key={r.label} style={row}>
            <span style={{ color: "#4b5568" }}>{r.label}</span>
            <span style={{ color: r.ok ? "#166534" : "#991b1b", fontWeight: 700 }}>{r.ok ? "✓" : "✗"} {r.value}</span>
          </div>
        ))}
        {s.address && <div style={row}><span style={{ color: "#4b5568" }}>Address on file</span><span style={{ textAlign: "right" }}>{s.address}</span></div>}
        {s.telephone && <div style={{ ...row, borderBottom: "none" }}><span style={{ color: "#4b5568" }}>Phone on file</span><span>{s.telephone}</span></div>}
        <p style={{ fontSize: 11, color: "#6b7280", margin: "10px 0 0", lineHeight: 1.5 }}>
          {!ok && <>FMCSA&apos;s data feed can miss details for some carriers. Confirm any ✗ item on <a href={saferUrl(s.dotNumber || check.dot_number)} style={{ color: "#1d4ed8" }}>FMCSA SAFER</a>. </>}
          Tip: call the carrier at the phone number FMCSA has on file, not one they gave you. A mismatch is a common sign of identity theft.
        </p>
      </div>

      <h2 style={{ fontSize: 16, color: "#14181f", margin: "0 0 8px" }}>2. Driver coverage</h2>
      <div style={card}>
        {ds ? (
          <>
            <div style={row}><span style={{ color: "#4b5568" }}>Driver</span><span>{check.driver_name}</span></div>
            <div style={row}><span style={{ color: "#4b5568" }}>Phone</span><span>ending in {check.driver_contact_last4}</span></div>
            <div style={row}><span style={{ color: "#4b5568" }}>Text sent</span><span>{check.driver_text_sent ? fmt(attestation?.created_at || check.created_at) : "Not delivered (link shared manually)"}</span></div>
            <div style={row}>
              <span style={{ color: "#4b5568" }}>Status</span>
              <span style={{ background: ds.bg, color: ds.color, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>{ds.label}</span>
            </div>
            <div style={{ ...row, borderBottom: "none" }}><span style={{ color: "#4b5568" }}>Answered</span><span>{fmt(attestation?.submitted_at)}</span></div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: "#4b5568", margin: 0 }}>No driver check was run with this report.</p>
        )}
      </div>

      <p style={{ fontSize: 11, color: "#8a92a0", lineHeight: 1.6 }}>
        The carrier section is a snapshot of FMCSA&apos;s public records at the time shown. It is not a guarantee
        and does not replace your own carrier vetting. Driver status reflects the driver&apos;s own answer to a
        private confirmation link. Nightlane is not affiliated with or endorsed by FMCSA.
      </p>
      <p className="nw-noprint" style={{ fontSize: 13, marginTop: 16 }}>
        <a href="/nightwatch/check" style={{ color: "#1d4ed8", fontWeight: 700 }}>Run another check &rarr;</a>
      </p>
    </div>
  );
}
