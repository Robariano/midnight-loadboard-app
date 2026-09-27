import { NextResponse } from "next/server";

// Lets steadywakedispatch.com (Rob's real, separately-registered domain
// for the dispatch business) serve clean URLs — steadywakedispatch.com/,
// /services, /about, /contact — for what is, under the hood, the
// app/dispatch/* section of this same app. Everything else (including
// cross-linked pages like /check-broker) is left untouched and just
// serves normally regardless of which domain it's requested through.
//
// dispatchHref() in app/dispatch/_shared.js builds links that match this
// map: clean paths on steadywakedispatch.com, /dispatch-prefixed paths
// everywhere else (e.g. midnightloadboard.com/dispatch).
const STEADY_WAKE_HOSTS = new Set(["steadywakedispatch.com", "www.steadywakedispatch.com"]);

const CLEAN_PATH_MAP = {
  "/": "/dispatch",
  "/services": "/dispatch/services",
  "/about": "/dispatch/about",
  "/contact": "/dispatch/contact",
};

export function middleware(request) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (!STEADY_WAKE_HOSTS.has(host)) return NextResponse.next();

  const target = CLEAN_PATH_MAP[request.nextUrl.pathname];
  if (!target) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/", "/services", "/about", "/contact"],
};
