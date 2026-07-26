"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = "/admin/carriers";
    } else {
      setError("Wrong password.");
    }
  }

  return (
    <div>
      <h1 style={{ color: "#fff" }}>Admin Login</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%", padding: 10, marginBottom: 12, background: "#12121e",
            border: "1px solid #2a2a3e", borderRadius: 6, color: "#e0e0e0", fontSize: 14,
          }}
        />
        <button type="submit" style={{
          width: "100%", padding: 12, background: "#5c5cff", color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer",
        }}>
          Log in
        </button>
      </form>
      {error && <p style={{ color: "#ff6b6b", marginTop: 10 }}>{error}</p>}
    </div>
  );
}
