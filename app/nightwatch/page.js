import NightwatchLeadForm from "./_NightwatchLeadForm";

export const metadata = {
  title: "Nightwatch for Brokers | Nightdesk",
  description:
    "Coming soon: continuous carrier verification for brokers — FMCSA authority, insurance, and safety data checked continuously, cross-referenced against flagged operators. Request early access.",
};

const cardStyle = {
  background: "#f7f8fa",
  border: "1px solid #e2e5ea",
  borderRadius: 12,
  padding: 20,
};

const features = [
  {
    title: "Live, not one-time",
    body: "Authority, insurance, and safety status get re-checked continuously — not just when a carrier first signs up. A lapsed policy shows up right away, not at pickup.",
  },
  {
    title: "Chameleon cross-check",
    body: "New registrants get compared against every carrier already flagged for fraud — a shared address, phone, owner, or insurer surfaces immediately.",
  },
  {
    title: "Audit trail",
    body: "Every profile check gets timestamped — a documented, repeatable process brokers can point to if a carrier selection is ever questioned.",
  },
  {
    title: "One status, not a stack of PDFs",
    body: "Verified, Expiring, or Flagged — a single badge instead of opening a certificate and judging it yourself.",
  },
];

export default function Nightwatch() {
  return (
    <div>
      <div
        style={{
          background: "#14181f",
          borderRadius: 16,
          padding: "32px 28px",
          marginBottom: 28,
          color: "#fff",
        }}
      >
        <p style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>
          For Brokers · Coming Soon
        </p>
        <h1 style={{ fontSize: 28, lineHeight: 1.25, margin: "0 0 12px" }}>
          Nightwatch: continuous carrier verification, built for brokers.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#c7ccd6", maxWidth: 560, margin: 0 }}>
          We're building a tool that checks every carrier's FMCSA authority, insurance, and safety
          data continuously — and cross-references against carriers already flagged for fraud. One
          status instead of a stack of PDFs.
        </p>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <p style={{ color: "#14181f", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          Why it matters
        </p>
        <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          Freight fraud — double brokering, identity theft, fake documents — cost the industry
          $800M+ in 2026. New authority under 6 months old is where "chameleon" carriers hide after
          a shutdown. And brokers now face real legal exposure for not vetting carriers carefully.
        </p>
      </div>

      <p style={{ color: "#14181f", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>What's coming</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
        {features.map((f) => (
          <div key={f.title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "#1d4ed8", fontWeight: 700, marginTop: 1 }}>✓</span>
            <p style={{ color: "#4b5568", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
              <span style={{ color: "#14181f", fontWeight: 700 }}>{f.title}.</span> {f.body}
            </p>
          </div>
        ))}
      </div>

      <h2 style={{ color: "#14181f", fontSize: 18, marginBottom: 4 }}>Want early access?</h2>
      <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.6, marginBottom: 20, maxWidth: 560 }}>
        Leave your info below and we'll reach out first when Nightwatch launches.
      </p>

      <NightwatchLeadForm />

      <p style={{ fontSize: 11, color: "#8a92a0", marginTop: 24, lineHeight: 1.6 }}>
        Safety data will be sourced from FMCSA SAFER &amp; the Safety Measurement System, layered
        with our own identity and insurance checks. Nightdesk is not affiliated with or
        endorsed by FMCSA.
      </p>
    </div>
  );
}
