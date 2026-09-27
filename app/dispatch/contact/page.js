import { DispatchSubNav, cardStyle, BRAND } from "../_shared";
import DispatcherLeadForm from "../_DispatcherForm";

export const metadata = {
  title: "Contact | Steady Wake Dispatch",
  description:
    "Get your first load booked with Steady Wake Dispatch — call, email, or send your info directly.",
};

// Renders the shared lead form (app/dispatch/_DispatcherForm.js), which
// posts to /api/dispatch-leads and shows up in the admin panel at
// app/admin/dispatch-leads/page.js. /need-a-dispatcher now just redirects
// here instead of duplicating this form.
export default function DispatchContact() {
  return (
    <div>
      <DispatchSubNav active="Contact" />

      <h1 style={{ color: "#14181f", fontSize: 26, marginBottom: 4 }}>
        Ready to get your first load booked?
      </h1>
      <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.6, marginBottom: 20, maxWidth: 560 }}>
        Tell me your equipment, lanes, and what you're looking for. I'll take it from there.
      </p>

      <div style={{ ...cardStyle, marginBottom: 24, display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 2px" }}>Phone</p>
          <a href={BRAND.phoneHref} style={{ color: "#92400e", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            {BRAND.phone}
          </a>
        </div>
        <div>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 2px" }}>Email</p>
          <a href={`mailto:${BRAND.email}`} style={{ color: "#92400e", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            {BRAND.email}
          </a>
        </div>
        <div>
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 2px" }}>Based</p>
          <p style={{ color: "#14181f", fontWeight: 700, fontSize: 14, margin: 0 }}>{BRAND.location}</p>
        </div>
      </div>

      <DispatcherLeadForm />
    </div>
  );
}
