import { SteadyWakePage, PhoneRibbon, ThenNow, dispatchHref } from "../_shared";

export const metadata = {
  title: "Our Story | Steady Wake Dispatch",
  description:
    "Three generations moving freight, from the Ariano brothers' warehouse in Walsenburg to Steady Wake Dispatch in Durango today. Navy veteran with 11 years on the routes and in the warehouse at A&L Coors. Dry van, flatbed, hotshot, box truck and cargo van.",
};

export default function DispatchAbout() {
  return (
    <SteadyWakePage active="Our Story">
      <section style={{ paddingTop: 32 }}>
        <p className="swd-eyebrow">Our story</p>
        <h1 className="swd-h">Three generations moving freight</h1>
        <p className="swd-lede">
          I was the oldest kid in a freight family. I worked the dock and ran deliveries growing up, played college
          football, served in the Navy, and then came home to the family business. Now everything I learned goes to work
          for owner-operators.
        </p>
      </section>

      <ThenNow />

      <section aria-labelledby="h-lineage">
        <p className="swd-eyebrow">The lineage</p>
        <h3 id="h-lineage">From the loading dock to dispatch</h3>
        <div className="swd-ledger">
          {[
            ["Early days", "The family business", "My grandfather Gerald Ariano and his brother Martin run Southern Colorado Distributing out of the old Coors warehouse in Walsenburg. Kegs on the dock, trucks out the door."],
            ["Age 6", "On the loading dock", "I'm the oldest kid, climbing on those kegs and learning how freight moves."],
            ["Age 14", "Delivering in Durango", "The family moves to Durango, and I start running deliveries."],
            ["Age 18", "College football", "I leave Durango to play college football."],
            ["Age 23", "U.S. Navy: blocking and bracing", "In the Navy I secured weapons on flatbed trucks. When the cargo can't shift, you learn to do it right every time."],
            ["Ages 33 to 44", "Back to the family business", "Home from the Navy, I drive a beer route for A&L Coors in Durango. Tight schedules, early mornings, no room for slacking."],
            ["Last 4 years", "Running the warehouse", "Inside on shipping: receiving, building loads and getting trucks out on time. Every Friday I still run kegs to the downtown bars, right past the old A. Coors sign."],
          ].map(([when, title, body]) => (
            <div className="swd-entry" key={when}>
              <div className="when">{when}</div>
              <div>
                <h4>{title}</h4>
                <p>{body}</p>
              </div>
            </div>
          ))}
          <div className="swd-entry now">
            <div className="when">Today</div>
            <div>
              <h4>Steady Wake Dispatch</h4>
              <p>The first piece of this story that&apos;s all mine. I keep owner-operators loaded with good-paying freight.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="h-facts">
        <p className="swd-eyebrow">At a glance</p>
        <h3 id="h-facts">Who you&apos;re working with</h3>
        <dl className="swd-facts">
          <dt>Background</dt>
          <dd>U.S. Navy veteran</dd>
          <dt>Experience</dt>
          <dd>Delivering since age 14. 11 years at A&amp;L Coors in Durango: route driver, then shipping and receiving in the warehouse</dd>
          <dt>Commitment</dt>
          <dd>Dispatch is my focus. When you call, I answer.</dd>
          <dt>Training</dt>
          <dd>Certified dispatcher</dd>
          <dt>Freight</dt>
          <dd>Dry van, flatbed, hotshot, box truck and cargo van</dd>
        </dl>
      </section>

      <section className="swd-prose" aria-labelledby="h-why">
        <p className="swd-eyebrow">Why it matters</p>
        <h3 id="h-why">No load is worth driving unprotected</h3>
        <p>
          Early on, a carrier once asked me to drive a load under unclear insurance coverage, and the story he gave me
          about it didn&apos;t add up. When he then asked me to drive without being properly covered, I said no. That&apos;s
          part of why I personally check every broker against FMCSA&apos;s federal database before I book anything.
        </p>
        <p>
          Owner-operators deserve a dispatcher who&apos;s honest, answers the phone, and treats every load like it
          matters. If that&apos;s what you&apos;re looking for, <a href={dispatchHref("/contact")}>get in touch</a>.
        </p>
      </section>

      <PhoneRibbon />
    </SteadyWakePage>
  );
}
