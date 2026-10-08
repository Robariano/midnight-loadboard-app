// Shared look and layout for Steady Wake Dispatch, Rob's dispatch business
// (steadywakedispatch@gmail.com, (970) 903-9226, Durango, CO).
//
// The site is built around the family story: Rob's grandfather Gerald Ariano and great-uncle Martin Ariano
// started Southern Colorado Distributing in 1933, and the design borrows the
// look of a 1930s poster (aged paper, dark ink, oxblood red, brass).
//
// It lives inside this app (app/dispatch/*) so it can reuse the lead form
// backend and admin panel, and middleware.js serves it on
// steadywakedispatch.com with clean URLs (/, /services, /about, /contact).
// On that domain app/layout.js drops the Nightlane header, so the two
// businesses stay completely separate. dispatchHref() builds the right link
// for whichever domain the page is being viewed on.
import { headers } from "next/headers";
import SourceTracker from "./_SourceTracker";

const STEADY_WAKE_HOSTS = new Set(["steadywakedispatch.com", "www.steadywakedispatch.com"]);

// path is "" (home), "/services", "/about", or "/contact".
export function dispatchHref(path = "") {
  let host = "";
  try {
    host = (headers().get("host") || "").split(":")[0].toLowerCase();
  } catch {
    host = "";
  }
  if (STEADY_WAKE_HOSTS.has(host)) {
    return path === "" ? "/" : path;
  }
  return `/dispatch${path}`;
}

export const BRAND = {
  name: "Steady Wake Dispatch",
  phone: "(970) 903-9226",
  phoneHref: "tel:+19709039226",
  email: "steadywakedispatch@gmail.com",
  location: "Durango, Colorado",
};

export const PHOTO = {
  src: "/steady-wake/warehouse-1933.jpg",
  width: 1400,
  height: 929,
  alt: "Old brick beer warehouse with wooden kegs stacked on the loading dock and a sign reading Southern Colo. Distb., Martin Ariano, Mgr.",
  caption: "Where it started: the warehouse my grandfather Gerald Ariano and his brother Martin ran in Southern Colorado.",
};

// "Now" photo shown beside the 1933 warehouse: the A. Coors building on
// Main Avenue in Durango (photo by Rob, Oct 2026).
export const NOW_PHOTO = {
  src: "/steady-wake/coors-building-durango.jpg?v=3",
  width: 1400,
  height: 929,
  alt: "Red brick building on Main Avenue in Durango with A. Coors A.D. 1900 carved at the top, under a blue sky with a yellow fall tree out front.",
  caption: "The A. Coors building (1900) on Main Avenue in Durango, the town where I made deliveries from age 14.",
};

