export const metadata = {
  title: "Midnight Loadboard - Verified Freight Network",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0a0a12",
          color: "#e0e0e0",
          fontFamily: "Helvetica, Arial, sans-serif",
          minHeight: "100vh",
        }}
      >
        <header
          style={{
            background: "#12121e",
            borderBottom: "1px solid #2a2a3e",
            padding: "16px 32px",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <a href="/" style={{ color: "#fff", fontWeight: 700, fontSize: 18, textDecoration: "none" }}>
            Midnight Loadboard
          </a>
          <nav style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
            <a href="/loads" style={{ color: "#5c5cff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Browse Loads
            </a>
            <a href="/confirm-coverage" style={{ color: "#5c5cff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Confirm Coverage
            </a>
            <a href="/post-load" style={{ color: "#5c5cff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Post a Load
            </a>
            <a href="/get-verified" style={{ color: "#4caf50", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Get Verified
            </a>
            <a href="/account" style={{ color: "#e0e0e0", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Log In
            </a>
            <a href="/revoked-carriers" style={{ color: "#ff6b6b", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Revoked Credentials
            </a>
          </nav>
        </header>
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>{children}</main>
      </body>
    </html>
  );
}
