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

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
        e.preventDefault();
        setStatus("submitting");
        await fetch("/api/carriers/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
        });
        setStatus("done");
  }

  if (status === "done") {
        return (
                <div>
                  <h1 style={{ color: "#166534" }}>Check your email</h1>
          <p style={{ color: "#4b5568" }}>
          If that email is registered, we've sent a link to reset your password. It expires in 1 hour.
            </p>
            </div>
    );
}

  return (
        <div>
          <h1 style={{ color: "#14181f" }}>Reset Your Password</h1>
      <p style={{ color: "#4b5568", marginBottom: 24 }}>
        Enter the email you signed up with and we'll send you a reset link.
          </p>
      <form onSubmit={handleSubmit}>
                  <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} />
                    <button type="submit" disabled={status === "submitting"} style={{
                      width: "100%", padding: "14px", background: "#166534", color: "#fff",
                      border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
          }}>
{status === "submitting" ? "Sending..." : "Send Reset Link"}
</button>
  </form>
  </div>
  );
}
