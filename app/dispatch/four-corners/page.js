import { SteadyWakePage, PhoneRibbon, dispatchHref } from "../_shared";

// One local page for the towns Steady Wake serves, instead of thin
// near-duplicate city pages. Served at steadywakedispatch.com/four-corners
// (see middleware.js). Keep claims to what's true: towns, highways, and
// the equipment and terms the rest of the site already states.
export const metadata = {
  title: "Truck Dispatch in the Four Corners: Farmington, Durango, Cortez, Gallup | Steady Wake Dispatch",
  description:
    "Local truck dispatch for owner-operators in Farmington, Aztec, Bloomfield, Durango, Cortez, Pagosa Springs, Gallup and Grand Junction. Flatbed, hotshot, dry van, reefer and box truck. First load free, then 7% after you're paid.",
};

const towns = [
  ["Farmington, Aztec & Bloomfield, NM", "San Juan County, on US-64 and US-550. Oilfield, construction and general freight for hotshot, flatbed and box trucks."],
  ["Durango, Bayfield & Ignacio, CO", "La Plata County, where US-160 meets US-550. Building materials, construction and general freight in and out of the mountains."],
  ["Cortez & Dolores, CO", "Montezuma County, on US-160 and US-491. Loads that keep you close to home or start your week toward Albuquerque, Phoenix or Denver."],
  ["Pagosa Springs & Arboles, CO", "Archuleta County, on US-160. Small fleets and one-truck operators who want someone else on the load boards."],
  ["Gallup, NM", "McKinley County, right on I-40. Long-haul lanes east to Texas and west to Arizona."],
  ["Grand Junction & Fruita, CO", "Mesa County, on I-70. Flatbed, hotshot and dry van freight along the Western Slope and toward Denver and Utah."],
];

export default function FourCorners() {
  return (
    <SteadyWakePage active="">
      <section style={{ paddingTop: 32 }}>
        <p className="swd-eyebrow">Serving the Four Corners</p>
        <h1 className="swd-h">A local dispatcher for Four Corners owner-operators</h1>
        <p className="swd-lede">
          I&apos;m based here, and I dispatch for owner-operators who live here. I know what it means to want loads
          that get you home, and which brokers will set up a carrier with a brand-new authority.
        </p>
      </section>

      <section style={{ paddingTop: 20 }} aria-label="Towns served">
        <div className="swd-services">
          {towns.map(([t, d]) => (
            <div className="swd-svc" key={t}>
              <div>
                <b>{t}</b>
                <span>{d}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="h-what">
        <p className="swd-eyebrow">What I do</p>
        <h3 id="h-what">You drive. I handle the rest.</h3>
        <div className="swd-prose">
          <p>
            I find loads that fit your equipment, your lanes and your home time, negotiate every rate, check every broker
            on FMCSA before booking, and handle the setup packets and paperwork. Flatbed, step deck, hotshot, dry van,
            reefer, box truck and cargo van, across the Four Corners and into Texas.
          </p>
          <p>
            Every load is booked under your authority, and nothing books without your OK. Your first load is free. After
            that it&apos;s 7%, only after the broker pays you, with no fee on detention or lumper pay.
          </p>
        </div>
      </section>

      <section className="swd-cta" style={{ paddingTop: 28 }}>
        <a className="swd-btn" href={dispatchHref("/contact")}>
          Get my first load free
        </a>
      </section>

      <PhoneRibbon />
    </SteadyWakePage>
  );
}
