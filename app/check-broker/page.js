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

export default function CheckBroker() {
    const [numberType, setNumberType] = useState("dot");
    const [numberValue, setNumberValue] = useState("");
    const [status, setStatus] = useState(null);
    const [snapshot, setSnapshot] = useState(null);
    const [error, setError] = useState(null);

  async function handleCheck(e) {
        e.preventDefault();
        setStatus("checking");
        setError(null);
        setSnapshot(null);
        const body = numberType === "dot"
          ? { dot_number: numberValue }
          : { mc_number: numberValue };
        const res = await fetch("/api/check-broker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
                setSnapshot(data.snapshot);
                setStatus("done");
        } else {
                setError(data.error || "Something went wrong.");
                setStatus("error");
        }
  }

  return (
        <div>
          <h1 style={{ color: "#14181f" }}>Check a Broker</h1>
      <p style={{ color: "#4b5568", marginBottom: 24 }}>
        Before you take a load, confirm the broker is a real, active, registered entity — free, no
        account needed. This confirms registration status only, not reputation or payment history —
        always use your own judgment alongside this check.
      </p>

      <form onSubmit={handleCheck}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button type="button" onClick={() => setNumberType("dot")} style={{
            flex: 1, padding: "8px", borderRadius: 6, cursor: "pointer",
            border: numberType === "dot" ? "2px solid #1d4ed8" : "1px solid #e2e5ea",
            background: numberType === "dot" ? "#eef2ff" : "#f7f8fa",
            color: "#14181f", fontWeight: 700, fontSize: 13,
          }}>
            I have their DOT number
          </button>
          <button type="button" onClick={() => setNumberType("mc")} style={{
            flex: 1, padding: "8px", borderRadius: 6, cursor: "pointer",
            border: numberType === "mc" ? "2px solid #1d4ed8" : "1px solid #e2e5ea",
            background: numberType === "mc" ? "#eef2ff" : "#f7f8fa",
            color: "#14181f", fontWeight: 700, fontSize: 13,
          }}>
            I have their MC number
          </button>
        </div>

        <label style={{ display: "block", fontSize: 13, color: "#4b5568", marginBottom: 4 }}>
          {numberType === "dot" ? "DOT Number" : "MC Number"}
        </label>
        <input
          style={inputStyle}
          type="text"
          value={numberValue}
          onChange={(e) => setNumberValue(e.target.value)}
          placeholder={numberType === "dot" ? "e.g. 123456" : "e.g. 654321"}
        />
        <button type="submit" disabled={status === "checking"} style={{
          width: "100%", padding: "14px", background: "#1d4ed8", color: "#fff",
          border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}>
          {status === "checking" ? "Checking..." : "Check This Number"}
        </button>
      </form>

      {error && <p style={{ color: "#991b1b", marginTop: 16 }}>{error}</p>}

      {snapshot && (
        <div style={{
          marginTop: 20, background: "#f7f8fa", border: "1px solid #e2e5ea",
          borderRadius: 10, padding: "16px 18px",
        }}>
          <p style={{ fontWeight: 700, fontSize: 16, margin: "0 0 4px", color: "#14181f" }}>
            {snapshot.legalName || "Name not on file"}
          </p>
          {snapshot.dbaName && (
            <p style={{ fontSize: 13, color: "#4b5568", margin: "0 0 10px" }}>DBA: {snapshot.dbaName}</p>
          )}

          <p style={{ margin: "6px 0", fontSize: 14 }}>
            <strong>Allowed to operate:</strong>{" "}
            <span style={{ color: snapshot.allowToOperate ? "#166534" : "#991b1b" }}>
              {snapshot.allowToOperate ? "Yes" : "No"}
            </span>
          </p>
          <p style={{ margin: "6px 0", fontSize: 14 }}>
            <strong>Out of service:</strong>{" "}
            <span style={{ color: snapshot.outOfService ? "#991b1b" : "#166534" }}>
              {snapshot.outOfService ? `Yes (${snapshot.outOfServiceDate || "date unknown"})` : "No"}
            </span>
          </p>
          {snapshot.authorities?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <strong style={{ fontSize: 14 }}>Authority on file:</strong>
              <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
                {snapshot.authorities.map((a, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#4b5568" }}>
                    {a.type || "Unknown type"} — {a.status || "Unknown status"}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {snapshot.address && (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "#4b5568" }}>{snapshot.address}</p>
          )}

          <p style={{ marginTop: 14, fontSize: 12, color: "#888" }}>
            Pulled live from FMCSA's public records. This confirms the entity is registered and
            its authority status — it does not confirm reputation, payment history, or that
            you're speaking to a legitimate representative of this company. Always verify
            independently (call their listed number, check their bond directly) before trusting
            a load.
          </p>
        </div>
      )}
    </div>
  );
}
