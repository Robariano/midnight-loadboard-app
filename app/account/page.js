"use client";
import { useEffect, useState } from "react";

export default function Account() {
    const [carrier, setCarrier] = useState(undefined);

  useEffect(() => {
        fetch("/api/carriers/me")
          .then((r) => r.json())
          .then((d) => setCarrier(d.carrier))
          .catch(() => setCarrier(null));
  }, []);

  async function logout() {
        await fetch("/api/carriers/logout", { method: "POST" });
        window.location.href = "/";
  }

  if (carrier === undefined) return <p style={{ color: "#4b5568" }}>Loading...</p>;

  if (!carrier) {
        // Not logged in: send them straight to the login page (which also links
        // new drivers to Get Verified), then back here after they log in.
        if (typeof window !== "undefined") window.location.replace("/login?next=/account");
        return <p style={{ color: "#4b5568" }}>Taking you to log in...</p>;
}


    return (
          <div>
            <h1 style={{ color: "#14181f" }}>Your Account</h1>
      <div style={{
              background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
              padding: 20, marginBottom: 20,
    }}>
        <p style={{ color: "#14181f", fontWeight: 700, fontSize: 17, margin: "0 0 6px" }}>{carrier.company_name}</p>
        <p style={{ color: "#4b5568", fontSize: 13, margin: 0 }}>Status: {carrier.verified_status}</p>
      </div>
      <p style={{ color: "#4b5568", fontSize: 13, marginBottom: 20 }}>
        <a href={`/reverify/${carrier.id}`} style={{ color: "#1d4ed8" }}>Update your documents</a>
      </p>
      <button onClick={logout} style={{
              background: "transparent", color: "#991b1b", border: "1px solid #991b1b",
              borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
    }}>
        Log Out
          </button>
          </div>
  );
}
