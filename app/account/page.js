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

  if (carrier === undefined) return <p style={{ color: "#888" }}>Loading...</p>;

  if (!carrier) {
        return (
                <div>
                  <h1 style={{ color: "#fff" }}>Not Logged In</h1>
        <p style={{ color: "#888" }}>
          <a href="/login" style={{ color: "#5c5cff" }}>Log in</a> to view your account.
    </p>
    </div>
    );
}


    return (
          <div>
            <h1 style={{ color: "#fff" }}>Your Account</h1>
      <div style={{
              background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 12,
              padding: 20, marginBottom: 20,
    }}>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 17, margin: "0 0 6px" }}>{carrier.company_name}</p>
        <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Status: {carrier.verified_status}</p>
      </div>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
        <a href={`/reverify/${carrier.id}`} style={{ color: "#5c5cff" }}>Update your documents</a>
      </p>
      <button onClick={logout} style={{
              background: "transparent", color: "#ff6b6b", border: "1px solid #ff6b6b",
              borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
    }}>
        Log Out
          </button>
          </div>
  );
}
