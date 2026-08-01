"use client";
import { useState } from "react";

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 14,
    background: "#f7f8fa",
    border: "1px solid #e2e5ea",
    borderRadius: 6,
    color: "#14181f",
    fontSize: 14,
};

const labelStyle = { display: "block", fontSize: 13, color: "#4b5568", marginBottom: 4 };

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

  async function handleSubmit(e) {
        e.preventDefault();
        setStatus("submitting");
        setError(null);
        const res = await fetch("/api/carriers/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
                const params = new URLSearchParams(window.location.search);
                window.location.href = params.get("next") || "/loads";
        } else {
                setStatus("error");
                setError(data.error || "Something went wrong - please try again.");
        }
  }

  return (
        <div>
          <h1 style={{ color: "#14181f" }}>Carrier Login</h1>
      <p style={{ color: "#4b5568", marginBottom: 24 }}>
        Log in to claim loads and keep your verification up to date.
          </p>
      <form onSubmit={handleSubmit}>
                  <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} />

                    <label style={labelStyle}>Password</label>
        <input style={inputStyle} type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)} />

                    <button type="submit" disabled={status === "submitting"} style={{
                      width: "100%", padding: "14px", background: "#166534", color: "#fff",
                      border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>
{status === "submitting" ? "Logging in..." : "Log In"}
</button>
{status === "error" && <p style={{ color: "#991b1b", marginTop: 12 }}>{error}</p>}
  </form>
      <p style={{ color: "#4b5568", marginTop: 16, fontSize: 13 }}>
        <a href="/forgot-password" style={{ color: "#1d4ed8" }}>Forgot your password?</a>
{" "}-{" "}
        <a href="/get-verified" style={{ color: "#1d4ed8" }}>New carrier? Get verified</a>
  </p>
  </div>
    );
}