const CSS = `
.swd{--paper:#e6d8b9;--paper-2:#dccaa4;--ink:#2a1d12;--ink-soft:#5f4a33;--oxblood:#7a2e1f;--oxblood-dark:#5a2116;
  --brass:#96703a;--rule:#8c7350;--cream:#f1e6cc;
  --f-display:"Bodoni Moda","Bodoni 72",Didot,Georgia,serif;
  --f-body:"Libre Caslon Text",Baskerville,"Book Antiqua",Georgia,serif;
  --f-ledger:"Courier Prime","Courier New",Courier,monospace;
  min-height:100vh;color:var(--ink);font:17px/1.65 var(--f-body);padding:0 16px 48px;
  background:var(--paper);
  background-image:radial-gradient(ellipse at center,transparent 55%,rgba(110,80,40,.22) 100%),
    repeating-linear-gradient(0deg,rgba(90,60,30,.025) 0 2px,transparent 2px 5px);}
.swd *{box-sizing:border-box}
.swd a{color:var(--oxblood)}
.swd :focus-visible{outline:2px solid var(--oxblood);outline-offset:3px}
.swd-page{max-width:880px;margin:0 auto;border-left:1px solid var(--rule);border-right:1px solid var(--rule);
  padding:24px clamp(16px,5vw,56px) 36px;background:rgba(241,230,204,.35)}
.swd-mast{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:6px 18px;
  font:700 .78rem/1.3 var(--f-ledger);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft);
  border-bottom:3px double var(--ink);padding-bottom:10px}
.swd-mast b{color:var(--oxblood)}
.swd-mast a{text-decoration:none}
.swd-nav{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 22px;padding:12px 0;border-bottom:1px solid var(--rule)}
.swd-nav a{font:700 .8rem var(--f-ledger);letter-spacing:.14em;text-transform:uppercase;text-decoration:none;color:var(--ink);padding:4px 0;border-bottom:2px solid transparent}
.swd-nav a[aria-current="page"]{color:var(--oxblood);border-bottom-color:var(--oxblood)}
.swd-brand{font:800 clamp(2.1rem,6.4vw,3.6rem)/1 var(--f-display);text-align:center;margin:28px 0 0;text-wrap:balance}
.swd-brand small{display:block;font:500 italic clamp(1rem,2.6vw,1.25rem)/1.4 var(--f-display);color:var(--ink-soft);margin-top:10px}
.swd-photo{border:6px solid var(--ink);outline:1px solid var(--ink);outline-offset:4px;background:var(--ink);margin:28px 6px 0}
.swd-photo img{display:block;width:100%;height:auto}
.swd-cap{font:italic .95rem/1.4 var(--f-body);color:var(--ink-soft);text-align:center;margin:12px 0 0}
.swd-pair{display:grid;gap:30px;margin-top:28px;align-items:start}
.swd-pair figure{margin:0}
.swd-pair .swd-photo{margin:0 6px}
.swd-tag{display:block;text-align:center;font:700 .78rem/1 var(--f-ledger);letter-spacing:.18em;text-transform:uppercase;color:var(--oxblood);margin:0 0 12px}
@media (min-width:760px){.swd-pair{grid-template-columns:1fr 1fr;gap:26px}}
.swd-thesis{text-align:center;display:grid;gap:12px;justify-items:center;margin-top:24px}
.swd-thesis h2{margin:0;font:800 clamp(2rem,6vw,3.3rem)/1.04 var(--f-display);text-wrap:balance}
.swd-thesis h2 .a{color:var(--brass);display:block}
.swd-thesis h2 .b{color:var(--oxblood);display:block}
.swd-thesis p{margin:0;max-width:60ch;font-size:1.06rem}
.swd-orn{display:flex;align-items:center;gap:12px;justify-content:center}
.swd-orn::before,.swd-orn::after{content:"";height:1px;width:min(160px,28vw);background:var(--rule)}
.swd-orn span{width:10px;height:10px;background:var(--oxblood);transform:rotate(45deg)}
.swd-ribbon{position:relative;background:var(--oxblood);color:var(--cream);margin:26px 22px 0;padding:14px 18px;
  display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px 16px;text-align:center}
.swd-ribbon::before,.swd-ribbon::after{content:"";position:absolute;top:0;bottom:0;width:22px;background:var(--oxblood-dark)}
.swd-ribbon::before{left:-22px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,45% 50%)}
.swd-ribbon::after{right:-22px;clip-path:polygon(0 0,100% 0,55% 50%,100% 100%,0 100%)}
.swd-ribbon .lbl{font:700 .78rem var(--f-ledger);letter-spacing:.16em;text-transform:uppercase;opacity:.85}
.swd-ribbon a{color:var(--cream);text-decoration:none;font:800 clamp(1.4rem,4.4vw,1.9rem)/1 var(--f-display)}
.swd section{padding-top:44px}
.swd-eyebrow{font:700 .78rem var(--f-ledger);letter-spacing:.16em;text-transform:uppercase;color:var(--oxblood);margin:0 0 6px}
.swd h1.swd-h,.swd h3{font:800 clamp(1.6rem,4.2vw,2.2rem)/1.1 var(--f-display);margin:0 0 18px;text-wrap:balance}
.swd-lede{max-width:60ch;margin:0 0 8px}
.swd-ledger{border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}
.swd-entry{display:grid;grid-template-columns:118px 1fr;gap:18px;padding:16px 0;border-bottom:1px dashed var(--rule)}
.swd-entry:last-child{border-bottom:0}
.swd-entry .when{font:700 .95rem/1.4 var(--f-ledger);color:var(--oxblood);letter-spacing:.04em;padding-top:3px}
.swd-entry h4{margin:0 0 4px;font:700 1.08rem/1.3 var(--f-body)}
.swd-entry p{margin:0;color:var(--ink-soft)}
.swd-entry.now .when{color:var(--cream);background:var(--oxblood);align-self:start;justify-self:start;padding:3px 8px}
.swd-entry.now h4{color:var(--oxblood)}
.swd-services{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 34px}
.swd-svc{padding:14px 0;border-top:1px solid var(--rule);display:grid;grid-template-columns:20px 1fr;gap:12px}
.swd-svc::before{content:"";width:9px;height:9px;margin-top:9px;background:var(--brass);transform:rotate(45deg)}
.swd-svc b{display:block;font:700 1.02rem/1.35 var(--f-body)}
.swd-svc span{color:var(--ink-soft);font-size:.96rem}
.swd-terms{border:2px solid var(--ink);outline:1px solid var(--ink);outline-offset:-7px;padding:26px clamp(18px,4vw,34px);
  background:rgba(241,230,204,.55);display:grid;grid-template-columns:auto 1fr;gap:10px 28px;align-items:center}
.swd-terms .big{font:800 clamp(3.4rem,10vw,5rem)/1 var(--f-display);color:var(--oxblood)}
.swd-terms ul{margin:0;padding-left:1.1em}
.swd-terms li{margin:3px 0}
.swd-steps{counter-reset:s;display:grid;margin:0;padding:0;list-style:none}
.swd-steps li{counter-increment:s;display:grid;grid-template-columns:48px 1fr;gap:14px;padding:14px 0;border-top:1px solid var(--rule)}
.swd-steps li::before{content:counter(s);font:800 1.7rem/1 var(--f-display);color:var(--brass)}
.swd-steps b{display:block}
.swd-steps span{color:var(--ink-soft)}
.swd-facts{display:grid;grid-template-columns:auto 1fr;gap:8px 20px;margin:0 0 8px;padding:18px 0;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}
.swd-facts dt{font:700 .8rem/1.6 var(--f-ledger);letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft)}
.swd-facts dd{margin:0;font-weight:700}
.swd-prose p{max-width:62ch}
.swd-note{font-size:.92rem;color:var(--ink-soft);border-left:3px solid var(--brass);padding:4px 0 4px 14px;max-width:62ch}
.swd-cta{text-align:center;display:grid;gap:12px;justify-items:center}
.swd-btn{display:inline-block;background:var(--oxblood);color:var(--cream) !important;text-decoration:none;padding:13px 26px;
  font:700 .85rem var(--f-ledger);letter-spacing:.14em;text-transform:uppercase}
.swd-btn:hover{background:var(--oxblood-dark)}
.swd-contactline{display:flex;flex-wrap:wrap;gap:8px 28px;padding:16px 0;margin-bottom:22px;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.swd-contactline span{display:block;font:700 .74rem var(--f-ledger);letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)}
.swd-contactline a,.swd-contactline b{font-weight:700;text-decoration:none}
.swd-footer{margin-top:40px;padding-top:14px;border-top:3px double var(--ink);text-align:center;
  font:700 .74rem var(--f-ledger);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-soft)}
@media (max-width:640px){
  .swd{font-size:16px}
  .swd-services{grid-template-columns:1fr}
  .swd-entry{grid-template-columns:1fr;gap:4px}
  .swd-terms{grid-template-columns:1fr}
  .swd-facts{grid-template-columns:1fr;gap:2px}
  .swd-facts dd{margin-bottom:8px}
  .swd-ribbon{margin-inline:18px}
}
`;

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,600;0,6..96,800;1,6..96,500&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Courier+Prime:wght@400;700&display=swap";

