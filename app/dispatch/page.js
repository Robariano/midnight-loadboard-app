import { SteadyWakePage, PhoneRibbon, Ornament, ThenNow, dispatchHref } from "./_shared";

export const metadata = {
  title: "Steady Wake Dispatch | Freight Runs in the Family | Durango, CO",
  description:
    "Three generations in freight, since 1933. Navy veteran Robert Ariano dispatches dry van and flatbed loads for owner-operators out of Durango, Colorado. 7% per load.",
};

export default function DispatchHome() {
  return (
    <SteadyWakePage active="Home">
      <h1 className="swd-brand">
        Steady Wake Dispatch
        <small>Truck dispatching for owner-operators · Dry van &amp; flatbed</small>
      </h1>

      <ThenNow />

      <div className="swd-thesis">
        <h2>
          <span className="a">Freight runs</span>
          <span className="b">in the family</span>
        </h2>
        <Ornament />
        <p>
          My name is Robert Ariano. I climbed on my grandfather&apos;s kegs as a kid, started delivering at 14, blocked
          and braced flatbed loads in the Navy, and drove for the family business until I was 44. Now I dispatch for
          owner-operators, and I run your truck the way my family ran ours.
        </p>
      </div>

      <PhoneRibbon />

      <section aria-labelledby="h-do">
        <p className="swd-eyebrow">For owner-operators</p>
        <h3 id="h-do">What I handle for your truck</h3>
        <div className="swd-services">
          {[
            ["Finding and booking loads", "I work DAT, Truckstop and broker boards so you're not hunting freight from the cab."],
            ["Every rate negotiated", "I don't take the first offer. I counter to get your truck real money."],
            ["Brokers checked on FMCSA", "Active authority, matching name and MC, and bond on file before I book."],
            ["You approve every load", "I send you the details first. Nothing gets booked without your yes."],
            ["Planned around your hours", "Loads that fit your legal hours and your home time. I've been in the seat."],
            ["Dry van and flatbed", "New MCs welcome. I'll help you get set up with brokers from day one."],
          ].map(([t, d]) => (
            <div className="swd-svc" key={t}>
              <div>
                <b>{t}</b>
                <span>{d}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="h-terms">
        <p className="swd-eyebrow">Plain terms</p>
        <h3 id="h-terms">One fee, paid after you&apos;re paid</h3>
        <div className="swd-terms">
          <div className="big">7%</div>
          <ul>
            <li>7% of each load I book for you.</li>
            <li>No upfront fees and no setup charges.</li>
            <li>You pay after the broker pays you, within 3 business days.</li>
            <li>A short written agreement so we both know the deal.</li>
          </ul>
        </div>
      </section>

      <section aria-labelledby="h-start">
        <p className="swd-eyebrow">Getting started</p>
        <h3 id="h-start">How we get your truck rolling</h3>
        <ol className="swd-steps">
          <li>
            <div>
              <b>Call or text me</b>
              <span>Tell me what you pull, where you like to run, and how often you want to be home.</span>
            </div>
          </li>
          <li>
            <div>
              <b>I check your authority</b>
              <span>A quick look at your MC on SAFER, then we sign a simple dispatch agreement.</span>
            </div>
          </li>
          <li>
            <div>
              <b>Send your paperwork</b>
              <span>W-9, certificate of insurance and MC authority letter, so brokers can set you up.</span>
            </div>
          </li>
          <li>
            <div>
              <b>I start booking</b>
              <span>I find the loads, negotiate the rates and send them to you to approve.</span>
            </div>
          </li>
        </ol>
      </section>

      <section className="swd-cta" aria-labelledby="h-cta">
        <p className="swd-eyebrow">Talk to Robert</p>
        <h3 id="h-cta" style={{ marginBottom: 4 }}>Let&apos;s get your truck loaded</h3>
        <a className="swd-btn" href={dispatchHref("/contact")}>
          Get started
        </a>
        <p className="swd-note" style={{ textAlign: "left" }}>
          Steady Wake Dispatch works for carriers. I&apos;m a dispatcher, not a freight broker, so you sign every rate
          confirmation and get paid directly by the broker.
        </p>
      </section>
    </SteadyWakePage>
  );
}
