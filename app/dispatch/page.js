import { DispatchSubNav, cardStyle, primaryBtn, secondaryBtn, statBox, BRAND, dispatchHref } from "./_shared";

export const metadata = {
  title: "Steady Wake Dispatch | Freight Dispatching in Durango, CO",
  description:
    "Reliable dispatching built on real experience — Navy veteran, 12 years driving dry van, now dispatching for owner-operators out of Durango, Colorado.",
};

export default function DispatchHome() {
  return (
    <div>
      <DispatchSubNav active="Home" />

      <h1 style={{ color: "#14181f", fontSize: 32, lineHeight: 1.2, marginBottom: 12 }}>
        Reliable dispatching, built on real experience.
      </h1>
      <p style={{ color: "#4b5568", fontSize: 16, lineHeight: 1.6, marginBottom: 24, maxWidth: 560 }}>
        Navy veteran. Nearly 30 years around trucking, including 12 years driving dry van. I bring that same discipline to
        dispatching for owner-operators — dry van and flatbed.
      </p>
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <a href={dispatchHref("/contact")} style={primaryBtn}>Get Started →</a>
        <a href={dispatchHref("/services")} style={secondaryBtn}>See What's Included</a>
      </div>

      {/* Stats, echoing the odometer figures from Rob's own draft site */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
        <div style={statBox}>
          <p style={{ fontSize: 34, fontWeight: 700, margin: 0, color: "#fbbf24" }}>12</p>
          <p style={{ fontSize: 13, color: "#c7ccd6", margin: "4px 0 0" }}>
            Years driving dry van experience
          </p>
        </div>
        <div style={statBox}>
          <p style={{ fontSize: 34, fontWeight: 700, margin: 0, color: "#fbbf24" }}>7%</p>
          <p style={{ fontSize: 13, color: "#c7ccd6", margin: "4px 0 0" }}>
            Starting rate per load, while building the track record
          </p>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 32 }}>
        <p style={{ color: "#14181f", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          Every broker checked before you commit
        </p>
        <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
          I personally check every broker against FMCSA's federal database before you're ever booked
          on their load — so you always know exactly how you're being protected, not just taking my
          word for it. No load is worth driving on unconfirmed coverage.
        </p>
      </div>

      <p style={{ color: "#14181f", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Why owner-operators choose Steady Wake</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
        {[
          "Real trucking experience, not just a certificate — 12 years driving, hands-on in trucking ever since.",
          "Broker vetting built into every load — checked personally against FMCSA's own database.",
          "Honest 7% starting rate — no bait-and-switch pricing later.",
          "Navy discipline: reliable, direct, and accountable.",
        ].map((line) => (
          <div key={line} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "#92400e", fontWeight: 700, marginTop: 1 }}>✓</span>
            <p style={{ color: "#4b5568", fontSize: 14, margin: 0, lineHeight: 1.5 }}>{line}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
        <p style={{ color: "#14181f", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Ready to get your first load booked?
        </p>
        <a href={dispatchHref("/contact")} style={primaryBtn}>Get Started →</a>
        <p style={{ color: "#6b7280", fontSize: 12, marginTop: 20 }}>
          Or call directly: <a href={BRAND.phoneHref} style={{ color: "#92400e", fontWeight: 700 }}>{BRAND.phone}</a>
        </p>
      </div>
    </div>
  );
}
