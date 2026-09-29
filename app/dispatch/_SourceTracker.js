"use client";
import { useEffect } from "react";

// Captures ?src=<name> from the URL (e.g. midnightloadboard.com/dispatch?src=small-fleet-owners
// pasted into that Facebook group's post) and remembers it in this browser
// until the lead form is submitted — even if the visitor lands here, then
// clicks through to /dispatch/contact separately. Renders nothing.
export const SOURCE_STORAGE_KEY = "swd_lead_source";

export default function SourceTracker() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const src = params.get("src");
      if (src) {
        window.localStorage.setItem(SOURCE_STORAGE_KEY, src);
      }
    } catch {
      // localStorage can throw in some browser privacy modes — never worth breaking the page over.
    }
  }, []);
  return null;
}
