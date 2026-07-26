export default function Home() {
  return (
    <div>
      <h1 style={{ color: "#fff" }}>Midnight Loadboard App</h1>
      <p style={{ color: "#888", lineHeight: 1.6 }}>
        This is the working backend for Midnight Loadboard — carrier verification, load posting/claiming,
        and driver coverage attestation. Your marketing site (midnightloadboard.com) links here for the
        functional parts.
      </p>
      <ul style={{ color: "#888", lineHeight: 2 }}>
        <li><a href="/get-verified" style={{ color: "#4caf50" }}>Get Verified as a Carrier →</a></li>
        <li><a href="/post-load" style={{ color: "#5c5cff" }}>Post a Load →</a></li>
        <li><a href="/loads" style={{ color: "#5c5cff" }}>Browse Open Loads →</a></li>
        <li><a href="/admin" style={{ color: "#888" }}>Admin Dashboard →</a></li>
      </ul>
    </div>
  );
}
