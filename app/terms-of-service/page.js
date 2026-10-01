export default function TermsOfService() {
  return (
    <div>
      <h1 style={{ color: "#14181f" }}>Terms of Service</h1>
      <p style={{ color: "#4b5568", lineHeight: 1.6 }}>Last updated: July 2026</p>

      <p style={{ color: "#14181f", lineHeight: 1.6 }}>
        By using Nightdesk, you agree to the following terms.
      </p>

      <h2 style={{ color: "#14181f", fontSize: 18, marginTop: 24 }}>The service</h2>
      <p style={{ color: "#14181f", lineHeight: 1.6 }}>
        Nightdesk lets shippers post freight loads, lets verified carriers claim them, and
        lets carriers confirm that the driver assigned to a load is covered under valid insurance or
        operating authority. Carriers are responsible for verifying their own authority and insurance
        status; Nightdesk does not provide insurance or brokerage services.
      </p>

      <h2 style={{ color: "#14181f", fontSize: 18, marginTop: 24 }}>SMS notifications</h2>
      <p style={{ color: "#14181f", lineHeight: 1.6 }}>
        If you become a verified carrier, the phone number you provide on your carrier account is
        used solely for account-related text alerts &mdash; for example, a reminder before your
        on-file insurance expires, so your verified status doesn't lapse. Message and data rates may
        apply. Reply STOP to opt out of future messages, or HELP for help. These are transactional
        account notifications, never marketing messages.
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
