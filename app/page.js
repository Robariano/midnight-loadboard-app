const cardStyle = {
  background: "#f7f8fa",
  border: "1px solid #e2e5ea",
  borderRadius: 12,
  padding: 20,
};

const primaryBtn = {
  display: "inline-block",
  padding: "14px 24px",
  background: "#1d4ed8",
  color: "#fff",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
};

const secondaryBtn = {
  display: "inline-block",
  padding: "14px 24px",
  background: "transparent",
  color: "#166534",
  border: "1px solid #166534",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
};


// Nightlane's job is to bring owner-operators in with free tools and turn
// the ones who want help into Steady Wake Dispatch clients. So the page
// leads with the tools, puts the dispatch offer right under them, and keeps
// the coverage check to one short card (its own page explains the rest).
const tools = [
  ["/check-broker", "Check a Broker", "Look up a broker's FMCSA registration before you haul."],
  ["/authority-watch", "Authority Watch", "Free daily check of your FMCSA authority, with an alert if it changes."],
  ["/loads", "Find Loads", "Browse loads posted on Nightlane."],
  ["/my-documents", "My Documents", "Keep your W-9, insurance and authority letter in one place."],
  ["/confirm-coverage", "Confirm Coverage", "Make sure the driver is covered before the truck leaves."],
  ["/roadside", "Roadside & Repair", "Find towing and repair help near you."],
];

const dispatchPoints = [
  ["First load free.", "Then 7%, only after the broker pays you."],
  ["Booked under your MC,", "with your OK on every load."],
  ["Every broker checked on FMCSA", "before I book."],
  ["New authority welcome.", "I know which brokers will set you up."],
];

export default function Home() {
  return (
    <div>
      <h1 style={{ color: "#14181f", fontSize: 32, lineHeight: 1.25, marginBottom: 8 }}>
        Free tools for owner-operators
      </h1>
      <p style={{ color: "#4b5568", fontSize: 16, lineHeight: 1.6, marginBottom: 20, maxWidth: 560 }}>
        Check brokers, watch your authority and keep your documents in one place. Free, no subscription, no account needed to start.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 40,
        }}
      >
        {tools.map(([href, title, body]) => (
          <a key={href} href={href} style={{ ...cardStyle, padding: 16, textDecoration: "none", display: "block" }}>
            <span style={{ display: "block", color: "#1d4ed8", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
              {title} →
            </span>
            <span style={{ display: "block", color: "#4b5568", fontSize: 13, lineHeight: 1.5 }}>{body}</span>
          </a>
        ))}
      </div>

      {/* The offer this site exists for */}
      <div style={{ ...cardStyle, background: "#fef7ea", borderColor: "#f5a623", padding: 24, marginBottom: 40 }}>
        <p style={{ color: "#92400e", fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 6px" }}>
          Need a dispatcher?
        </p>
        <h2 style={{ color: "#14181f", fontSize: 24, lineHeight: 1.25, margin: "0 0 8px" }}>
          Let Steady Wake Dispatch find your next load
        </h2>
        <p style={{ color: "#4b5568", fontSize: 15, lineHeight: 1.6, margin: "0 0 14px", maxWidth: 560 }}>
          You drive. I find the freight, negotiate the rate and handle the broker paperwork.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px" }}>
          {dispatchPoints.map(([head, rest]) => (
            <li key={head} style={{ display: "flex", gap: 10, padding: "4px 0", fontSize: 14, color: "#14181f", lineHeight: 1.5 }}>
              <span aria-hidden="true" style={{ color: "#166534", fontWeight: 700 }}>✓</span>
              <span><b>{head}</b> {rest}</span>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <a href="/dispatch/contact" style={{ ...primaryBtn, background: "#92400e" }}>Get my first load free →</a>
          <a href="/dispatch" style={{ color: "#92400e", fontWeight: 700, fontSize: 14 }}>How it works</a>
          <span style={{ color: "#4b5568", fontSize: 14 }}>
            or call or text <a href="tel:+19709039226" style={{ color: "#14181f", fontWeight: 700 }}>(970) 903-9226</a>
          </span>
        </div>
        <p style={{ color: "#6b7280", fontSize: 12, margin: "16px 0 0", lineHeight: 1.5 }}>
          Nightlane and Steady Wake Dispatch are run by the same person. The tools above are free whether or not you use dispatch.
        </p>
      </div>

      {/* Coverage check, kept short */}
      <div style={{ ...cardStyle, marginBottom: 40 }}>
        <p style={{ color: "#14181f", fontWeight: 700, fontSize: 16, margin: "0 0 8px" }}>
          Know the driver is covered before the truck leaves
        </p>
        <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.6, margin: "0 0 14px" }}>
          A truck can carry valid insurance while the driver isn't listed on the policy. A free, private
          30-second check closes that gap, for a load from any board or a phone call.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/confirm-coverage" style={{ ...primaryBtn, padding: "10px 18px" }}>Confirm Coverage →</a>
          <a href="/get-verified" style={{ ...secondaryBtn, padding: "10px 18px" }}>Get Verified as a Carrier →</a>
        </div>
      </div>

      {/* Final nudge */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <p style={{ color: "#14181f", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
          Tired of sitting on load boards?
        </p>
        <a href="/dispatch/contact" style={{ ...primaryBtn, background: "#92400e" }}>Get my first load free →</a>
      </div>
    </div>
  );
}
