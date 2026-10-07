import { SteadyWakePage, PhoneRibbon, PHOTO, dispatchHref } from "../_shared";

export const metadata = {
  title: "Our Story | Steady Wake Dispatch",
  description:
    "Three generations moving freight, from Martin Ariano's warehouse in 1933 to Steady Wake Dispatch in Durango today. Navy veteran, active CDL, dry van and flatbed.",
};

export default function DispatchAbout() {
  return (
    <SteadyWakePage active="Our Story">
      <section style={{ paddingTop: 32 }}>
        <p className="swd-eyebrow">Our story</p>
        <h1 className="swd-h">Three generations moving freight</h1>
        <p className="swd-lede">
          I was the oldest kid in a freight family. I never really got to do anything else, and now everything I learned
          on the dock and on the road goes to work for owner-operators.
        </p>
      </section>

      <figure style={{ margin: 0 }}>
        <div className="swd-photo">
          <img src={PHOTO.src} alt={PHOTO.alt} width={PHOTO.width} height={PHOTO.height} />
        </div>
        <figcaption className="swd-cap">{PHOTO.caption}</figcaption>
      </figure>

      <section aria-labelledby="h-lineage">
        <p className="swd-eyebrow">The lineage</p>
        <h3 id="h-lineage">From the loading dock to dispatch</h3>
        <div className="swd-ledger">
          {[
            ["1933", "The family business opens", "My grandfather, Martin Ariano, starts Southern Colorado Distributing. Kegs on the dock, trucks out the door."],
            ["Age 6", "On the loading dock", "I'm the oldest kid, climbing on those kegs and learning how freight moves."],
            ["Age 14", "Delivering in Durango", "The family moves to Durango, and I start running deliveries."],
            ["U.S. Navy", "Blocking and bracing", "In the Navy I secured weapons on flatbed trucks. When the cargo can't shift, you learn to do it right every time."],
            ["Until 44", "Back behind the wheel", "Home from the Navy, I drove for the family business for decades. Tight schedules, early mornings, no room for slacking."],
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
          <dd>Delivering freight since age 14, including 12 years driving dry van in beverage distribution</dd>
          <dt>License</dt>
          <dd>Active CDL</dd>
          <dt>Training</dt>
          <dd>Certified dispatcher</dd>
          <dt>Freight</dt>
          <dd>Dry van and flatbed</dd>
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
