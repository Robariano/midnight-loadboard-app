import { DispatchSubNav, DispatchBadge, cardStyle, primaryBtn, secondaryBtn, stepNumber } from "./_shared";

export const metadata = {
  title: "Freight Dispatch Services in Durango, CO | Midnight Loadboard",
  description:
    "A real dispatcher finding you loads, negotiating rates, and handling the paperwork — based in Durango, Colorado. Not an automated system, not a call center.",
};

export default function DispatchHome() {
  return (
    <div>
      <DispatchSubNav active="Home" />

      <DispatchBadge />
      <h1 style={{ color: "#14181f", fontSize: 32, lineHeight: 1.25, marginBottom: 12 }}>
        Need a dispatcher? Get a real person on your freight — today.
      </h1>
      <p style={{ color: "#4b5568", fontSize: 16, lineHeight: 1.6, marginBottom: 28, maxWidth: 560 }}>
        Finding loads, negotiating rates, and handling the back-office work so you can stay behind the
        wheel. Based in Durango, Colorado — this isn't a load board listing or an automated matching
        system, it's a direct line to the person actually doing the dispatching.
      </p>
      <div style={{ display: "flex", gap: 12, marginBottom: 48, flexWrap: "wrap" }}>
        <a href="/dispatch/contact" style={primaryBtn}>Get Matched With a Dispatcher →</a>
        <a href="/dispatch/services" style={secondaryBtn}>See What's Included</a>
      </div>

      {/* Why this exists */}
      <div style={{ ...cardStyle, marginBottom: 48 }}>
        <p style={{ color: "#14181f", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          Why work with a dispatcher instead of chasing loads yourself
        </p>
        <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          Every hour spent scrolling load boards, calling brokers, and re-typing the same paperwork is an
          hour you're not driving — or an hour you're driving without a plan for the next load. A
          dispatcher's job is to keep freight lined up ahead of you, push back on lowball rates, and keep
          the documentation clean, so the time you do spend on the phone is time spent actually running
          your business.
        </p>
      </div>

      {/* How it works */}
      <p style={{ color: "#14181f", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>How it works</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
        <div style={cardStyle}>
          <div style={stepNumber}>1</div>
          <p style={{ color: "#14181f", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            Tell us about your operation
          </p>
          <p style={{ color: "#4b5568", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Your equipment, your lanes, and whether you run under your own authority or someone else's —
            takes about two minutes.
          </p>
        </div>
        <div style={cardStyle}>
          <div style={{ ...stepNumber, background: "#166534" }}>2</div>
          <p style={{ color: "#14181f", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            You hear back directly — not through a form email
          </p>
          <p style={{ color: "#4b5568", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            No automated queue. A real conversation about what you're looking for and whether it's a
            good fit before anything is decided.
          </p>
        </div>
        <div style={cardStyle}>
          <div style={{ ...stepNumber, background: "#92400e" }}>3</div>
          <p style={{ color: "#14181f", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            Freight starts moving
          </p>
          <p style={{ color: "#4b5568", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Loads sourced, rates negotiated, rate confirmations and paperwork handled — you drive, we
            handle the rest.
          </p>
        </div>
      </div>

      {/* Trust */}
      <div style={{ ...cardStyle, marginBottom: 48, display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div>
          <p style={{ color: "#166534", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Founder-run</p>
          <p style={{ color: "#4b5568", fontSize: 13, margin: 0 }}>
            You're talking to the person doing the work, not a rotating call center.
          </p>
        </div>
        <div>
          <p style={{ color: "#166534", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>No long-term lock-in</p>
          <p style={{ color: "#4b5568", fontSize: 13, margin: 0 }}>
            Worth submitting even if you're just weighing your options.
          </p>
        </div>
        <div>
          <p style={{ color: "#166534", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Built by someone who's driven</p>
          <p style={{ color: "#4b5568", fontSize: 13, margin: 0 }}>
            CDL holder, Navy veteran, raised around freight in Durango — <a href="/dispatch/about" style={{ color: "#1d4ed8" }}>the full story</a>.
          </p>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
        <p style={{ color: "#14181f", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Ready to get freight lined up?
        </p>
        <a href="/dispatch/contact" style={primaryBtn}>Get Matched With a Dispatcher →</a>
      </div>
    </div>
  );
}
