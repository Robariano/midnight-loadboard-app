// List of public pages for search engines (served at /sitemap.xml).
const BASE = "https://www.nightlaneloads.com";

const PAGES = [
  "", "/check-broker", "/confirm-coverage", "/roadside", "/carriers", "/loads",
  "/get-verified", "/post-load", "/dispatch", "/nightwatch", "/revoked-carriers",
  "/blog/chameleon-carriers-tql-chrobinson-lawsuit", "/terms-of-service", "/privacy-policy",
];

export default function sitemap() {
  return PAGES.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "weekly" : "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
