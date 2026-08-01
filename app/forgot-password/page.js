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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const resp = await fetch("/api/carriers/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!resp.ok) throw new Error("Request failed");
      setStatus("done");
    } catch (err) {
      // A genuine network/server failure is safe to show honestly - this
      // doesn't leak whether the email is registered, only that the
      // request itself didn't go through at all.
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div>
        <h1 style={{ color: "#4caf50" }}>Check your email</h1>
        <p style={{ color: "#888" }}>
          If that email is registered, we've sent a link to reset your password. It expires in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: "#fff" }}>Reset Your Password</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        Enter the email you signed up with and we'll send you a reset link.
      </p>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" disabled={status === "submitting"} style={{
          width: "100%", padding: "14px", background: "#4caf50", color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}>
          {status === "submitting" ? "Sending..." : "Send Reset Link"}
        </button>
        {status === "error" && (
          <p style={{ color: "#cf6679", marginTop: 12, fontSize: 13 }}>
            Something went wrong sending that. Please try again in a moment.
          </p>
        )}
      </form>
    </div>
  );
}
