export default function TermsOfService() {
  return (
    <div>
      <h1 style={{ color: "#14181f" }}>Terms of Service</h1>
      <p style={{ color: "#4b5568", lineHeight: 1.6 }}>Last updated: July 2026</p>

      <p style={{ color: "#14181f", lineHeight: 1.6 }}>
        By using Midnight Loadboard, you agree to the following terms.
      </p>

      <h2 style={{ color: "#14181f", fontSize: 18, marginTop: 24 }}>The service</h2>
      <p style={{ color: "#14181f", lineHeight: 1.6 }}>
        Midnight Loadboard lets shippers post freight loads, lets verified carriers claim them, and
        lets carriers confirm that the driver assigned to a load is covered under valid insurance or
        operating authority. Carriers are responsible for verifying their own authority and insurance
        status; Midnight Loadboard does not provide insurance or brokerage services.
      </p>

      <h2 style={{ color: "#14181f", fontSize: 18, marginTop: 24 }}>SMS notifications</h2>
      <p style={{ color: "#14181f", lineHeight: 1.6 }}>
        When a carrier assigns a driver to a load, we send that driver a single text message with a
        private link to confirm coverage. Message and data rates may apply. Reply STOP to opt out of
        future messages, or HELP for help. This is a transactional notification tied to a specific
        load assignment, not a marketing message.
      </p>

      <h2 style={{ color: "#14181f", fontSize: 18, marginTop: 24 }}>No warranty</h2>
      <p style={{ color: "#14181f", lineHeight: 1.6 }}>
        The service is provided "as is." We do not guarantee load availability, carrier reliability,
        or that any coverage confirmation is accurate — carriers and drivers remain responsible for
        their own compliance with applicable insurance and authority requirements.
      </p>

      <h2 style={{ color: "#14181f", fontSize: 18, marginTop: 24 }}>Contact</h2>
      <p style={{ color: "#14181f", lineHeight: 1.6 }}>
        Questions about these terms can be sent to{" "}
        <a href="mailto:support@midnightloadboard.com" style={{ color: "#1d4ed8" }}>support@midnightloadboard.com</a>.
      </p>
    </div>
  );
}
