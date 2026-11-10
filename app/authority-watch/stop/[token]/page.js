"use client";
import { useState } from "react";
import { useParams } from "next/navigation";

// Unsubscribe page. Uses a button (POST) instead of stopping on page load,
// so email link scanners that pre-open links don't turn off someone's alerts.
export default function StopAuthorityWatch() {
  const { token } = useParams();
  const [state, setState] = useState({ busy: false, done: null, error: null });

  async function stop() {
    setState({ busy: true, done: null, error: null });
    try {
      const res = await fetch("/api/authority-watch/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setState({ busy: false, done: data.stopped ? data.dotNumber : null, error: data.error || null });
    } catch {
      setState({ busy: false, done: null, error: "Something went wrong. Try again." });
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ color: "#14181f", margin: "0 0 10px" }}>Stop Authority Watch alerts</h1>
      {state.done ? (
        <p style={{ color: "#166534", fontSize: 14 }}>
          Done. We&apos;ve stopped alerts for DOT {state.done}. You can sign up again any time at{" "}
          <a href="/authority-watch" style={{ color: "#1d4ed8" }}>nightlaneloads.com/authority-watch</a>.
        </p>
      ) : (
        <>
          <p style={{ color: "#4b5568", fontSize: 14, lineHeight: 1.6 }}>
            This turns off the daily FMCSA status alerts for this sign-up. To stop texts only, you can also reply STOP to any alert text.
          </p>
          {state.error && <p style={{ color: "#991b1b", fontSize: 13 }}>{state.error}</p>}
          <button onClick={stop} disabled={state.busy}
            style={{ background: "#991b1b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {state.busy ? "Stopping..." : "Stop my alerts"}
          </button>
        </>
      )}
    </div>
  );
}
