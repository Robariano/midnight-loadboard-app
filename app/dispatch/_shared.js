// Shared style tokens + sub-nav for the Dispatch Services mini-site
// (app/dispatch/*). Kept in one place so Home/About/Services/Contact
// stay visually consistent with each other and with the rest of
// Midnight Loadboard (same palette as app/page.js, app/roadside/page.js).

export const cardStyle = {
  background: "#f7f8fa",
  border: "1px solid #e2e5ea",
  borderRadius: 12,
  padding: 20,
};

export const primaryBtn = {
  display: "inline-block",
  padding: "14px 24px",
  background: "#1d4ed8",
  color: "#fff",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
};

export const secondaryBtn = {
  display: "inline-block",
  padding: "14px 24px",
  background: "transparent",
  color: "#1d4ed8",
  border: "1px solid #1d4ed8",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 14,
  textDecoration: "none",
};

export const stepNumber = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "#1d4ed8",
  color: "#fff",
  fontWeight: 700,
  fontSize: 13,
  marginBottom: 12,
};

const subNavLinks = [
  { href: "/dispatch", label: "Home" },
  { href: "/dispatch/services", label: "Services" },
  { href: "/dispatch/about", label: "About" },
  { href: "/dispatch/contact", label: "Contact" },
];

// A light sub-nav so the four dispatch pages read as one small site
// within Midnight Loadboard, the way a local business site would —
// not just four disconnected pages under the main nav.
export function DispatchSubNav({ active }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 32,
        borderBottom: "1px solid #e2e5ea",
        paddingBottom: 14,
      }}
    >
      {subNavLinks.map((l) => (
        <a
          key={l.href}
          href={l.href}
          style={{
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            padding: "6px 12px",
            borderRadius: 20,
            color: active === l.label ? "#fff" : "#1d4ed8",
            background: active === l.label ? "#1d4ed8" : "#eef2ff",
          }}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}

export function DispatchBadge() {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 700,
        color: "#166534",
        background: "#e9f7ef",
        border: "1px solid #166534",
        borderRadius: 20,
        padding: "4px 12px",
        marginBottom: 16,
      }}
    >
      Durango, Colorado · Run by the founder, not a call center
    </span>
  );
}
