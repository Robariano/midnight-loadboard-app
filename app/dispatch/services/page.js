import { SteadyWakePage, PhoneRibbon, dispatchHref } from "../_shared";

export const metadata = {
  title: "Dispatch Services | Steady Wake Dispatch",
  description:
    "Load booking, rate negotiation, FMCSA broker checks, route planning and paperwork for dry van and flatbed owner-operators. 7% per load, paid after the broker pays you.",
};

const services = [
  ["Load booking", "Finding solid freight that fits your equipment, your lanes and your schedule."],
  ["Every rate negotiated", "I counter every offer and push for a rate that actually pays your truck."],
  ["Broker checks", "Every broker checked on FMCSA before you commit: active authority, matching name and MC, and bond on file."],
  ["Route planning", "Cutting deadhead miles and keeping your truck moving and earning."],
  ["Planned around your hours", "Loads that fit your legal hours and your home time. I won't push you to run past your clock."],
  ["Paperwork", "Rate confirmations, broker setup packets and load documents handled for you."],
  ["Direct communication", "Fast, honest answers from me. No runaround, no ghosting."],
  ["Load securement know-how", "Flatbed blocking and bracing learned in the Navy, so I know what your load needs."],
];

export default function DispatchServices() {
  return (
    <SteadyWakePage active="Services">
      <section style={{ paddingTop: 32 }}>
        <p className="swd-eyebrow">Services</p>
        <h1 className="swd-h">Everything between pickup and delivery</h1>
        <p className="swd-lede">
          You drive. I handle the freight hunting, the brokers and the paperwork. Dry van and flatbed.
        </p>
      </section>

      <section style={{ paddingTop: 20 }} aria-label="What's included">
        <div className="swd-services">
          {services.map(([t, d]) => (
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

      <section aria-labelledby="h-authority">
        <p className="swd-note" id="h-authority">
          Freight can only be booked in the name of whoever holds the operating authority. If you run under someone
          else&apos;s authority, dispatch has to be arranged with that carrier. It&apos;s still worth reaching out, and
          we can talk it through.
        </p>
      </section>

      <section className="swd-cta" style={{ paddingTop: 28 }}>
        <a className="swd-btn" href={dispatchHref("/contact")}>
          Get started
        </a>
      </section>

      <PhoneRibbon />
    </SteadyWakePage>
  );
}
