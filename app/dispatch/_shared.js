// Shared style tokens + sub-nav for Steady Wake Dispatch — Rob's real
// dispatch business (steadywakedispatch@gmail.com, (970) 903-9226,
// Durango, CO — the name on the actual client services agreement).
// This mini-site lives inside Nightlane's app (app/dispatch/*)
// so it reuses the working lead-capture backend and admin panel, but
// carries Steady Wake's own identity — amber accent instead of
// Nightlane's blue — rather than being folded into the
// platform's own brand.
//
// It's also served, via middleware.js at the repo root, as the real
// steadywakedispatch.com domain's own clean URLs (steadywakedispatch.com/,
// /services, /about, /contact) instead of only living under
// midnightloadboard.com/dispatch/*. dispatchHref() below builds the
// right link for whichever domain the page is currently being viewed on.
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
  location: "Durango, CO",
};

export const cardStyle = {
  background: "#f7f8fa",
  border: "1px solid #e2e5ea",
  borderRadius: 12,
  padding: 20,
};

export const primaryBtn = {
  display: "inline-block",
  padding: "14px 24px",
  background: "#92400e",
  color: "#fff",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
};

export const secondaryBtn = {
  display: "inline-block",
  padding: "14px 24px",
  background: "transparent",
  color: "#92400e",
  border: "1px solid #92400e",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
};

// Dark stat tile — a nod to the odometer-style figures on Rob's own
// draft site (steady-wake-website.html) without importing its full
// dark theme, which would clash with the rest of Nightlane's
// light chrome that wraps every page here.
export const statBox = {
  background: "#14181f",
  borderRadius: 12,
  padding: "18px 22px",
  color: "#fff",
  flex: 1,
  minWidth: 160,
};

const subNavLinks = [
  { path: "", label: "Home" },
  { path: "/services", label: "Services" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

export function DispatchSubNav({ active }) {
  return (
    <div>
      <SourceTracker />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#92400e",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Steady Wake Dispatch
        </p>
        <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
          {BRAND.location} ·{" "}
          <a href={BRAND.phoneHref} style={{ color: "#92400e", fontWeight: 700, textDecoration: "none" }}>
            {BRAND.phone}
          </a>
        </p>
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 32,
          borderBottom: "1px solid #e2e5ea",
          paddingBottom: 14,
        }}
      >
        {subNavLinks.map((l) => (
          <a
            key={l.path}
            href={dispatchHref(l.path)}
            style={{
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: 20,
              color: active === l.label ? "#fff" : "#92400e",
              background: active === l.label ? "#92400e" : "#fdf1e4",
            }}
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
