const cardStyle = {
  background: "#12121e",
  border: "1px solid #2a2a3e",
  borderRadius: 12,
  padding: 20,
};

const primaryBtn = {
  display: "inline-block",
  padding: "14px 24px",
  background: "#5c5cff",
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
  color: "#4caf50",
  border: "1px solid #4caf50",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
};

const stepNumber = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "#5c5cff",
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 12,
};

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <h1 style={{ color: "#fff", fontSize: 32, lineHeight: 1.25, marginBottom: 12 }}>
        Know you're covered before you drive.
      </h1>
      <p style={{ color: "#888", fontSize: 16, lineHeight: 1.6, marginBottom: 28, maxWidth: 560 }}>
        A truck can carry valid commercial insurance while the driver behind the wheel isn't actually
        covered under it. Midnight Loadboard is a free, private coverage check — for drivers to confirm
        for themselves, or for carriers to confirm with a driver — before the truck ever leaves. Works no
        matter where the load came from.
      </p>
      <div style={{ display: "flex", gap: 12, marginBottom: 48, flexWrap: "wrap" }}>
        <a href="/confirm-coverage" style={primaryBtn}>Confirm Coverage →</a>
        <a href="/get-verified" style={secondaryBtn}>Get Verified as a Carrier →</a>
      </div>

      {/* Why this exists */}
      <div style={{ ...cardStyle, marginBottom: 48 }}>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          Why coverage attestation matters
        </p>
        <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          Being covered means you're a named or listed driver on the carrier's active policy for that
          trip — not just that the truck has valid papers. That gap gets missed through double brokering,
          last-minute driver swaps, or a small carrier moving fast with nobody dedicated to catching it.
          Whoever's behind the wheel is the one exposed, and usually doesn't find out until something's
          already gone wrong. This closes that gap before the truck ever leaves — for one driver on one
          load, in about 30 seconds.
        </p>
      </div>

      {/* How it works */}
      <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>How it works</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
        <div style={cardStyle}>
          <div style={stepNumber}>1</div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            Check coverage for any load, from anywhere
          </p>
          <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Found the load on DAT, Truckstop, or a phone call? Doesn't matter. A driver can check their
            own coverage directly, no carrier or account required — or a verified carrier can send a
            driver a private confirmation link.
          </p>
        </div>
        <div style={cardStyle}>
          <div style={{ ...stepNumber, background: "#4caf50" }}>2</div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            One private link, one honest question
          </p>
          <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            The driver gets a link by email — no app to download, no account to create — and answers one
            question: are you actually listed on the active policy for this trip?
          </p>
        </div>
        <div style={cardStyle}>
          <div style={{ ...stepNumber, background: "#e0a94c" }}>3</div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            The answer stays private — the outcome doesn't
          </p>
          <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            A carrier never sees how a driver responded. If something's wrong, the carrier just sees that
            it's flagged, and it becomes part of that carrier's record — enough to act on, without putting
            the driver on the spot.
          </p>
        </div>
      </div>

      {/* Trust / no fees */}
      <div style={{ ...cardStyle, marginBottom: 48, display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div>
          <p style={{ color: "#4caf50", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Always free</p>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>No fees, no subscription, no account needed to check your own coverage.</p>
        </div>
        <div>
          <p style={{ color: "#4caf50", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Works with any load</p>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Not tied to this site's load board — use it alongside DAT, Truckstop, or a direct call.</p>
        </div>
        <div>
          <p style={{ color: "#4caf50", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Driver answers stay private</p>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Carriers never see how a driver responded — only that a load is confirmed or flagged.</p>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
        <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Not sure if you're covered on your next load?
        </p>
        <a href="/confirm-coverage" style={primaryBtn}>Confirm Coverage →</a>
        <p style={{ color: "#666", fontSize: 12, marginTop: 20 }}>
          Also verifying loads through Midnight Loadboard directly?{" "}
          <a href="/loads" style={{ color: "#5c5cff" }}>Browse open loads →</a>
        </p>
      </div>
    </div>
  );
}
