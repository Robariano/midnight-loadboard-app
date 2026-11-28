import { checkCoverageRequest, coverageStats, sampleCoverageProof } from "../../lib/midnight/coverageProof";
import { checkVehicleRequest, vehicleConfig, vehicleStats, vinCommitmentHex } from "../../lib/midnight/vehicleProof";
import { checkDriverRequest, driverConfig, driverStats, nameCommitmentHex } from "../../lib/midnight/driverProof";
import { requestKeyOf } from "../../lib/midnight/coverageRequests";
import { getServiceClient } from "../../lib/supabase";
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
  // Demo mode reads the Preview test network, where Nightlane's sample carrier
  // answered a sample request, so brokers can see a real "yes" without a made-up
  // record on mainnet.
  const demo = searchParams?.demo === "1";
  const env = demo
    ? { ...process.env, MIDNIGHT_COVERAGE_NETWORK: "preview", MIDNIGHT_COVERAGE_INDEXER: "", MIDNIGHT_COVERAGE_CONTRACT: "" }
    : process.env;
  let result = null;
  let stats = null;
  let error = null;
  try {
    if (demo && !q) {
      result = await sampleCoverageProof({ env });
      stats = { total: result.total, config: result.config };
    } else if (q) {
      result = await checkCoverageRequest(q, { env });
      stats = { total: result.total, config: result.config };
    } else {
      stats = await coverageStats({ env });
    }
  } catch (e) {
    error = "Couldn't reach Midnight right now. Please try again in a minute.";
  }

  // The answered count covers both contracts (insurance and van proofs). The
  // sample view counts only the test network's insurance proofs.
  if (stats && !demo && !error) {
    try {
      const [v, d] = await Promise.all([vehicleStats().catch(() => ({ total: 0 })), driverStats().catch(() => ({ total: 0 }))]);
      stats = { ...stats, total: Number(stats.total) + v.total + d.total };
    } catch {}
  }

  // Van proofs live on a second contract. Only looked up for a real request
  // (not the sample) that the coverage contract didn't answer.
  let vehicle = null;
  if (q && !demo && !error && !(result && result.found)) {
    try {
      const v = await checkVehicleRequest(q);
      if (v.found) {
        // The chain stores only a commitment to the VIN; show the last 6 when it
        // matches the VIN on the request.
        let vinLast6 = null;
        try {
          const { data: r } = await getServiceClient().from("coverage_requests").select("*").eq("request_key", requestKeyOf(q)).maybeSingle();
          if (r?.vin && vinCommitmentHex(r.vin) === v.proof.vinCommitment) vinLast6 = r.vin.slice(-6);
        } catch {}
        vehicle = { ...v.proof, vinLast6 };
      }
    } catch {}
  }

  // Driver proofs live on a third contract.
  let driver = null;
  if (q && !demo && !error && !(result && result.found) && !vehicle) {
    try {
      const d = await checkDriverRequest(q);
      if (d.found) {
        let name = null;
        try {
          const { data: r } = await getServiceClient().from("coverage_requests").select("*").eq("request_key", requestKeyOf(q)).maybeSingle();
          if (r?.driver_name && nameCommitmentHex(r.driver_name) === d.proof.nameCommitment) name = r.driver_name;
        } catch {}
        driver = { ...d.proof, name };
      }
    } catch {}
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

      {demo && (
        <p style={{ ...p, fontSize: 13, color: "#1e3a8a", background: "#dbeafe", padding: "8px 12px", borderRadius: 8 }}>
          <b>Sample only.</b> This reads Midnight&apos;s Preview test network and a sample carrier, so you can see what
          an answer looks like. It is not a real carrier&apos;s coverage. <a href="/coverage-check">Back to the live check</a>.
        </p>
      )}

      <p style={{ ...p, fontSize: 13, color: "#166534", background: "#dcfce7", padding: "8px 12px", borderRadius: 8 }}>
        Live on {(stats?.config?.network || "preview") === "mainnet" ? "Midnight mainnet" : "Midnight’s Preview test network"}
        {stats ? ` · ${stats.total} request${stats.total === 1 ? "" : "s"} answered so far` : ""}.
      </p>

      <form method="get" style={{ display: "flex", gap: 8, margin: "0 0 8px", flexWrap: "wrap" }}>
        {demo && <input type="hidden" name="demo" value="1" />}
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

      {!demo && (
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
          Want to see what an answer looks like?{" "}
          <a href="/coverage-check?demo=1">See a sample (test network)</a>.
        </p>
      )}
      {demo && <div style={{ height: 12 }} />}

      {error && <p style={{ ...p, color: "#991b1b" }}>{error}</p>}

      {result && result.found && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ margin: "0 0 6px", fontWeight: 800, color: "#166534", fontSize: 18 }}>✓ Yes, coverage proven</p>
          <p style={{ ...p, margin: "0 0 8px" }}>
            DOT <b>{result.proof.dot}</b> has at least <b>{usd(result.proof.minLiability)}</b> liability and{" "}
            <b>{usd(result.proof.minCargo)}</b> cargo coverage, good through <b>{result.proof.coveredThrough}</b>.
            {result.proof.authorityCheckedOn && (
              <> FMCSA showed the carrier allowed to operate on <b>{result.proof.authorityCheckedOn}</b>{" "}
              (<a href={`/verify?q=${result.proof.dot}`} style={{ color: "#166534" }}>public record on Cardano</a>).</>
            )}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            Verified by attestor {result.proof.attestorId}
            {result.proof.attestorId === 1 ? " (Nightlane)" : ""} for {q ? <>request &ldquo;{q}&rdquo;</> : "a sample request"}. Proven on Midnight;
            the carrier&apos;s actual limits and policy stay private.
          </p>
        </div>
      )}

      {vehicle && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ margin: "0 0 6px", fontWeight: 800, color: "#166534", fontSize: 18 }}>✓ Yes, this van is on the policy</p>
          <p style={{ ...p, margin: "0 0 8px" }}>
            DOT <b>{vehicle.dot}</b>&apos;s van{vehicle.vinLast6 ? <> with VIN ending <b>{vehicle.vinLast6}</b></> : null} is on its
            insurance policy, good through <b>{vehicle.coveredThrough}</b>.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            Verified by attestor {vehicle.attestorId}
            {vehicle.attestorId === 1 ? " (Nightlane)" : ""} for request &ldquo;{q}&rdquo;. Proven on Midnight; the policy,
            insurer and the carrier&apos;s other vehicles stay private.
          </p>
        </div>
      )}

      {driver && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ margin: "0 0 6px", fontWeight: 800, color: "#166534", fontSize: 18 }}>✓ Yes, this driver is on the policy</p>
          <p style={{ ...p, margin: "0 0 8px" }}>
            {driver.name ? <><b>{driver.name}</b> is a driver</> : <>The requested driver is</>} on DOT <b>{driver.dot}</b>&apos;s
            insurance policy, good through <b>{driver.coveredThrough}</b>.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
            Verified by attestor {driver.attestorId}
            {driver.attestorId === 1 ? " (Nightlane)" : ""} for request &ldquo;{q}&rdquo;. Proven on Midnight; the policy,
            insurer and the carrier&apos;s other drivers stay private.
          </p>
        </div>
      )}

      {result && !result.found && !vehicle && !driver && (
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
        Carriers enrolled with Nightlane can answer here. Give the request a name you&apos;ll recognize, like your
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
        Insurance proofs: contract {stats?.config?.contractAddressV2 || stats?.config?.contractAddress || "(unavailable)"} on Midnight {stats?.config?.network || "preview"}.
        {!demo && vehicleConfig().contractAddress ? <> Van proofs: contract {vehicleConfig().contractAddress}. Driver proofs: contract {driverConfig().contractAddress}.</> : null} Public
        FMCSA checks stay on Cardano: <a href="/verify">Verified on Cardano</a>.
      </p>
    </div>
  );
}
