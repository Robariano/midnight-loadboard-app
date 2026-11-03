// Shared look and layout for Steady Wake Dispatch, Rob's dispatch business
// (shane@steadywakedispatch.com, (970) 903-9226, Four Corners region).
//
// The site is built around the owner's own story. He now goes by Shane Hudson publicly. Per him: never mention or credit his father, never name
// Coors or A&L Coors (say "a beverage distributor"), never use the Ariano surname publicly, and
// don't frame Steady Wake as a family business. The design borrows the
// look of Rob's Facebook ads (dark navy, blue glow, red banners). The business is centered on and
// dedicated to his mom, Alfreda Susie Hudson (use her maiden name).
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
  email: "shane@steadywakedispatch.com",
  location: "Four Corners Region",
};

const CSS = `
.swd{--bg:#0a1430;--bg-2:#0f1e45;--ink:#eef4ff;--ink-soft:#a9bfe3;--red:#d21f35;--red-dark:#9e1426;--blue:#6ebeff;
  --amber:#f5a623;--rule:rgba(110,190,255,.35);--panel:rgba(10,22,55,.78);
  --f-display:"Inter","Helvetica Neue",Arial,sans-serif;--f-body:"Inter","Helvetica Neue",Arial,sans-serif;
  min-height:100vh;color:var(--ink);font:17px/1.65 var(--f-body);padding:0 16px 48px;
  background-color:#0a1430;background-image:radial-gradient(ellipse 120% 60% at 50% 0%,#1b3d8a 0%,rgba(15,30,69,.6) 50%,transparent 100%),linear-gradient(180deg,#0f1e45 0%,#070e24 100%);}
.swd *{box-sizing:border-box}
.swd a{color:var(--blue)}
.swd :focus-visible{outline:2px solid var(--amber);outline-offset:3px}
.swd-page{max-width:900px;margin:0 auto;padding:22px clamp(16px,5vw,48px) 36px}
.swd-mast{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 18px;
  font:700 .8rem/1.3 var(--f-body);letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft);
  border-bottom:1px solid var(--rule);padding-bottom:12px}
.swd-mast b{color:var(--ink)}
.swd-mast a{text-decoration:none;color:var(--amber)}
.swd-nav{display:flex;flex-wrap:wrap;justify-content:center;gap:4px 24px;padding:12px 0;border-bottom:1px solid var(--rule)}
.swd-nav a{font:700 .82rem var(--f-body);letter-spacing:.12em;text-transform:uppercase;text-decoration:none;color:var(--ink-soft);padding:4px 0;border-bottom:2px solid transparent}
.swd-nav a[aria-current="page"]{color:var(--ink);border-bottom-color:var(--red)}
.swd-brand{font:900 italic clamp(2.3rem,7vw,4rem)/1 var(--f-display);text-align:center;margin:30px 0 0;color:#fff;
  text-shadow:0 0 18px rgba(110,190,255,.9),0 0 42px rgba(60,140,255,.6);text-wrap:balance;letter-spacing:-.01em}
.swd-brand small{display:block;margin:18px auto 0;max-width:640px;font:800 italic clamp(.95rem,2.6vw,1.2rem)/1.3 var(--f-display);
  color:#fff;text-shadow:none;letter-spacing:.02em;text-transform:uppercase;background:var(--red);padding:12px 18px;
  transform:skewX(-8deg);box-shadow:0 0 22px rgba(210,31,53,.55)}
.swd-mom{margin:30px 0 0;padding:24px clamp(18px,4vw,32px);border:2px solid var(--amber);border-radius:16px;
  background:linear-gradient(180deg,rgba(245,166,35,.14),rgba(10,22,55,.85));box-shadow:0 0 26px rgba(245,166,35,.25);text-align:center}
.swd-mom .tag{font:800 .78rem var(--f-body);letter-spacing:.18em;text-transform:uppercase;color:var(--amber);margin:0 0 8px}
.swd-mom h2{margin:0 0 10px;font:900 clamp(1.5rem,4.6vw,2.3rem)/1.15 var(--f-display);color:#fff;text-wrap:balance}
.swd-mom p{margin:0 auto;max-width:62ch;color:var(--ink)}
.swd-thesis{text-align:center;display:grid;gap:12px;justify-items:center;margin-top:30px}
.swd-thesis h2{margin:0;font:900 italic clamp(1.9rem,5.6vw,3rem)/1.05 var(--f-display);text-wrap:balance}
.swd-thesis h2 .a{color:#fff;display:block;text-shadow:0 0 16px rgba(110,190,255,.7)}
.swd-thesis h2 .b{color:var(--blue);display:block}
.swd-thesis p{margin:0;max-width:62ch;font-size:1.04rem;color:var(--ink)}
.swd-orn{display:flex;align-items:center;gap:12px;justify-content:center}
.swd-orn::before,.swd-orn::after{content:"";height:2px;width:min(160px,28vw);background:linear-gradient(90deg,transparent,var(--blue))}
.swd-orn::after{background:linear-gradient(90deg,var(--blue),transparent)}
.swd-orn span{width:10px;height:10px;background:var(--red);transform:rotate(45deg);box-shadow:0 0 10px var(--red)}
.swd-ribbon{background:var(--red);color:#fff;margin:30px 0 0;padding:16px 18px;transform:skewX(-6deg);
  display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px 18px;text-align:center;box-shadow:0 0 26px rgba(210,31,53,.5)}
.swd-ribbon>*{transform:skewX(6deg)}
.swd-ribbon .lbl{font:800 .8rem var(--f-body);letter-spacing:.14em;text-transform:uppercase;opacity:.92}
.swd-ribbon a{color:#fff;text-decoration:none;font:900 clamp(1.5rem,4.6vw,2.1rem)/1 var(--f-display);text-shadow:0 0 12px rgba(255,255,255,.45)}
.swd section{padding-top:46px}
.swd-eyebrow{font:800 .78rem var(--f-body);letter-spacing:.18em;text-transform:uppercase;color:var(--amber);margin:0 0 6px}
.swd h1.swd-h,.swd h3{font:900 clamp(1.6rem,4.4vw,2.3rem)/1.12 var(--f-display);margin:0 0 18px;text-wrap:balance;color:#fff}
.swd-lede{max-width:62ch;margin:0 0 8px}
.swd-ledger{border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.swd-entry{display:grid;grid-template-columns:118px 1fr;gap:18px;padding:16px 0;border-bottom:1px dashed var(--rule)}
.swd-entry:last-child{border-bottom:0}
.swd-entry .when{font:800 .9rem/1.4 var(--f-body);color:var(--amber);letter-spacing:.04em;padding-top:3px}
.swd-entry h4{margin:0 0 4px;font:800 1.06rem/1.3 var(--f-body);color:#fff}
.swd-entry p{margin:0;color:var(--ink-soft)}
.swd-entry.now .when{color:#fff;background:var(--red);align-self:start;justify-self:start;padding:3px 8px;border-radius:4px}
.swd-entry.now h4{color:var(--amber)}
.swd-services{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.swd-svc{padding:16px 18px;border:1px solid var(--rule);border-radius:12px;background:var(--panel);
  box-shadow:0 0 14px rgba(60,140,255,.18);display:grid;grid-template-columns:18px 1fr;gap:10px}
.swd-svc::before{content:"";width:10px;height:10px;margin-top:8px;background:var(--blue);transform:rotate(45deg);box-shadow:0 0 8px var(--blue)}
.swd-svc b{display:block;font:800 1rem/1.35 var(--f-body);color:#fff}
.swd-svc span{color:var(--ink-soft);font-size:.95rem}
.swd-terms{border:2px solid var(--blue);border-radius:16px;padding:26px clamp(18px,4vw,34px);background:var(--panel);
  box-shadow:0 0 26px rgba(60,140,255,.35);display:grid;grid-template-columns:auto 1fr;gap:10px 30px;align-items:center}
.swd-terms .big{font:900 italic clamp(4rem,12vw,6rem)/1 var(--f-display);color:#fff;text-shadow:0 0 22px rgba(110,190,255,.9)}
.swd-terms ul{margin:0;padding-left:1.1em}
.swd-terms li{margin:4px 0}
.swd-steps{counter-reset:s;display:grid;margin:0;padding:0;list-style:none;gap:10px}
.swd-steps li{counter-increment:s;display:grid;grid-template-columns:52px 1fr;gap:14px;padding:14px 16px;border:1px solid var(--rule);border-radius:12px;background:var(--panel)}
.swd-steps li::before{content:counter(s);font:900 italic 1.9rem/1 var(--f-display);color:var(--blue);text-shadow:0 0 10px rgba(110,190,255,.7)}
.swd-steps b{display:block;color:#fff}
.swd-steps span{color:var(--ink-soft)}
.swd-facts{display:grid;grid-template-columns:auto 1fr;gap:10px 22px;margin:0 0 8px;padding:20px;border:1px solid var(--rule);border-radius:12px;background:var(--panel)}
.swd-facts dt{font:800 .78rem/1.6 var(--f-body);letter-spacing:.12em;text-transform:uppercase;color:var(--amber)}
.swd-facts dd{margin:0;font-weight:700;color:#fff}
.swd-prose p{max-width:64ch}
.swd-note{font-size:.92rem;color:var(--ink-soft);border-left:3px solid var(--amber);padding:4px 0 4px 14px;max-width:64ch}
.swd-cta{text-align:center;display:grid;gap:14px;justify-items:center}
.swd-btn{display:inline-block;background:var(--red);color:#fff !important;text-decoration:none;padding:14px 30px;border-radius:8px;
  font:900 .95rem var(--f-body);letter-spacing:.1em;text-transform:uppercase;box-shadow:0 0 20px rgba(210,31,53,.55)}
.swd-btn:hover{background:var(--red-dark)}
.swd-contactline{display:flex;flex-wrap:wrap;gap:10px 30px;padding:18px 20px;margin-bottom:22px;border:1px solid var(--rule);border-radius:12px;background:var(--panel)}
.swd-contactline span{display:block;font:800 .74rem var(--f-body);letter-spacing:.12em;text-transform:uppercase;color:var(--amber)}
.swd-contactline a,.swd-contactline b{font-weight:800;text-decoration:none;color:#fff}
.swd input,.swd textarea,.swd select{color:#14181f}
.swd-footer{margin-top:44px;padding-top:16px;border-top:1px solid var(--rule);text-align:center;
  font:700 .76rem/1.7 var(--f-body);letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft)}
.swd-footer .mom{display:block;margin-top:8px;color:var(--amber);text-transform:none;letter-spacing:.02em;font-size:.86rem}
@media (max-width:640px){
  .swd{font-size:16px}
  .swd-services{grid-template-columns:1fr}
  .swd-entry{grid-template-columns:1fr;gap:4px}
  .swd-terms{grid-template-columns:1fr;text-align:center}
  .swd-terms ul{text-align:left}
  .swd-facts{grid-template-columns:1fr;gap:2px}
  .swd-facts dd{margin-bottom:8px}
}
`;

const FONTS =
  "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,600;0,700;0,800;0,900;1,800;1,900&display=swap";

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
          {BRAND.name} · {BRAND.location} · Navy veteran owned · Master&apos;s in Project Management · {BRAND.email}
          <br />
          Independently owned and operated by Shane Hudson. Not affiliated with any other company or family business.
          <span className="mom">Dedicated to my mom, Alfreda Susie Hudson. Her support kept me off the street while I built this.</span>
        </footer>
      </div>
    </div>
  );
}


export function PhoneRibbon() {
  return (
    <div className="swd-ribbon">
      <span className="lbl">Call or text</span>
      <a href={BRAND.phoneHref}>{BRAND.phone}</a>
      <span className="lbl">Text LOADS + your truck type + city</span>
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
