import DispatchNudge from "../../shared/DispatchNudge";

export const metadata = {
  title: "How Cargo Thieves Use Stolen Insurance Certificates, and How to Protect Yours | Nightlane",
  description:
    "Cargo thieves use real carriers' certificates of insurance to impersonate them and steal loads. How the scam works, and seven ways owner-operators and brokers can protect themselves.",
};

const h2 = { color: "#14181f", fontSize: 21, lineHeight: 1.3, margin: "32px 0 10px" };
const p = { color: "#374151", fontSize: 15, lineHeight: 1.75, margin: "0 0 14px" };
const li = { color: "#374151", fontSize: 15, lineHeight: 1.7, marginBottom: 8 };
const a = { color: "#1d4ed8" };

const carrierSteps = [
  {
    title: "Check the broker before you send anything",
    body: (
      <>
        Fake brokers and fake dispatchers ask for your COI because it looks like a routine request. Before you send
        it, look the company up on <a href="/check-broker" style={a}>Check FMCSA Registration</a> and make sure the
        name, MC number and phone match.
      </>
    ),
  },
  {
    title: "Call back on the number FMCSA has, not the one in the email",
    body: (
      <>
        Scammers copy real brokers&apos; names and logos. If a request feels off, call the broker using the phone
        number on their FMCSA record and confirm the request is real.
      </>
    ),
  },
  {
    title: "Have your agent send the certificate",
    body: (
      <>
        Ask your insurance agent to send the COI straight to the broker, with that broker named as certificate
        holder. A certificate that comes from your agent is much harder to fake or misuse.
      </>
    ),
  },
  {
    title: "Never post your COI publicly",
    body: (
      <>
        Don&apos;t share it in Facebook groups, on load boards or in screenshots. Anything public can be copied and
        edited.
      </>
    ),
  },
  {
    title: "Send a private link instead of an attachment",
    body: (
      <>
        <a href="/my-documents" style={a}>My Documents</a> keeps your paperwork in one private place, and you can send
        a broker a link instead of emailing copies that get forwarded around.
      </>
    ),
  },
  {
    title: "Watch your authority and insurance every day",
    body: (
      <>
        If someone is using your identity, changes to your FMCSA record can be an early sign.{" "}
        <a href="/authority-watch" style={a}>Authority Watch</a> checks your status every morning for free and alerts
        you if anything changes.
      </>
    ),
  },
];

export default function CoiTheftPost() {
  return (
    <article>
      <div style={{ background: "#14181f", borderRadius: 16, padding: "32px 28px", marginBottom: 28, color: "#fff" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>
          Cargo Theft · Nov 15, 2026
        </p>
        <h1 style={{ fontSize: 26, lineHeight: 1.3, margin: "0 0 12px" }}>
          How Cargo Thieves Use Stolen Insurance Certificates, and How to Protect Yours
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#c7ccd6", maxWidth: 580, margin: 0 }}>
          Your certificate of insurance proves you&apos;re a real carrier. That&apos;s exactly why thieves want it.
        </p>
      </div>

      <h2 style={h2}>Cargo theft has gone digital</h2>
      <p style={p}>
        Cargo theft is at record levels. CargoNet counted 1,120 incidents and more than $121 million in estimated
        losses in just the first five months of 2026, according to Insurance Journal. More and more of it is
        &quot;strategic theft&quot;: instead of breaking into a trailer, thieves pose as a legitimate carrier or
        broker and get the load handed to them.
      </p>
      <p style={p}>
        Once freight is gone, it rarely comes back. In an American Transportation Research Institute survey reported
        by Overdrive, carriers said about 73% of cargo stolen from them was never recovered. Prevention is the only
        defense that reliably works.
      </p>

      <h2 style={h2}>Why your COI is a target</h2>
      <p style={p}>
        A certificate of insurance carries your company name, MC and DOT numbers, insurer, policy numbers and
        contact details. That&apos;s nearly everything a thief needs to pretend to be you. With a copy, they can
        swap in their own phone number and email, present themselves to a broker as your company, and haul off a
        load under your name. You may not find out until a broker or the police call you.
      </p>
      <p style={p}>
        That&apos;s why trucking security experts now tell owner-operators to treat their COI like sensitive
        information, not a flyer to hand out to anyone who asks.
      </p>

      <h2 style={h2}>Six ways carriers can protect their COI</h2>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {carrierSteps.map((s) => (
          <li key={s.title} style={{ ...li, marginBottom: 16 }}>
            <b style={{ color: "#14181f" }}>{s.title}.</b> {s.body}
          </li>
        ))}
      </ol>

      <h2 style={h2}>For brokers: don&apos;t trust a COI the carrier sends you</h2>
      <p style={p}>
        A certificate emailed by a &quot;carrier&quot; can be doctored. Get it from the insurance agent or a trusted
        third party, check that the contact details match the carrier&apos;s FMCSA record, and confirm FMCSA shows
        insurance on file with a <a href="/check-broker" style={a}>free carrier check</a>. Every check on Nightlane
        is also <a href="/verify" style={a}>saved on the Cardano blockchain</a> with the date, so you have permanent
        proof of what FMCSA showed when you booked.
      </p>

      <h2 style={h2}>Where this is heading</h2>
      <p style={p}>
        Today, carriers are stuck: brokers need proof of insurance, but every copy of a COI you send is a copy that
        can be stolen. Nightlane is working on a way for carriers to prove their coverage meets a broker&apos;s
        minimum without handing over the certificate at all.
      </p>

      <DispatchNudge
        title="Want someone guarding your paperwork while you drive?"
        body="Steady Wake Dispatch checks every broker before booking and only shares your insurance certificate with brokers it has verified."
      />

      <p style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.6, marginTop: 28 }}>
        Sources:{" "}
        <a href="https://www.insurancejournal.com/magazines/mag-features/2026/11/09/891544.htm" style={a}>Insurance Journal on record cargo theft</a>;{" "}
        <a href="https://www.overdriveonline.com/partners-in-business/article/15769312/freight-theft-new-reports-findings-up-the-ante-on-prevention" style={a}>Overdrive on ATRI&apos;s cargo theft findings</a>;{" "}
        <a href="https://www.overdriveonline.com/overdrive-extra/article/15291675/http:/www.transunion.com/credit-freeze" style={a}>Overdrive on safeguarding your certificate of insurance</a>;{" "}
        <a href="https://www.overdriveonline.com/partners-in-business/article/15304040/dont-be-a-victim-how-to-guard-both-personal-and-business-identity-to-prevent-theft" style={a}>Overdrive on guarding business identity</a>;{" "}
        <a href="https://www.dat.com/blog/?p=16893" style={a}>DAT on verifying carrier insurance</a>.
        This article is general information, not legal or insurance advice.
      </p>
    </article>
  );
}
