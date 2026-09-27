import { DispatchSubNav, cardStyle, primaryBtn } from "../_shared";

export const metadata = {
  title: "About | Steady Wake Dispatch",
  description:
    "Navy veteran, 16 years hands-on tractor-trailer experience, active CDL, certified dispatcher — why Steady Wake Dispatch exists.",
};

export default function DispatchAbout() {
  return (
    <div>
      <DispatchSubNav active="About" />

      <h1 style={{ color: "#14181f", fontSize: 28, marginBottom: 12 }}>About</h1>

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: 14 }}>
          <dt style={{ color: "#6b7280" }}>Background</dt>
          <dd style={{ color: "#14181f", fontWeight: 700 }}>U.S. Navy Veteran</dd>
          <dt style={{ color: "#6b7280" }}>Experience</dt>
          <dd style={{ color: "#14181f", fontWeight: 700 }}>16 yrs hands-on trucking, incl. 12 yrs beverage distribution</dd>
          <dt style={{ color: "#6b7280" }}>License</dt>
          <dd style={{ color: "#14181f", fontWeight: 700 }}>Active CDL</dd>
          <dt style={{ color: "#6b7280" }}>Training</dt>
          <dd style={{ color: "#14181f", fontWeight: 700 }}>Certified Dispatcher</dd>
          <dt style={{ color: "#6b7280" }}>Freight</dt>
          <dd style={{ color: "#14181f", fontWeight: 700 }}>Dry Van &amp; Flatbed</dd>
        </dl>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={cardStyle}>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            I'm a Navy veteran with 16 years of hands-on tractor-trailer experience, including 12 years
            in beverage distribution — tight schedules, no room for slacking. I also spent time in the
            Navy blocking and bracing cargo on flatbeds, so I understand load securement for that
            freight too. I still hold my active CDL, which means I know exactly what it's like to be
            in your seat, not just booking loads from behind a desk.
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            I completed dispatcher training, and I personally check every broker against FMCSA's
            federal database before I ever book a load — so you always know exactly how I'm protecting
            you, not just taking my word for it.
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            Early on, a carrier once asked me to drive a load under unclear insurance coverage — and
            the story he gave me about it didn't add up. When he then asked me to drive without being
            properly covered, I said no. That experience is part of why coverage and broker
            verification matter so much to me now: no load is worth driving on unconfirmed protection.
          </p>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            I started Steady Wake Dispatch because owner-operators deserve a dispatcher who's honest,
            communicates fast, and treats every load like it matters — because it does. If that sounds
            like what you're looking for,{" "}
            <a href="/dispatch/contact" style={{ color: "#92400e", fontWeight: 700 }}>get in touch</a>.
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "40px 0 8px" }}>
        <a href="/dispatch/contact" style={primaryBtn}>Get Started →</a>
      </div>
    </div>
  );
}
