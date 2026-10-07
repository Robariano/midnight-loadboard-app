import { SteadyWakePage, BRAND } from "../_shared";
import DispatcherLeadForm from "../_DispatcherForm";

export const metadata = {
  title: "Contact | Steady Wake Dispatch",
  description:
    "Get your truck loaded with Steady Wake Dispatch. Call or text (970) 903-9226, email, or send your info here.",
};

// Renders the shared lead form (app/dispatch/_DispatcherForm.js), which
// posts to /api/dispatch-leads and shows up in the admin panel at
// app/admin/dispatch-leads/page.js. /need-a-dispatcher redirects here.
export default function DispatchContact() {
  return (
    <SteadyWakePage active="Contact">
      <section style={{ paddingTop: 32 }}>
        <p className="swd-eyebrow">Contact</p>
        <h1 className="swd-h">Let&apos;s get your truck loaded</h1>
        <p className="swd-lede">
          Tell me your equipment, your lanes and what you&apos;re looking for. You&apos;ll hear back from me directly.
        </p>
      </section>

      <div className="swd-contactline">
        <div>
          <span>Call or text</span>
          <a href={BRAND.phoneHref}>{BRAND.phone}</a>
        </div>
        <div>
          <span>Email</span>
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
        </div>
        <div>
          <span>Based in</span>
          <b>{BRAND.location}</b>
        </div>
      </div>

      <DispatcherLeadForm />
    </SteadyWakePage>
  );
}
