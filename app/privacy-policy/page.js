export default function PrivacyPolicy() {
  return (
    <div>
      <h1 style={{ color: "#fff" }}>Privacy Policy</h1>
      <p style={{ color: "#888", lineHeight: 1.6 }}>Last updated: July 2026</p>

      <p style={{ color: "#e0e0e0", lineHeight: 1.6 }}>
        Midnight Loadboard ("we," "us") operates a load board connecting freight carriers with
        available loads and verifying coverage on assigned loads. This page explains what
        information we collect and how we use it.
      </p>

      <h2 style={{ color: "#fff", fontSize: 18, marginTop: 24 }}>Information we collect</h2>
      <ul style={{ color: "#e0e0e0", lineHeight: 1.8 }}>
        <li>Carrier verification details (company name, contact info, authority/insurance status).</li>
        <li>Load details submitted by shippers (pickup/delivery locations, rate, equipment type).</li>
        <li>Driver name and contact information (phone number or email), submitted by a carrier when
          assigning a driver to a load, used solely to send that driver a coverage confirmation link.</li>
      </ul>

      <h2 style={{ color: "#fff", fontSize: 18, marginTop: 24 }}>How we use it</h2>
      <p style={{ color: "#e0e0e0", lineHeight: 1.6 }}>
        We use driver contact information only to send a one-time SMS or email containing a private
        link so the driver can confirm their insurance coverage for the assigned load. We do not use
        this information for marketing, and we do not sell or share it with third parties other than
        the messaging providers (such as Twilio) we use to deliver the message itself.
      </p>

      <h2 style={{ color: "#fff", fontSize: 18, marginTop: 24 }}>Opting out</h2>
      <p style={{ color: "#e0e0e0", lineHeight: 1.6 }}>
        Reply STOP to any text message from us to stop receiving further messages. Because each
        message is a one-time confirmation link tied to a specific load assignment, most recipients
        will only ever receive a single message.
      </p>

      <h2 style={{ color: "#fff", fontSize: 18, marginTop: 24 }}>Contact</h2>
      <p style={{ color: "#e0e0e0", lineHeight: 1.6 }}>
        Questions about this policy can be sent to{" "}
        <a href="mailto:robertariano@gmail.com" style={{ color: "#5c5cff" }}>robertariano@gmail.com</a>.
      </p>
    </div>
  );
}
