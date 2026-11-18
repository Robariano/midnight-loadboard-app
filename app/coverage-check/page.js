import { checkCoverageRequest, coverageStats } from "../../lib/midnight/coverageProof";
import RequestForm from "./RequestForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata = {
  title: "Private Coverage Check on Midnight | Nightlane",
  description:
    "Brokers: confirm a carrier's insurance meets your minimum without collecting its certificate of insurance. Answers are proven privately on Midnight and verified by Nightlane.",
};

const p = { color: "#374151", fontSize: 15, lineHeight: 1.6, margin: "0 0 12px" };
const usd = (n) => `$${Number(n).toLocaleString("en-US")}`;

export default async function CoverageCheckPage({ searchParams }) {
  const q = String(searchParams?.q || "").trim().slice(0, 200);
  let result = null;
  let stats = null;
  let error = null;
  try {
    if (q) {
      result = await checkCoverageRequest(q);
      stats = { total: result.total, config: result.config };
    } else {
      stats = await coverageStats();
    }
  } catch (e) {
    error = "Couldn't reach Midnight right now. Please try again in a minute.";
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ color: "#14181f", marginBottom: 8 }}>Private Coverage Check</h1>
      <p style={p}>
        Carriers can prove their insurance meets your minimum <b>without sending you their certificate of insurance</b>.
        Nightlane confirms the coverage with the carrier&apos;s insurance agent once. After that, the carrier answers
        your request with a zero-knowledge proof on the Midnight blockchain. You see whether they meet your numbers,
        and nothing else: no policy, insurer or exact limits that could be stolen or misused.
      </p>

      <p style={{ ...p, fontSize: 13, color: "#92400e", background: "#fef3c7", padding: "8px 12px", borderRadius: 8 }}>
        Pilot: running on Midnight&apos;s Preview test network
        {stats ? ` · ${stats.total} request${stats.total === 1 ? "" : "s"} answered so far` : ""}.
      </p>

      <form method="get" style={{ display: "flex", gap: 8, margin: "0 0 20px", flexWrap: "wrap" }}>
        <input
          name="q"
          defaultValue={q}
          placeholder='Your request, e.g. "MC 123456 load 1001"'
          style={{ flex: "1 1 260px", padding: "10px 12px", fontSize: 15, border: "1px solid #cbd2db", borderRadius: 8 }}
        />
        <button
          type="submit"
          style={{ padding: "10px 18px", fontSize: 15, fontWeight: 700, borderRadius: 8, border: 0, background: "#1d4ed8", color: "#fff" }}
        >
          Check
        </button>
      </form>

      {error && <p style={{ ...p, color: "#991b1b" }}>{error}</p>}

      {result && result.found && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ margin: "0 0 6px", fontWeight: 800, color: "#166534", fontSize: 18 }}>✓ Yes, coverage proven</p>
          <p style={{ ...p, margin: "0 0 8px" }}>
            DOT <b>{result.proof.dot}</b> has at least <b>{usd(result.proof.minLiability)}</b> liability and{" "}
            <b>{usd(result.proof.minCargo)}</b> cargo coverage, good through <b>{result.proof.coveredThrough}</b>.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            Verified by attestor {result.proof.attestorId}
            {result.proof.attestorId === 1 ? " (Nightlane)" : ""} for request &ldquo;{q}&rdquo;. Proven on Midnight;
            the carrier&apos;s actual limits and policy stay private.
          </p>
        </div>
      )}

      {result && !result.found && (
        <div style={{ background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#14181f" }}>No answer yet for &ldquo;{q}&rdquo;</p>
          <p style={{ ...p, margin: 0, fontSize: 14 }}>
            The carrier hasn&apos;t answered this request, or the wording is different. Use the exact request text you
            gave the carrier (capital letters don&apos;t matter).
          </p>
        </div>
      )}

      <h2 style={{ fontSize: 18, color: "#14181f", margin: "24px 0 8px" }}>Ask a carrier for a proof</h2>
      <p style={{ ...p, fontSize: 14 }}>
        Pilot carriers enrolled with Nightlane can answer here. Give the request a name you&apos;ll recognize, like your
        MC and load number.
      </p>
      <RequestForm />

      <h2 style={{ fontSize: 18, color: "#14181f", margin: "24px 0 8px" }}>How it works</h2>
      <ol style={{ ...p, paddingLeft: 20 }}>
        <li>You ask for a proof above: your minimums and the date coverage must last through.</li>
        <li>The carrier approves it, and the proof is made on Midnight from coverage Nightlane already confirmed with their insurance agent.</li>
        <li>You type the same request name in the Check box and see the answer.</li>
      </ol>
      <p style={{ ...p, fontSize: 14 }}>
        Why it&apos;s safer than a COI: cargo thieves use stolen certificates to pose as real carriers. A coverage proof
        is tied to the carrier&apos;s own key, so a copy is useless to anyone else, and Nightlane can revoke it if a
        policy is cancelled.
      </p>
      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 16, wordBreak: "break-all" }}>
        Contract {stats?.config?.contractAddress || "(unavailable)"} on Midnight {stats?.config?.network || "preview"}. Public
        FMCSA checks stay on Cardano: <a href="/verify">Verified on Cardano</a>.
      </p>
    </div>
  );
}
