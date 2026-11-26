import { notFound } from "next/navigation";
import { getServiceClient } from "../../../lib/supabase";
import ApproveButtons from "./ApproveButtons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Approve a coverage proof | Nightlane", robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const p = { color: "#374151", fontSize: 15, lineHeight: 1.6, margin: "0 0 12px" };
const usd = (n) => `$${Number(n).toLocaleString("en-US")}`;

// The carrier's private link: approve or decline one broker's coverage request.
export default async function ApprovePage({ params }) {
  if (!UUID.test(params.token)) notFound();
  const { data: r } = await getServiceClient()
    .from("coverage_requests")
    .select("*")
    .eq("approve_token", params.token)
    .maybeSingle();
  if (!r) notFound();

  return (
    <div style={{ maxWidth: 620 }}>
      <h1 style={{ color: "#14181f", marginBottom: 8 }}>A broker asked about your insurance</h1>
      {r.kind === "vehicle" ? (
        <>
          <p style={p}>
            Request <b>&ldquo;{r.request_text}&rdquo;</b> for DOT <b>{r.dot_number}</b>. The broker wants to know that the
            van with VIN ending <b>{String(r.vin).slice(-6)}</b> is on your insurance policy through <b>{r.covered_through}</b>.
          </p>
          <p style={p}>
            If you approve, Nightlane proves it on the Midnight blockchain from what it confirmed with your insurance agent.
            The broker sees only <b>yes, this van is on the policy</b>. Your certificate of insurance, insurer, policy number
            and the rest of your vehicles are never shown or sent.
          </p>
        </>
      ) : (
        <>
          <p style={p}>
            Request <b>&ldquo;{r.request_text}&rdquo;</b> for DOT <b>{r.dot_number}</b>. The broker wants to know you have at least:
          </p>
          <ul style={{ ...p, paddingLeft: 20 }}>
            <li><b>{usd(r.min_liability)}</b> liability</li>
            <li><b>{usd(r.min_cargo)}</b> cargo</li>
            <li>covered through <b>{r.covered_through}</b></li>
          </ul>
          <p style={p}>
            If you approve, Nightlane proves it on the Midnight blockchain from the coverage it confirmed with your
            insurance agent. The broker sees only <b>yes, these minimums are met</b>. Your certificate of insurance, insurer,
            policy number and real limits are never shown or sent.
          </p>
        </>
      )}
      <ApproveButtons token={params.token} status={r.status} error={r.error} />
    </div>
  );
}
