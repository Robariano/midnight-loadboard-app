import { DispatchSubNav } from "../_shared";
import NeedADispatcher from "../../need-a-dispatcher/page";

export const metadata = {
  title: "Contact | Midnight Loadboard Dispatch",
  description:
    "Get matched with a dispatcher in Durango, CO — a direct line to a real person, not an automated system.",
};

// Reuses the existing /need-a-dispatcher form as-is (same component, same
// POST to /api/dispatch-leads, same admin panel at
// app/admin/dispatch-leads/page.js) so this new mini-site and the
// pre-existing lead form both feed one place.
export default function DispatchContact() {
  return (
    <div>
      <DispatchSubNav active="Contact" />
      <NeedADispatcher />
    </div>
  );
}
