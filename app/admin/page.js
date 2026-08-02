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
      <h1 style={{ color: "#14181f" }}>Admin Login</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 320 }}>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%", padding: 10, marginBottom: 12, background: "#f7f8fa",
            border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 14,
          }}
        />
        <button type="submit" style={{
          width: "100%", padding: 12, background: "#1d4ed8", color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer",
        }}>
          Log in
        </button>
      </form>
      {error && <p style={{ color: "#991b1b", marginTop: 10 }}>{error}</p>}
    </div>
  );
}
