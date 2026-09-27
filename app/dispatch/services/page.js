import { DispatchSubNav, cardStyle, primaryBtn, dispatchHref } from "../_shared";

export const metadata = {
  title: "Dispatch Services | Steady Wake Dispatch",
  description:
    "Load booking, broker verification, rate negotiation, route planning, and paperwork — everything Steady Wake Dispatch handles between pickup and delivery.",
};

const services = [
  {
    title: "Load booking",
    body: "Finding solid freight that fits your equipment, your lanes, and your schedule.",
  },
  {
    title: "Broker verification",
    body:
      "Every broker checked against FMCSA registration before you commit to a load — no exceptions. The same free tool Midnight Loadboard runs publicly is what gets used on your behalf: ",
    link: { href: "/check-broker", label: "Check FMCSA Registration" },
  },
  {
    title: "Rate negotiation",
    body: "Pushing for fair, competitive rates on every load, every time.",
  },
  {
    title: "Route planning",
    body: "Reducing deadhead miles and keeping your truck moving and earning.",
  },
  {
    title: "Paperwork management",
    body: "Rate confirmations, broker packets, and load documents handled for you.",
  },
  {
    title: "Direct communication",
    body: "Fast, honest responses. No runaround, no ghosting.",
  },
  {
    title: "Coverage checks",
    body:
      "Before you drive a load, you can confirm you're actually listed on the carrier's active policy for that trip — free and private, through ",
    link: { href: "/confirm-coverage", label: "Confirm Coverage" },
  },
];

export default function DispatchServices() {
  return (
    <div>
      <DispatchSubNav active="Services" />

      <h1 style={{ color: "#14181f", fontSize: 28, marginBottom: 4 }}>Services</h1>
      <p style={{ color: "#4b5568", fontSize: 15, lineHeight: 1.6, marginBottom: 28, maxWidth: 560 }}>
        Everything handled between pickup and delivery, so you can focus on driving. Dry van and
        flatbed, including load securement.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
        {services.map((s) => (
          <div key={s.title} style={cardStyle}>
            <p style={{ color: "#14181f", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{s.title}</p>
            <p style={{ color: "#4b5568", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              {s.body}
              {s.link && (
                <a href={s.link.href} style={{ color: "#92400e", fontWeight: 700 }}>
                  {s.link.label}
                </a>
              )}
              {s.link && "."}
            </p>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: 40, background: "#fdf1e4", border: "1px solid #f0d3a8" }}>
        <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
          Freight can only legally be booked in the name of whoever holds the operating authority. If
          you run under someone else's authority rather than your own, dispatch has to be arranged
          with that carrier — still worth reaching out, since that's a conversation worth having.
        </p>
      </div>

      <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
        <a href={dispatchHref("/contact")} style={primaryBtn}>Get Started →</a>
      </div>
    </div>
  );
}
