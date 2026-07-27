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
        Every driver on every load, actually covered.
      </h1>
      <p style={{ color: "#888", fontSize: 16, lineHeight: 1.6, marginBottom: 28, maxWidth: 560 }}>
        Midnight Loadboard verifies carriers before they can claim a load, then confirms — privately,
        directly with the driver — that whoever's actually behind the wheel is covered under an active
        policy. No phone tag. No trusting a paper certificate that's already expired.
      </p>
      <div style={{ display: "flex", gap: 12, marginBottom: 48, flexWrap: "wrap" }}>
        <a href="/post-load" style={primaryBtn}>Post a Load →</a>
        <a href="/get-verified" style={secondaryBtn}>Get Verified as a Carrier →</a>
      </div>

      {/* Why this exists */}
      <div style={{ ...cardStyle, marginBottom: 48 }}>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          Why coverage attestation matters
        </p>
        <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          A carrier can hold valid insurance while the driver actually running the load isn't listed on
          that policy at all. It happens through double brokering, last-minute driver swaps, or carriers
          who just don't think to check. Whoever posted the load is left exposed and doesn't find out
          until something goes wrong. We close that gap before the truck ever leaves.
        </p>
      </div>

      {/* How it works */}
      <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 20 }}>How it works</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
        <div style={cardStyle}>
          <div style={stepNumber}>1</div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            A load gets posted, a verified carrier claims it
          </p>
          <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            Every carrier on Midnight Loadboard has already submitted their CDL, insurance certificate,
            and operating authority for review before they can claim anything.
          </p>
        </div>
        <div style={cardStyle}>
          <div style={{ ...stepNumber, background: "#4caf50" }}>2</div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            The assigned driver gets one text
          </p>
          <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            If the carrier is driving it themselves, coverage is confirmed instantly. If they're assigning
            a driver, that driver gets a private link by text — no app to download, no account to create.
          </p>
        </div>
        <div style={cardStyle}>
          <div style={{ ...stepNumber, background: "#e0a94c" }}>3</div>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
            The driver answers honestly, and it stays private
          </p>
          <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            The driver confirms whether they're actually listed on the carrier's policy. Their answer is
            never shown to the carrier — if something's wrong, the load is flagged and put on hold
            automatically, and it becomes part of that carrier's record.
          </p>
        </div>
      </div>

      {/* Trust / no fees */}
      <div style={{ ...cardStyle, marginBottom: 48, display: "flex", gap: 32, flexWrap: "wrap" }}>
        <div>
          <p style={{ color: "#4caf50", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Free to verify</p>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>No fees, no subscriptions to get credentialed.</p>
        </div>
        <div>
          <p style={{ color: "#4caf50", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>New authority welcome</p>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>You don't need years of history — just real, current documents.</p>
        </div>
        <div>
          <p style={{ color: "#4caf50", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Driver answers stay private</p>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Carriers never see how a driver responded — only that a load is confirmed or flagged.</p>
        </div>
      </div>

      {/* Final CTA */}
      <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
        <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Ready to see what's open right now?
        </p>
        <a href="/loads" style={primaryBtn}>Browse Open Loads →</a>
      </div>
    </div>
  );
}
