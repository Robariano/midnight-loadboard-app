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

function BrokerRatingForm({ dotNumber, onSubmitted }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [raterName, setRaterName] = useState("");
    const [result, setResult] = useState(null);

  async function submit() {
        const res = await fetch("/api/broker-ratings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dot_number: dotNumber, rating, comment, rater_name: raterName }),
        });
        const data = await res.json().catch(() => ({}));
        setResult(data);
        if (data.rating) onSubmitted();
  }

  if (result?.rating) {
        return <p style={{ color: "#166534", fontSize: 13 }}>Thanks — your rating was recorded.</p>;
  }

  return (
        <div style={{ borderTop: "1px solid #e2e5ea", paddingTop: 12, marginTop: 12 }}>
          <p style={{ fontSize: 13, color: "#14181f", marginBottom: 8 }}>Rate your experience with this broker</p>
      {result?.error && <p style={{ color: "#991b1b", fontSize: 12, marginBottom: 8 }}>{result.error}</p>}
      <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{
        padding: 8, marginBottom: 8, background: "#ffffff", border: "1px solid #e2e5ea",
        borderRadius: 6, color: "#14181f", fontSize: 13,
      }}>
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"*".repeat(n)} ({n})</option>)}
      </select>
      <input value={raterName} onChange={(e) => setRaterName(e.target.value)}
        placeholder="Your name (optional)"
        style={{ display: "block", width: "100%", padding: 8, marginBottom: 8, background: "#ffffff",
          border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13 }} />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)}
        placeholder="How'd it go? (optional)" rows={2}
        style={{ display: "block", width: "100%", padding: 8, marginBottom: 8, background: "#ffffff",
          border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13, resize: "vertical" }} />
      <button onClick={submit} style={{
        background: "#166534", color: "#fff", border: "none", borderRadius: 6,
        padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
      }}>
        Submit rating
      </button>
      <p style={{ fontSize: 11, color: "#8a92a0", marginTop: 8 }}>
        Anyone can submit a rating here — this isn't tied to a verified transaction. Treat it as
        informal, crowd-sourced feedback, not a guarantee.
      </p>
    </div>
  );
}

export default function CheckBroker() {
    const [numberType, setNumberType] = useState("dot");
    const [numberValue, setNumberValue] = useState("");
    const [status, setStatus] = useState(null);
    const [snapshot, setSnapshot] = useState(null);
    const [ratingsData, setRatingsData] = useState(null);
    const [error, setError] = useState(null);

  async function loadRatings(dotNumber) {
        const res = await fetch(`/api/broker-ratings?dot_number=${encodeURIComponent(dotNumber)}`);
        const data = await res.json().catch(() => ({}));
        setRatingsData(data);
  }

  async function handleCheck(e) {
        e.preventDefault();
        setStatus("checking");
        setError(null);
        setSnapshot(null);
        setRatingsData(null);
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
                if (data.snapshot?.dotNumber) loadRatings(String(data.snapshot.dotNumber));
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
            <strong>FMCSA operating status:</strong>{" "}
            <span style={{ color: snapshot.allowToOperate ? "#166534" : "#4b5568" }}>
              {snapshot.allowToOperate ? "Active" : "Not flagged as active for-hire authority"}
            </span>
          </p>
          <p style={{ margin: "6px 0", fontSize: 14 }}>
            <strong>Out of service:</strong>{" "}
            <span style={{ color: snapshot.outOfService ? "#991b1b" : "#166534" }}>
              {snapshot.outOfService ? `Yes (${snapshot.outOfServiceDate || "date unknown"})` : "No"}
            </span>
          </p>

          <div style={{ marginTop: 10 }}>
            <strong style={{ fontSize: 14 }}>Authority on file:</strong>{" "}
            {snapshot.authorities?.length > 0 ? (
              <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
                {snapshot.authorities.map((a, i) => (
                  <li key={i} style={{ fontSize: 13, color: "#166534" }}>
                    {a.type} — Active
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ fontSize: 13, color: "#4b5568" }}>None on file with FMCSA</span>
            )}
          </div>

          {snapshot.address && (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "#4b5568" }}>{snapshot.address}</p>
          )}

          {ratingsData && (
            <div style={{ marginTop: 14, borderTop: "1px solid #e2e5ea", paddingTop: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#14181f", marginBottom: 6 }}>
                Driver feedback{ratingsData.count > 0 ? ` — ${ratingsData.average.toFixed(1)} / 5 (${ratingsData.count} rating${ratingsData.count === 1 ? "" : "s"})` : ""}
              </p>
              {ratingsData.count === 0 && (
                <p style={{ fontSize: 13, color: "#4b5568" }}>No ratings yet — be the first to share your experience.</p>
              )}
              {ratingsData.ratings?.map((r) => (
                <div key={r.id} style={{ marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: "#166534" }}>{"*".repeat(r.rating)}</span>{" "}
                  <span style={{ color: "#8a92a0" }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  {r.rater_name && <span style={{ color: "#4b5568" }}> — {r.rater_name}</span>}
                  {r.comment && <p style={{ margin: "2px 0 0", color: "#14181f" }}>{r.comment}</p>}
                </div>
              ))}
              <BrokerRatingForm
                dotNumber={String(snapshot.dotNumber)}
                onSubmitted={() => loadRatings(String(snapshot.dotNumber))}
              />
            </div>
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
