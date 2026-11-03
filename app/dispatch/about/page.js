import { SteadyWakePage, PhoneRibbon, dispatchHref } from "../_shared";

export const metadata = {
  title: "Our Story | Steady Wake Dispatch",
  description:
    "From the loading dock to dispatch. Navy veteran Robert, with 11 years on the routes and in the warehouse for a beverage distributor. Dry van, reefer, flatbed, hotshot, box truck and cargo van.",
};

export default function DispatchAbout() {
  return (
    <SteadyWakePage active="Our Story">
      <section style={{ paddingTop: 32 }}>
        <p className="swd-eyebrow">Our story</p>
        <h1 className="swd-h">My road to dispatch</h1>
        <p className="swd-lede">
          I worked the dock and ran deliveries growing up, played college football, served in the Navy, and then spent
          11 years on the routes and in the warehouse for a beverage distributor. Now everything I learned goes to work for
          owner-operators.
        </p>
      </section>


      <section className="swd-prose swd-mom" aria-labelledby="h-memory">
        <p className="swd-eyebrow">The reason for all of it</p>
        <h3 id="h-memory">My mom, Alfreda Susie Hudson</h3>
        <p>
          Steady Wake exists because my mom never stopped looking out for me. Her support kept a roof over my head
          while I built this business. Every load I book carries a little of her with it.
        </p>
      </section>

      <section aria-labelledby="h-lineage">
        <p className="swd-eyebrow">The lineage</p>
        <h3 id="h-lineage">From the loading dock to dispatch</h3>
        <div className="swd-ledger">
          {[
            ["Age 6", "On the loading dock", "I'm the oldest kid, climbing on kegs and learning how freight moves."],
            ["Age 14", "Delivering", "I start running deliveries."],
            ["Age 18", "College football", "I leave home to play college football."],
            ["Age 23", "U.S. Navy", "Five years on an aircraft carrier in the weapons department. Then three years of shore duty at a Naval Weapons Station: two years blocking and bracing loads on civilian flatbed trucks, and a final year inspecting the trucks that hauled weapons to the carriers. When the cargo can't shift, you learn to do it right every time."],
            ["Ages 33 to 44", "Route driver", "Home from the Navy, I drive a beverage delivery route. Tight schedules, early mornings, no room for slacking."],
            ["Last 4 years", "On the warehouse floor", "Four days a week inside on shipping and receiving, building loads and getting trucks out on time. A lot of that time was in the keg room, where the warehouse manager ran temperature checks to keep the beer cold. Fridays I run kegs to the downtown bars. Nobody on the crew moved more kegs, or more weight, than I did."],
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
          <dd>Delivering since age 14. 11 years with a beverage distributor: route driver, then shipping and receiving in the warehouse</dd>
          <dt>Commitment</dt>
          <dd>Dispatch is my focus. When you call, I answer.</dd>
          <dt>Training</dt>
          <dd>Certified dispatcher</dd>
          <dt>Cold freight</dt>
          <dd>Years in a beverage warehouse keg room, where temperatures were checked to keep the product cold. I know what it takes to keep a reefer load cold.</dd>
          <dt>Freight</dt>
          <dd>Dry van, reefer, flatbed, hotshot, box truck and cargo van</dd>
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