const navLinks = [
  { path: "", label: "Home" },
  { path: "/services", label: "Services" },
  { path: "/about", label: "Our Story" },
  { path: "/contact", label: "Contact" },
];

// Wraps every Steady Wake page: fonts, styles, masthead, nav and footer.
export function SteadyWakePage({ active, children }) {
  return (
    <div className="swd">
      <link rel="stylesheet" href={FONTS} />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <SourceTracker />
      <div className="swd-page">
        <header className="swd-mast">
          <span>
            <b>{BRAND.name}</b> · {BRAND.location}
          </span>
          <a href={BRAND.phoneHref}>{BRAND.phone}</a>
        </header>
        <nav className="swd-nav" aria-label="Steady Wake Dispatch">
          {navLinks.map((l) => (
            <a key={l.path} href={dispatchHref(l.path)} aria-current={active === l.label ? "page" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        {children}
        <footer className="swd-footer">
          {BRAND.name} · {BRAND.location} · Navy veteran owned · {BRAND.email}
        </footer>
      </div>
    </div>
  );
}

// The 1933 warehouse ("Then") beside today's A. Coors building in Durango ("Now").
export function ThenNow() {
  return (
    <div className="swd-pair">
      <figure>
        <span className="swd-tag">Then · 1933</span>
        <div className="swd-photo">
          <img src={PHOTO.src} alt={PHOTO.alt} width={PHOTO.width} height={PHOTO.height} />
        </div>
        <figcaption className="swd-cap">{PHOTO.caption}</figcaption>
      </figure>
      <figure>
        <span className="swd-tag">Now · Durango</span>
        <div className="swd-photo">
          <img src={NOW_PHOTO.src} alt={NOW_PHOTO.alt} width={NOW_PHOTO.width} height={NOW_PHOTO.height} loading="lazy" />
        </div>
        <figcaption className="swd-cap">{NOW_PHOTO.caption}</figcaption>
      </figure>
    </div>
  );
}

export function PhoneRibbon() {
  return (
    <div className="swd-ribbon">
      <span className="lbl">Call or text</span>
      <a href={BRAND.phoneHref}>{BRAND.phone}</a>
    </div>
  );
}

export function Ornament() {
  return (
    <div className="swd-orn" aria-hidden="true">
      <span />
    </div>
  );
}
