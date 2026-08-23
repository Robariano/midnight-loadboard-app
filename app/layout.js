export const metadata = {
  title: "Midnight Loadboard - Verified Freight Network",
};
export default function RootLayout({ children }) {
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
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <a href="/" style={{ color: "#14181f", fontWeight: 700, fontSize: 18, textDecoration: "none" }}>
            Midnight Loadboard
          </a>
          <nav style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
            <a href="/loads" style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Browse Loads
            </a>
            <a href="/carriers" style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Carriers
            </a>
            <a href="/confirm-coverage" style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Confirm Coverage
            </a>
            <a href="/check-broker" style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Check a Broker
            </a>
            <a href="/roadside" style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Roadside &amp; Repair
            </a>
            <a href="/post-load" style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Post a Load
            </a>
            <a href="/get-verified" style={{ color: "#166534", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Get Verified
            </a>
            <a href="/account" style={{ color: "#14181f", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Log In
            </a>
            <a href="/revoked-carriers" style={{ color: "#991b1b", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Revoked Credentials
            </a>
          </nav>
        </header>
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>{children}</main>
      </body>
    </html>
  );
}
