// A small Steady Wake Dispatch offer for Nightlane's free-tool pages, worded
// for what the visitor just did there. Nightlane's main job is bringing in
// dispatch clients, and the people using these tools are owner-operators.
// No hooks, so it works in both server and client pages.
export default function DispatchNudge({ title, body, maxWidth = "none" }) {
  return (
    <div style={{
      marginTop: 24, background: "#fef7ea", border: "1px solid #f5a623", borderRadius: 12,
      padding: "16px 20px", maxWidth,
    }}>
      <p style={{ color: "#14181f", fontWeight: 700, fontSize: 15, margin: "0 0 6px" }}>{title}</p>
      <p style={{ color: "#4b5568", fontSize: 13, lineHeight: 1.6, margin: "0 0 12px" }}>
        {body} Your first load is free, then 7%, only after the broker pays you. Every load is booked
        under your MC with your OK.
      </p>
      <a href="/dispatch/contact" style={{
        display: "inline-block", background: "#92400e", color: "#ffffff", fontWeight: 700, fontSize: 13,
        textDecoration: "none", padding: "9px 16px", borderRadius: 8,
      }}>
        Get my first load free →
      </a>
      <span style={{ color: "#6b7280", fontSize: 12, marginLeft: 12 }}>Steady Wake Dispatch · same team as Nightlane</span>
    </div>
  );
}
