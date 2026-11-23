"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-fetches the server-rendered status every `seconds` while the page is
// open and visible, so a driver sees updates without reloading.
export default function AutoRefresh({ seconds = 60 }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
