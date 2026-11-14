import { SteadyWakePage, BRAND } from "../_shared";

// Steady Wake Dispatch's own privacy policy and text messaging terms.
// Separate from /privacy-policy, which covers the load board. Linked from
// the contact form's SMS consent checkbox (app/dispatch/_DispatcherForm.js)
// and served at steadywakedispatch.com/privacy (see middleware.js). This is
// the URL to give a texting provider for SMS (A2P 10DLC) registration.

export const metadata = {
  title: "Privacy Policy & Text Messaging Terms | Steady Wake Dispatch",
  description: "How Steady Wake Dispatch uses the information you send, and the terms for text messages.",
};

const EFFECTIVE = "November 14, 2026";

export default function DispatchPrivacy() {
  return (
    <SteadyWakePage active="">
      <section style={{ paddingTop: 32 }} className="swd-prose">
        <p className="swd-eyebrow">Privacy</p>
        <h1 className="swd-h">Privacy Policy &amp; Text Messaging Terms</h1>
        <p className="swd-lede">Effective {EFFECTIVE}</p>

        <h3 style={{ fontSize: "1.3rem", marginTop: 28 }}>What I collect</h3>
        <p>
          When you fill out the contact form, call, text or email, {BRAND.name} receives what you choose to send:
          your name, company name, MC or DOT number, phone number, email address, equipment, lanes, how you handle
          dispatch now, and any notes. If you&apos;re leased on to a carrier, that includes the carrier&apos;s name and
          contact details you provide. The form also records which link brought you to the site (for example, a
          Facebook group), so I know where people find me.
        </p>
        <p>
          When you enter an MC or DOT number, I look it up in the Federal Motor Carrier Safety Administration&apos;s
          public database to confirm your company name and authority status.
        </p>

        <h3 style={{ fontSize: "1.3rem", marginTop: 28 }}>How I use it</h3>
        <p>
          Only to respond to you and provide dispatch services: contacting you about your request, finding and
          negotiating loads, setting you up with brokers, and handling the paperwork that goes with booking freight.
          If you&apos;re leased on and told me it&apos;s OK, I use your carrier&apos;s information to reach out to them.
          If you asked me not to mention you, I won&apos;t.
        </p>

        <h3 style={{ fontSize: "1.3rem", marginTop: 28 }}>Who I share it with</h3>
        <p>
          I don&apos;t sell your information or share it with anyone for their marketing. It&apos;s shared only when
          doing the work requires it: with brokers when I book a load for you (the usual carrier setup details), and
          with the service providers that run this website, store form submissions, and send email and text
          messages. Those providers may use it only to provide their service. I may also disclose information if
          the law requires it.
        </p>

        <h3 style={{ fontSize: "1.3rem", marginTop: 28 }} id="sms">Text messaging terms</h3>
        <ul style={{ maxWidth: "64ch", paddingLeft: "1.2em" }}>
          <li>
            <b>What you&apos;ll get:</b> If you check the text consent box on the contact form, or text {BRAND.name}{" "}
            first, I may text you at the number you gave about your dispatch request and dispatch services, such as
            follow-ups, load offers, rate confirmations and scheduling.
          </li>
          <li><b>Consent is optional.</b> You don&apos;t have to agree to texts to work with me. I can call or email instead.</li>
          <li><b>Frequency:</b> Message frequency varies with how much we&apos;re working together.</li>
          <li><b>Cost:</b> Message and data rates may apply, depending on your mobile plan.</li>
          <li><b>To stop:</b> Reply <b>STOP</b> to any message. You&apos;ll get one message confirming you&apos;re unsubscribed, and no more after that.</li>
          <li>
            <b>For help:</b> Reply <b>HELP</b>, call or text {BRAND.phone}, or email {BRAND.email}.
          </li>
          <li>Mobile carriers are not liable for delayed or undelivered messages.</li>
          <li>
            <b>Your mobile information is not shared.</b> No mobile information will be shared with third parties or
            affiliates for marketing or promotional purposes. Text messaging opt-in data and consent are not shared
            with any third parties.
          </li>
        </ul>

        <h3 style={{ fontSize: "1.3rem", marginTop: 28 }}>Keeping and deleting your information</h3>
        <p>
          I keep your information as long as needed to work with you and keep normal business records. To see,
          correct or delete what I have about you, email {BRAND.email} or call or text {BRAND.phone}.
        </p>

        <h3 style={{ fontSize: "1.3rem", marginTop: 28 }}>Changes</h3>
        <p>If this policy changes, the updated version will be posted here with a new effective date.</p>

        <h3 style={{ fontSize: "1.3rem", marginTop: 28 }}>Contact</h3>
        <p>
          {BRAND.name} · {BRAND.location}
          <br />
          {BRAND.phone} · {BRAND.email}
        </p>
      </section>
    </SteadyWakePage>
  );
}
