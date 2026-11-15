import { listRecordsForDot, recordStats } from "../../lib/cardanoRecord";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Verified on Cardano | Nightlane",
  description: "See Nightlane's tamper-proof carrier check records on the Cardano blockchain: authority, insurance and status on the date each check was made.",
};

const card = { background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12, padding: 16, marginBottom: 12 };
const p = { color: "#374151", fontSize: 15, lineHeight: 1.6, margin: "0 0 12px" };

function fmtMoney(v) {
  if (typeof v === "number") return `$${v.toLocaleString("en-US")}`;
  return v || "None on file";
}

function RecordCard({ r, copies = 1 }) {
  const ok = r.fromNightlane && r.hashMatches !== false;
  return (
    <div style={card}>
      <p style={{ margin: "0 0 6px", fontWeight: 700, color: ok ? "#166534" : "#991b1b" }}>
        {ok ? "✓ Genuine Nightlane record" : "✗ Not a valid Nightlane record"} · checked {r.checkedOn}
        {copies > 1 && <span style={{ fontWeight: 400, color: "#6b7280" }}> · saved {copies}×</span>}
      </p>
      {r.record ? (
        <ul style={{ margin: "0 0 8px", paddingLeft: 18, color: "#374151", fontSize: 14, lineHeight: 1.6 }}>
          <li>{r.record.name || "Name not on file"}</li>
          <li>Allowed to operate: {r.record.allowedToOperate ? "Yes" : "No"}{r.record.outOfService ? " · OUT OF SERVICE" : ""}</li>
          <li>Authority: {r.record.authorities.length ? r.record.authorities.join(", ") : r.record.authorityUnknown ? "Couldn't confirm" : "None"}</li>
          <li>Liability insurance on file: {fmtMoney(r.record.bipdInsurance)}</li>
          {r.record.powerUnits !== null && <li>Power units: {r.record.powerUnits}</li>}
        </ul>
      ) : (
        <p style={{ ...p, fontSize: 14 }}>Early record: fingerprint only.</p>
      )}
      <p style={{ margin: 0, fontSize: 12, color: "#6b7280", wordBreak: "break-all" }}>
        Fingerprint {r.sha256}
        {r.hashMatches === true && " (matches the facts above)"}
        {" · "}
        <a href={r.url} target="_blank" rel="noopener noreferrer">View on the Cardano blockchain →</a>
      </p>
    </div>
  );
}

export default async function Verify({ searchParams }) {
  const dot = String(searchParams?.dot || "").replace(/\D/g, "");
  let result = null;
  let error = null;
  const stats = await recordStats().catch(() => null);
  if (dot) {
    try {
      result = await listRecordsForDot(dot);
    } catch {
      error = "Couldn't reach the Cardano network right now. Try again in a minute.";
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ color: "#14181f", marginBottom: 8 }}>Verified on Cardano</h1>
      <p style={p}>
        When Nightlane checks a carrier against FMCSA, it can save the result on the Cardano blockchain. Each record
        shows what FMCSA said about the carrier on that date, and it can&apos;t be changed afterward, not even by
        Nightlane.
      </p>

      {stats && stats.records > 0 && (
        <div style={{ display: "flex", gap: 12, margin: "0 0 18px", flexWrap: "wrap" }}>
          {[[stats.records, stats.records === 1 ? "carrier check recorded" : "carrier checks recorded"], [stats.carriers, stats.carriers === 1 ? "carrier" : "different carriers"]].map(([n, label]) => (
            <div key={label} style={{ flex: "1 1 160px", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 12, padding: "12px 16px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#1e3a8a" }}>{n.toLocaleString("en-US")}</div>
              <div style={{ fontSize: 13, color: "#374151" }}>{label} on Cardano{stats.network !== "mainnet" ? " (test network)" : ""}</div>
            </div>
          ))}
        </div>
      )}

      <form method="get" style={{ display: "flex", gap: 8, margin: "0 0 20px", flexWrap: "wrap" }}>
        <input
          name="dot" defaultValue={dot} inputMode="numeric" placeholder="DOT number"
          style={{ flex: "1 1 200px", padding: "10px 12px", fontSize: 15, border: "1px solid #cbd2db", borderRadius: 8 }}
        />
        <button type="submit" style={{ padding: "10px 18px", fontSize: 15, fontWeight: 700, borderRadius: 8, border: 0, background: "#1d4ed8", color: "#fff" }}>
          Look up
        </button>
      </form>

      {error && <p style={{ ...p, color: "#991b1b" }}>{error}</p>}

      {result && !result.enabled && <p style={p}>Cardano records aren&apos;t turned on yet.</p>}

      {result?.enabled && (
        <>
          {result.network !== "mainnet" && (
            <p style={{ ...p, fontSize: 13, color: "#92400e", background: "#fef3c7", padding: "8px 12px", borderRadius: 8 }}>
              Test mode: these records are on Cardano&apos;s preprod test network.
            </p>
          )}
          {result.records.length === 0 ? (
            <p style={p}>
              No Cardano records yet for DOT {dot}. <a href="/check-broker">Check this carrier</a> to create one.
            </p>
          ) : (
            // Same facts on the same day (a duplicate record) show once.
            Object.values(result.records.reduce((acc, r) => {
              const k = `${r.sha256}|${r.fromNightlane && r.hashMatches !== false}`;
              (acc[k] = acc[k] || []).push(r);
              return acc;
            }, {})).map((group) => <RecordCard key={group[0].txHash} r={group[0]} copies={group.length} />)
          )}
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 16, wordBreak: "break-all" }}>
            Records count as genuine only if they were sent from Nightlane&apos;s wallet ({result.wallet}) and their
            facts match their fingerprint.
          </p>
        </>
      )}
    </div>
  );
}
