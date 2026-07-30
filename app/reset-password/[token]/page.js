"use client";
import { useState } from "react";

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 14,
    background: "#12121e",
    border: "1px solid #2a2a3e",
    borderRadius: 6,
    color: "#e0e0e0",
    fontSize: 14,
};

const labelStyle = { display: "block", fontSize: 13, color: "#888", marginBottom: 4 };

export default function ResetPassword({ params }) {
    const { token } = params;
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

  async function handleSubmit(e) {
        e.preventDefault();
        if (password !== confirm) {
                setStatus("error");
                setError("Passwords don't match.");
                return;
        }
        setStatus("submitting");
        setError(null);
        const res = await fetch("/api/carriers/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
                window.location.href = "/loads";
        } else {
                setStatus("error");
                setError(data.error || "Something went wrong - please try again.");
        }
  }

  return (
        <div>
          <h1 style={{ color: "#fff" }}>Set a New Password</h1>
      <form onSubmit={handleSubmit}>
          <label style={labelStyle}>New Password</label>
        <input style={inputStyle} type="password" required minLength={8} value={password}
          onChange={(e) => setPassword(e.target.value)} />

                    <label style={labelStyle}>Confirm Password</label>
        <input style={inputStyle} type="password" required minLength={8} value={confirm}
          onChange={(e) => setConfirm(e.target.value)} />

                    <button type="submit" disabled={status === "submitting"} style={{
                      width: "100%", padding: "14px", background: "#4caf50", color: "#fff",
                      border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>
{status === "submitting" ? "Saving..." : "Set Password"}
</button>
{status === "error" && <p style={{ color: "#ff6b6b", marginTop: 12 }}>{error}</p>}
  </form>
  </div>
  );
}
