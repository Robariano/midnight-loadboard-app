// Tells search engines what to crawl (served at /robots.txt).
// Private pages (admin, accounts, shared documents, confirmation links) stay out.
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/account", "/my-documents", "/shared/", "/confirm/", "/reverify/", "/reset-password", "/forgot-password", "/login"],
    },
    sitemap: "https://www.nightlaneloads.com/sitemap.xml",
  };
}
