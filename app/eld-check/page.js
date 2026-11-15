import { fetchRevokedELDs, FMCSA_ELD_LIST_URL } from "../../lib/eldRevoked";
import ELDSearch from "./_ELDSearch";
import DispatchNudge from "../shared/DispatchNudge";

export const metadata = {
  title: "Is My ELD Revoked? Free FMCSA Revoked ELD Check | Nightlane",
  description:
    "Search FMCSA's official list of revoked electronic logging devices by brand, company or ELD ID. Free, updated from FMCSA every few hours.",
};

export const revalidate = 21600; // 6 hours

const box = { background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12, padding: 20 };

export default async function ELDCheck() {
  let data = null;
  try {
    data = await fetchRevokedELDs();
  } catch {
    data = null;
  }
  const recent = data ? data.devices.filter((d) => d.date >= "2026-11-01").length : 0;

  return (
    <div>
      <h1 style={{ color: "#14181f", fontSize: 30, lineHeight: 1.25, marginBottom: 8 }}>Is my ELD revoked?</h1>
      <p style={{ color: "#4b5568", fontSize: 16, lineHeight: 1.6, marginBottom: 20 }}>
        FMCSA has been pulling non-compliant ELDs off its approved list, including{" "}
        {recent ? `${recent} devices this month` : "a large batch this month"}. Check yours against FMCSA&apos;s official
        revoked list. Free, no account.
      </p>

      <div style={{ ...box, marginBottom: 24 }}>
        {data ? (
          <>
            <ELDSearch devices={data.devices} listUrl={FMCSA_ELD_LIST_URL} />
            <p style={{ color: "#6b7280", fontSize: 12, margin: "14px 0 0" }}>
              {data.devices.length} devices on FMCSA&apos;s revoked list, read from{" "}
              <a href={FMCSA_ELD_LIST_URL} style={{ color: "#4b5568" }}>eld.fmcsa.dot.gov</a> and refreshed every few hours.
            </p>
          </>
        ) : (
          <p style={{ color: "#4b5568", margin: 0, lineHeight: 1.6 }}>
            We couldn&apos;t reach FMCSA&apos;s ELD list right now. Check it directly at{" "}
            <a href={FMCSA_ELD_LIST_URL} style={{ color: "#1d4ed8" }}>eld.fmcsa.dot.gov/List</a> under &quot;Revoked ELDs.&quot;
          </p>
        )}
      </div>

      <h2 style={{ color: "#14181f", fontSize: 20, margin: "0 0 10px" }}>If your ELD is on the list</h2>
      <ol style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, paddingLeft: 20, margin: "0 0 14px" }}>
        <li>Stop relying on it for your hours. Use paper logs or compliant logging software until you switch.</li>
        <li>Replace it with a device on FMCSA&apos;s <a href={FMCSA_ELD_LIST_URL} style={{ color: "#1d4ed8" }}>registered list</a>. FMCSA usually allows 60 days from the revocation date; its notice for each batch gives the exact deadline.</li>
        <li>After the deadline, drivers still using a revoked ELD can be placed out of service at an inspection.</li>
      </ol>
      <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
        If the maker fixes the problems, FMCSA can put a device back on the registered list. This page is general
        information; FMCSA&apos;s own notices are the official word.
      </p>

      <DispatchNudge
        title="Sorting out a new ELD and still need loads?"
        body="Steady Wake Dispatch finds and negotiates your loads, checks every broker on FMCSA, and never pushes you past your legal hours."
      />
    </div>
  );
}
