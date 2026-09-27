import { redirect } from "next/navigation";

// This bare, unbranded form is retired in favor of /dispatch/contact
// (Steady Wake Dispatch, properly branded, same backend). Kept as a
// redirect rather than deleting the route outright, so any old links,
// bookmarks, or posts that still point here keep working.
export default function NeedADispatcherRedirect() {
  redirect("/dispatch/contact");
}
