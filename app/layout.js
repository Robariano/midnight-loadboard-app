import { headers } from "next/headers";

// steadywakedispatch.com is Rob's separate dispatch business. It is served
// from this same app (see middleware.js), but it must never show the
// Nightlane header or chrome, so the two businesses stay fully separate.
const STEADY_WAKE_HOSTS = new Set(["steadywakedispatch.com", "www.steadywakedispatch.com"]);

function isSteadyWakeHost() {
  try {
    const host = (headers().get("host") || "").split(":")[0].toLowerCase();
    return STEADY_WAKE_HOSTS.has(host);
  } catch {
    return false;
  }
}

const navLink = { color: "#1d4ed8", fontSize: 13, fontWeight: 700, textDecoration: "none" };
const footLink = { color: "#4b5568" };

export const metadata = {
  title: "Nightlane - Carrier Verification & Load Management",
};
export default function RootLayout({ children }) {
  if (isSteadyWakeHost()) {
    return (
      <html lang="en">
        <body style={{ margin: 0, background: "#e6d8b9", color: "#2a1d12" }}>{children}</body>
      </html>
    );
  }
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#ffffff",
          color: "#14181f",
          fontFamily: "Helvetica, Arial, sans-serif",
          minHeight: "100vh",
        }}
      >
        <header
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e2e5ea",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px 24px",
          }}
        >
          <a href="/" style={{ color: "#14181f", fontWeight: 700, fontSize: 18, textDecoration: "none" }}>
            Nightlane
          </a>
          {/* Short on purpose: the free tools owner-operators come for, then the
              dispatch offer. Everything else lives in the footer. */}
          <nav style={{ marginLeft: "auto", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 18px" }}>
            <a href="/loads" style={navLink}>Find Loads</a>
            <a href="/check-broker" style={navLink}>Check a Broker</a>
            <a href="/authority-watch" style={navLink}>Authority Watch</a>
            <a href="/account" style={{ ...navLink, color: "#14181f" }}>Log In</a>
            <a href="/dispatch" style={{
              color: "#ffffff", background: "#1d4ed8", fontSize: 13, fontWeight: 700,
              textDecoration: "none", padding: "8px 14px", borderRadius: 8,
            }}>
              Need a Dispatcher?
            </a>
          </nav>
        </header>
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>{children}</main>
        <footer style={{ maxWidth: 720, margin: "0 auto", padding: "24px 24px 32px", fontSize: 12, color: "#6b7280", borderTop: "1px solid #e2e5ea", lineHeight: 2 }}>
          <div>
            <b style={{ color: "#4b5568" }}>Free tools:</b>{" "}
            <a href="/confirm-coverage" style={footLink}>Confirm Coverage</a>{" · "}
            <a href="/my-documents" style={footLink}>My Documents</a>{" · "}
            <a href="/roadside" style={footLink}>Roadside &amp; Repair</a>{" · "}
            <a href="/revoked-carriers" style={footLink}>Revoked Credentials</a>{" · "}
            <a href="/blog/chameleon-carriers-tql-chrobinson-lawsuit" style={footLink}>Blog</a>
          </div>
          <div>
            <b style={{ color: "#4b5568" }}>Carriers &amp; brokers:</b>{" "}
            <a href="/carriers" style={footLink}>Carriers</a>{" · "}
            <a href="/get-verified" style={footLink}>Get Verified</a>{" · "}
            <a href="/post-load" style={footLink}>Post a Load</a>{" · "}
            <a href="/nightwatch" style={footLink}>Nightwatch (for brokers)</a>
          </div>
          <div>
            <a href="/privacy-policy" style={footLink}>Privacy Policy &amp; SMS Consent</a>
            {" · "}
            <a href="/terms-of-service" style={footLink}>Terms of Service</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
