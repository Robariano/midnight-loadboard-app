import AuthorityWatchForm from "./_AuthorityWatchForm";
import DispatchNudge from "../shared/DispatchNudge";

export const metadata = {
  title: "Authority Watch: Free Daily FMCSA Status Alerts | Nightlane",
  description:
    "Free for carriers: we check your FMCSA authority, out-of-service status and insurance on file every morning, and text or email you if anything changes. No Motus login needed.",
};

const box = { background: "#fff8e6", border: "1px solid #f5d48a", borderRadius: 12, padding: "14px 18px", maxWidth: 600, margin: "28px 0 0" };

export default function AuthorityWatchPage() {
  return (
    <div>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#166534", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 6px" }}>
        For Carriers · Free
      </p>
      <h1 style={{ color: "#14181f", margin: "0 0 6px" }}>Authority Watch</h1>
      <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.6, maxWidth: 600, marginBottom: 12 }}>
        Since FMCSA moved to its new Motus registration system, thousands of carriers have had their
        authority suspended or marked inactive by mistake, and some only found out when they were stopped
        on the road. Authority Watch checks FMCSA&apos;s public record for you every morning and tells you
        right away if something changes.
      </p>
      <p style={{ color: "#14181f", fontSize: 15, fontWeight: 700, lineHeight: 1.5, maxWidth: 600, margin: "0 0 20px", borderLeft: "3px solid #166534", paddingLeft: 12 }}>
        Find out from an alert, not from a roadside inspection.
      </p>

      <AuthorityWatchForm />

      <div style={box}>
        <p style={{ fontWeight: 700, color: "#14181f", fontSize: 14, margin: "0 0 8px" }}>If your status changes</p>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#4b5568", fontSize: 13, lineHeight: 1.7 }}>
          <li>Confirm it on FMCSA&apos;s public SAFER lookup first. The data feed can lag.</li>
          <li><strong>Don&apos;t log in to Motus to fix it yourself.</strong> Industry consultants report that changes
            made there have been triggering suspensions, and FMCSA has told carriers in good standing they don&apos;t
            need to log in right now.</li>
          <li>Call FMCSA&apos;s registration line at <strong>800-832-5660</strong> to open a support ticket.</li>
          <li>If insurance is involved, ask your agent to confirm their filing with FMCSA. Many October suspensions
            came from a mismatch between the required minimum and the amount filed.</li>
          <li>If you were cited for operating without authority because of a system error, you can challenge it through FMCSA&apos;s DataQs.</li>
        </ul>
      </div>

      <DispatchNudge
        title="New authority, and brokers keep saying you're too new?"
        body="Steady Wake Dispatch knows which brokers set up new carriers, handles the setup packets and negotiates every rate."
        maxWidth={600}
      />

      <p style={{ fontSize: 11, color: "#8a92a0", marginTop: 24, lineHeight: 1.6, maxWidth: 600 }}>
        We read FMCSA&apos;s public data once a day; we never log in to your Motus account and never ask for your
        FMCSA password. Alerts are a heads-up, not a legal determination of your status. Nightlane is not affiliated
        with or endorsed by FMCSA. If you sign up for text alerts, message and data rates may apply; reply STOP to any text to opt out.
      </p>
    </div>
  );
}
