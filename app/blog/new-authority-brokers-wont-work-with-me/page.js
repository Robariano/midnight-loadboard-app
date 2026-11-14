import DispatchNudge from "../../shared/DispatchNudge";

export const metadata = {
  title: "New Authority? Why Brokers Turn You Down, and How to Get Loads Anyway | Nightlane",
  description:
    "Brand-new carrier authority and brokers keep saying no? Why brokers set minimum authority ages, what they check in your setup packet, and six ways to start booking loads now.",
};

const h2 = { color: "#14181f", fontSize: 21, lineHeight: 1.3, margin: "32px 0 10px" };
const p = { color: "#374151", fontSize: 15, lineHeight: 1.75, margin: "0 0 14px" };
const li = { color: "#374151", fontSize: 15, lineHeight: 1.7, marginBottom: 8 };
const a = { color: "#1d4ed8" };

const steps = [
  {
    title: "Make your FMCSA record match your packet",
    body: (
      <>
        Brokers compare your setup packet against FMCSA&apos;s record. Your legal name, phone, email and address
        should match exactly. If your MCS-150 shows 0 power units, update it: many vetting tools flag that. Look
        yourself up on <a href="/check-broker" style={a}>Check FMCSA Registration</a> the way a broker would.
      </>
    ),
  },
  {
    title: "Have your setup packet ready before you call",
    body: (
      <>
        Keep your W-9, certificate of insurance, authority letter and (if you factor) notice of assignment in one
        place so you can send them in minutes. <a href="/my-documents" style={a}>My Documents</a> holds them for free.
      </>
    ),
  },
  {
    title: "Carry the insurance brokers actually ask for",
    body: (
      <>
        FMCSA&apos;s minimum for general freight in trucks over 10,001 lbs is $750,000 in liability, but many brokers
        want $1,000,000 in auto liability and $100,000 or more in cargo coverage. Ask your agent before you start
        calling, not after a broker turns you down.
      </>
    ),
  },
  {
    title: "Look like a real business",
    body: (
      <>
        An email on your own domain, a phone that gets answered and a complete packet all separate you from the
        fraud brokers are screening out. Consistency across every document matters more than anything fancy.
      </>
    ),
  },
  {
    title: "Work the brokers who take new authorities",
    body: (
      <>
        Plenty of brokers will set up a carrier on day one; others wait 30, 60 or 90 days, and some wait 6 to 12
        months. Smaller brokers and direct relationships tend to be more flexible than the largest firms. Keep a
        list of who said yes, and go back to the ones who said &quot;not yet&quot; once you pass their cutoff.
      </>
    ),
  },
  {
    title: "Plan for slow pay, and don't race to the bottom",
    body: (
      <>
        Brokers commonly pay in 30 to 45 days, so many new carriers use factoring to keep fuel money coming in.
        Whatever you do, don&apos;t haul below your cost per mile just to get a broker to say yes: a cheap load
        that loses money doesn&apos;t build a business.
      </>
    ),
  },
];

export default function NewAuthorityPost() {
  return (
    <article>
      <div style={{ background: "#14181f", borderRadius: 16, padding: "32px 28px", marginBottom: 28, color: "#fff" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px" }}>
          For Owner-Operators · Nov 14, 2026
        </p>
        <h1 style={{ fontSize: 26, lineHeight: 1.3, margin: "0 0 12px" }}>
          New Authority? Why Brokers Turn You Down, and How to Get Loads Anyway
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#c7ccd6", maxWidth: 580, margin: 0 }}>
          Being told you&apos;re &quot;too new&quot; is normal in your first months. It isn&apos;t personal, and it
          doesn&apos;t mean you can&apos;t book freight now.
        </p>
      </div>

      <h2 style={h2}>Why brokers say no to new authorities</h2>
      <p style={p}>
        It comes down to fraud. Double brokering and identity theft cluster in brand-new carrier numbers, so many
        brokers set a minimum authority age before they&apos;ll book you. Some want 30 to 90 days; some larger
        firms want 6 months or a year. Many others will set you up the day your authority goes active.
      </p>
      <p style={p}>
        A broker turning you down is screening out risk, not judging you. Your job is to look as little like that
        risk as possible, and to spend your time on the brokers who will say yes.
      </p>

      <h2 style={h2}>What a broker checks when you send your packet</h2>
      <ul style={{ paddingLeft: 20, margin: "0 0 14px" }}>
        <li style={li}><b>Active authority on SAFER,</b> FMCSA&apos;s public record, not just an active USDOT number.</li>
        <li style={li}><b>Insurance on file</b> that meets their minimums, with a certificate naming them as holder.</li>
        <li style={li}><b>A W-9 and your authority letter,</b> with the same legal name as FMCSA shows.</li>
        <li style={li}><b>Contact details that match</b> FMCSA&apos;s record, since mismatches are a common fraud sign.</li>
        <li style={li}><b>A notice of assignment</b> if you factor, so they know where to send payment.</li>
      </ul>

      <h2 style={h2}>Six ways to start booking loads now</h2>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {steps.map((s) => (
          <li key={s.title} style={{ ...li, marginBottom: 16 }}>
            <b style={{ color: "#14181f" }}>{s.title}.</b> {s.body}
          </li>
        ))}
      </ol>

      <h2 style={h2}>Watch your authority while you wait</h2>
      <p style={p}>
        New authorities are also the most likely to hit a registration problem, like an insurance filing that
        doesn&apos;t match FMCSA&apos;s record. <a href="/authority-watch" style={a}>Authority Watch</a> checks your
        status every morning for free and alerts you if anything changes.
      </p>

      <DispatchNudge
        title="Want someone to do the broker legwork for you?"
        body="Steady Wake Dispatch knows which brokers set up new authorities, handles your setup packets and negotiates every rate."
      />

      <p style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.6, marginTop: 28 }}>
        Sources: <a href="https://www.fmcsa.dot.gov/registration/insurance-filing-requirements" style={a}>FMCSA insurance filing requirements</a>;{" "}
        <a href="https://www.ttnews.com/articles/fmcsa-truck-insurance-minimums" style={a}>Transport Topics on FMCSA insurance minimums</a>;{" "}
        <a href="https://www.wexfordins.com/post/why-brokers-reject-new-authority-carriers" style={a}>Wexford Insurance on why brokers reject new authorities</a>.
        Broker requirements vary; check each broker&apos;s carrier packet. This article is general information, not legal or insurance advice.
      </p>
    </article>
  );
}
