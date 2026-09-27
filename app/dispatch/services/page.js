import { DispatchSubNav, cardStyle, primaryBtn } from "../_shared";

export const metadata = {
  title: "Dispatch Services | Midnight Loadboard",
  description:
    "Load sourcing, rate negotiation, broker vetting, and paperwork — the full scope of what a Durango, CO based dispatcher handles for you.",
};

const services = [
  {
    title: "Load sourcing",
    body:
      "Loads pulled from load boards, broker relationships, and direct shipper contacts — matched to your equipment, your lanes, and the rate you actually need to make the trip worth it.",
  },
  {
    title: "Rate negotiation",
    body:
      "Every rate gets pushed on before you're asked to commit. You see the number before you accept it — no surprise deductions after the fact.",
  },
  {
    title: "Broker vetting",
    body:
      "Before you're sent to a broker, their FMCSA registration and authority status get checked — the same free tool Midnight Loadboard offers publicly at ",
    link: { href: "/check-broker", label: "Check FMCSA Registration" },
  },
  {
    title: "Rate confirmations & paperwork",
    body:
      "Rate confirmations, BOLs, and the back-office documentation that turns into a payment dispute when it's handled sloppily — tracked and handled so nothing gets lost.",
  },
  {
    title: "Coverage checks",
    body:
      "Before you drive a load, you can confirm you're actually listed on the carrier's active policy for that trip — free and private, through ",
    link: { href: "/confirm-coverage", label: "Confirm Coverage" },
  },
  {
    title: "A direct line, not a queue",
    body:
      "Questions get answered by the person actually dispatching your freight — not routed through a support ticket.",
  },
];

export default function DispatchServices() {
  return (
    <div>
      <DispatchSubNav active="Services" />

      <h1 style={{ color: "#14181f", fontSize: 28, marginBottom: 12 }}>What's included</h1>
      <p style={{ color: "#4b5568", fontSize: 15, lineHeight: 1.6, marginBottom: 32, maxWidth: 560 }}>
        Dispatch is more than forwarding load postings. Here's the actual scope of work — the same tools
        Midnight Loadboard already runs for FMCSA and coverage checks are built into how loads get vetted
        for you.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
        {services.map((s) => (
          <div key={s.title} style={cardStyle}>
            <p style={{ color: "#14181f", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{s.title}</p>
            <p style={{ color: "#4b5568", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              {s.body}
              {s.link && (
                <a href={s.link.href} style={{ color: "#1d4ed8", fontWeight: 700 }}>
                  {s.link.label}
                </a>
              )}
              {s.link && "."}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          ...cardStyle,
          marginBottom: 40,
          background: "#fef3e2",
          border: "1px solid #f5d999",
        }}
      >
        <p style={{ fontSize: 13, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
          Freight can only legally be booked in the name of whoever holds the operating authority. If you
          run under someone else's authority rather than your own, dispatch has to be arranged with that
          carrier — worth submitting anyway, since that's still a conversation worth having.
        </p>
      </div>

      <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
        <a href="/dispatch/contact" style={primaryBtn}>Get Matched With a Dispatcher →</a>
      </div>
    </div>
  );
}
