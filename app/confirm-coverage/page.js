"use client";
import { useEffect, useState } from "react";

export default function ConfirmCoverage() {
  const [me, setMe] = useState(undefined);
  const [driverType, setDriverType] = useState("self");
  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [driverConsent, setDriverConsent] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/carriers/me")
      .then((r) => r.json())
      .then((d) => setMe(d.carrier))
      .catch(() => setMe(null));
  }, []);

  async function submit() {
    setSubmitting(true);
    const res = await fetch(`/api/standalone-attestation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        is_self_attestation: driverType === "self",
        driver_name: driverType === "self" ? null : driverName,
        driver_contact: driverType === "self" ? null : driverContact,
        driver_consent_confirmed: driverType === "self" ? undefined : driverConsent,
      }),
    });
    const data = await res.json();
    setResult(data);
    setSubmitting(false);
  }

  if (me === undefined) return <p style={{ color: "#888" }}>Loading...</p>;

  if (!me) {
    return (
      <div>
        <h1 style={{ color: "#fff" }}>Confirm Driver Coverage</h1>
        <p style={{ color: "#888" }}>
          <a href="/login?next=/confirm-coverage" style={{ color: "#5c5cff" }}>Log in</a> to use this tool.
        </p>
      </div>
    );
  }

  if (me.verified_status !== "verified") {
    return (
      <div>
        <h1 style={{ color: "#fff" }}>Confirm Driver Coverage</h1>
        <p style={{ color: "#e0a94c", fontSize: 13 }}>
          Your account isn't verified yet (status: {me.verified_status}). You'll be able to use this tool
          once an admin approves your documents.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ color: "#fff", marginBottom: 4 }}>Confirm Driver Coverage</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
        Got a load from somewhere other than Midnight Loadboard (DAT, Truckstop, a phone call, whatever)?
        Use this to send a quick coverage confirmation to whoever's driving — same safety check, no load
        listing required.
      </p>

      {!result && (
        <div style={{
          background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 12,
          padding: "16px 20px",
        }}>
          <label style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 6 }}>
            Who's actually driving this load?
          </label>
          <label style={{ display: "block", fontSize: 13, color: "#e0e0e0", marginBottom: 6 }}>
            <input type="radio" checked={driverType === "self"}
              onChange={() => setDriverType("self")} /> I'm driving it myself
          </label>
          <label style={{ display: "block", fontSize: 13, color: "#e0e0e0", marginBottom: 10 }}>
            <input type="radio" checked={driverType === "assigned"}
              onChange={() => setDriverType("assigned")} /> I'm assigning a driver
          </label>

          {driverType === "assigned" && (
            <>
              <input value={driverName} onChange={(e) => setDriverName(e.target.value)}
                placeholder="Driver's name"
                style={{
                  width: "100%", padding: 8, marginBottom: 8, background: "#0a0a12",
                  border: "1px solid #2a2a3e", borderRadius: 6, color: "#e0e0e0", fontSize: 13,
                }} />
              <input value={driverContact} onChange={(e) => setDriverContact(e.target.value)}
                placeholder="Driver's email"
                style={{
                  width: "100%", padding: 8, marginBottom: 8, background: "#0a0a12",
                  border: "1px solid #2a2a3e", borderRadius: 6, color: "#e0e0e0", fontSize: 13,
                }} />
              <p style={{ fontSize: 11, color: "#666", marginTop: -4, marginBottom: 10 }}>
                Texting isn't available right now — we'll email the driver a private confirmation link instead.
              </p>

              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#aaa", marginBottom: 10 }}>
                <input type="checkbox" checked={driverConsent}
                  onChange={(e) => setDriverConsent(e.target.checked)}
                  style={{ marginTop: 2 }} />
                <span>
                  I confirm this driver has agreed, as part of our working relationship, to receive
                  this one-time email to verify insurance coverage for this load.
                </span>
              </label>
            </>
          )}

          <button onClick={submit}
            disabled={submitting || (driverType === "assigned" && !driverConsent)}
            style={{
              background: (driverType === "assigned" && !driverConsent) ? "#2f4f31" : "#4caf50",
              color: "#fff", border: "none", borderRadius: 6,
              padding: "8px 16px", fontSize: 13, fontWeight: 700,
              cursor: (driverType === "assigned" && !driverConsent) ? "not-allowed" : "pointer",
            }}>
            {submitting ? "Sending..." : "Send confirmation"}
          </button>
        </div>
      )}

      {result && (
        <div style={{
          background: "#12121e", border: "1px solid #2a2a3e", borderRadius: 12,
          padding: "16px 20px",
        }}>
          {result.error && <p style={{ color: "#ff6b6b", fontSize: 13 }}>{result.error}</p>}
          {result.selfAttestationNeeded && <SelfAttestPrompt token={result.token} />}
          {result.assignedLinkSent && (
            <div>
              <p style={{ color: "#4caf50", fontSize: 12, marginBottom: 8 }}>
                Confirmation email sent to the driver automatically.
              </p>
              <p style={{ color: "#888", fontSize: 12, marginBottom: 6 }}>
                You can also share this link directly if needed:
              </p>
              <LinkBox url={result.confirmUrl} />
            </div>
          )}
          {result.assignedLinkSent === false && result.confirmUrl && (
            <div>
              <p style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 6 }}>
                {result.error || "The confirmation email couldn't be sent."} Share this link with the driver yourself:
              </p>
              <LinkBox url={result.confirmUrl} />
            </div>
          )}
          {!result.error && (
            <button onClick={() => { setResult(null); setDriverName(""); setDriverContact(""); setDriverConsent(false); }}
              style={{
                marginTop: 12, background: "transparent", color: "#888", border: "1px solid #2a2a3e",
                borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer",
              }}>
              Send another
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function LinkBox({ url }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, background: "#0a0a12",
      border: "1px solid #2a2a3e", borderRadius: 6, padding: "8px 10px", marginBottom: 8,
    }}>
      <code style={{ color: "#5c5cff", fontSize: 13, wordBreak: "break-all", flex: 1 }}>{url}</code>
      <button
        onClick={() => navigator.clipboard.writeText(url)}
        style={{
          background: "#2a2a3e", color: "#e0e0e0", border: "none", borderRadius: 6,
          padding: "6px 10px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
        }}>
        Copy link
      </button>
    </div>
  );
}

function SelfAttestPrompt({ token }) {
  const [answered, setAnswered] = useState(false);
  async function respond(response) {
    await fetch(`/api/attestations/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    });
    setAnswered(true);
  }
  if (answered) return <p style={{ color: "#4caf50", fontSize: 13 }}>Thanks - recorded.</p>;
  return (
    <div>
      <p style={{ fontSize: 13, color: "#e0e0e0", marginBottom: 8 }}>
        Confirm: are you covered under your own active insurance/authority for this trip?
      </p>
      <button onClick={() => respond("own_authority")}
        style={{ marginRight: 8, background: "#4caf50", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
        Yes
      </button>
      <button onClick={() => respond("neither")}
        style={{ background: "#3a1a1a", color: "#ff6b6b", border: "1px solid #ff6b6b", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
        No / not sure
      </button>
    </div>
  );
}
