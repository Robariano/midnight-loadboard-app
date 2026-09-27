import { DispatchSubNav, cardStyle, primaryBtn } from "../_shared";

export const metadata = {
  title: "About | Midnight Loadboard Dispatch",
  description:
    "Family freight roots in Durango, Colorado since 1933, a CDL, and a Navy background in cargo inspection — why this dispatch service exists.",
};

export default function DispatchAbout() {
  return (
    <div>
      <DispatchSubNav active="About" />

      <h1 style={{ color: "#14181f", fontSize: 28, marginBottom: 4 }}>Built from the inside.</h1>
      <p style={{ color: "#4b5568", fontSize: 15, lineHeight: 1.6, marginBottom: 28, maxWidth: 560 }}>
        I didn't start dispatching because I read about trucking — I started because I've been in it,
        and I got tired of watching the same problems never get fixed.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={cardStyle}>
          <p style={{ color: "#14181f", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Where I come from
          </p>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
            My family has run A&amp;L Coors, a beer distribution business based in Durango, Colorado,
            since 1933. I grew up around it — delivery routes, warehouse work, loading docks. I held my
            own routes, left, came back, left again. That's the nature of the business.
          </p>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            I hold a CDL with all endorsements. I'm a Navy veteran — one of my assignments was truck
            inspection: unloading civilian flatbeds, blocking and bracing cargo, inspecting loads moving
            between a weapons station and naval vessels. I know what it actually takes to move freight
            safely, and what real documentation looks like.
          </p>
        </div>

        <div style={cardStyle}>
          <p style={{ color: "#14181f", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            What I kept running into
          </p>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
            Every time I was around freight, the same things kept coming up: brokers slow to pay or hard
            to reach after delivery, rates that didn't hold up to a second look, and paperwork that got
            lost and turned into a dispute.
          </p>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            None of these are new problems — they've been around forever. What bothered me was that
            nobody dispatching was actually in the truck's corner.
          </p>
        </div>

        <div style={cardStyle}>
          <p style={{ color: "#14181f", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
            Why this exists
          </p>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, marginBottom: 10 }}>
            Dispatch has a trust problem of its own — a lot of it runs through people who've never sat in
            a cab, working off a script. I built Midnight Loadboard for the same reason I dispatch: to
            verify who you're dealing with up front, put the rate on the table honestly, and not make
            you chase down what you're owed.
          </p>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
            If you're looking for someone to line up loads, push on rates, and keep the paperwork clean —{" "}
            <a href="/dispatch/contact" style={{ color: "#1d4ed8", fontWeight: 700 }}>
              get in touch
            </a>
            .
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "40px 0 8px" }}>
        <a href="/dispatch/contact" style={primaryBtn}>Get Matched With a Dispatcher →</a>
      </div>
    </div>
  );
}
