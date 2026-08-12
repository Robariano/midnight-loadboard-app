"use client";
import { useEffect, useState } from "react";

export default function ConfirmCoverage() {
  const [me, setMe] = useState(undefined);

  useEffect(() => {
    fetch("/api/carriers/me")
      .then((r) => r.json())
      .then((d) => setMe(d.carrier))
      .catch(() => setMe(null));
  }, []);

  if (me === undefined) return <p style={{ color: "#4b5568" }}>Loading...</p>;

  // Logged in, but not yet verified — this doesn't apply to the public
  // check below (which anyone can use regardless of carrier status), only
  // to the carrier-specific "assign a driver" tool further down.
  if (me && me.verified_status !== "verified") {
    return (
      <div>
        <h1 style={{ color: "#14181f" }}>Confirm Driver Coverage</h1>
        <p style={{ color: "#92400e", fontSize: 13, marginBottom: 24 }}>
          Your carrier account isn't verified yet (status: {me.verified_status}), so the "assign a
          driver" tool isn't available until an admin approves your documents.
        </p>
        <PublicCheck />
      </div>
    );
  }

  // Logged in and verified — full tool: check on yourself, or send a
  // private link to a driver you're assigning.
  if (me && me.verified_status === "verified") {
    return <VerifiedCarrierTool />;
  }

  // Not logged in at all — this is the "no account needed" public tool
  // described in Midnight Loadboard's marketing.
  return (
    <div>
      <h1 style={{ color: "#14181f", marginBottom: 4 }}>Confirm Driver Coverage</h1>
      <p style={{ color: "#4b5568", fontSize: 13, marginBottom: 20 }}>
        Free, private, 30 seconds. Tell us who you're driving for and answer one question — the
        carrier never sees your answer, only whether the load ends up flagged.
      </p>
      <PublicCheck />
      <p style={{ color: "#8a92a0", fontSize: 12, marginTop: 20 }}>
        Are you a carrier looking to send this check to a driver you're assigning?{" "}
        <a href="/login?next=/confirm-coverage" style={{ color: "#1d4ed8" }}>Log in</a>.
      </p>
    </div>
  );
}

// The genuinely public, no-account version — a driver names who they're
// driving for and answers the coverage question directly, no email
// round-trip needed since they're answering live themselves.
function PublicCheck() {
  const [carrierName, setCarrierName] = useState("");
  const [dotNumber, setDotNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  async function submit(response) {
    if (!carrierName.trim()) {
      setResult({ error: "Please enter the company name you're driving for." });
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/public-coverage-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carrier_name: carrierName, dot_number: dotNumber, response }),
    });
    const data = await res.json();
    setResult(data);
    setSubmitting(false);
  }

  if (result && !result.error) {
    return (
      <div style={{
        background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
        padding: "16px 20px",
      }}>
        <p style={{ color: "#166534", fontSize: 13, margin: 0 }}>
          Thanks — recorded privately. {result.flagged
            ? "Nothing further needed from you."
            : "You're all set."}
        </p>
        <button
          onClick={() => { setResult(null); setCarrierName(""); setDotNumber(""); }}
          style={{
            marginTop: 12, background: "transparent", color: "#4b5568", border: "1px solid #e2e5ea",
            borderRadius: 6, padding: "8px 16px", fontSize: 13, cursor: "pointer",
          }}>
          Check another
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
      padding: "16px 20px",
    }}>
      {result?.error && (
        <p style={{ color: "#991b1b", fontSize: 13, marginBottom: 10 }}>{result.error}</p>
      )}
      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        Company name you're driving for
      </label>
      <input value={carrierName} onChange={(e) => setCarrierName(e.target.value)}
        placeholder="e.g. Acme Trucking LLC"
        style={{
          width: "100%", padding: 8, marginBottom: 8, background: "#ffffff",
          border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
        }} />
      <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
        DOT number (optional, helps us match the right company)
      </label>
      <input value={dotNumber} onChange={(e) => setDotNumber(e.target.value)}
        placeholder="e.g. 1234567"
        style={{
          width: "100%", padding: 8, marginBottom: 14, background: "#ffffff",
          border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
        }} />

      <p style={{ fontSize: 13, color: "#14181f", marginBottom: 8 }}>
        Are you covered under this carrier's active insurance/authority for this trip?
      </p>
      <button onClick={() => submit("covered")} disabled={submitting}
        style={{
          marginRight: 8, background: "#166534", color: "#fff", border: "none",
          borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 700,
          cursor: submitting ? "not-allowed" : "pointer",
        }}>
        Yes
      </button>
      <button onClick={() => submit("not_covered")} disabled={submitting}
        style={{
          background: "#fdecec", color: "#991b1b", border: "1px solid #991b1b",
          borderRadius: 6, padding: "8px 16px", fontSize: 13, fontWeight: 700,
          cursor: submitting ? "not-allowed" : "pointer",
        }}>
        No / not sure
      </button>
    </div>
  );
}

// The existing tool for logged-in, verified carriers: check on yourself,
// or send a private link to a driver you're assigning to a load found
// elsewhere (DAT, Truckstop, a phone call, etc.).
function VerifiedCarrierTool() {
  const [driverType, setDriverType] = useState("self");
  const [driverName, setDriverName] = useState("");
  const [driverContact, setDriverContact] = useState("");
  const [driverConsent, setDriverConsent] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  return (
    <div>
      <h1 style={{ color: "#14181f", marginBottom: 4 }}>Confirm Driver Coverage</h1>
      <p style={{ color: "#4b5568", fontSize: 13, marginBottom: 20 }}>
        Got a load from somewhere other than Midnight Loadboard (DAT, Truckstop, a phone call, whatever)?
        Use this to send a quick coverage confirmation to whoever's driving — same safety check, no load
        listing required.
      </p>

      {!result && (
        <div style={{
          background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
          padding: "16px 20px",
        }}>
          <label style={{ display: "block", fontSize: 12, color: "#4b5568", marginBottom: 6 }}>
            Who's actually driving this load?
          </label>
          <label style={{ display: "block", fontSize: 13, color: "#14181f", marginBottom: 6 }}>
            <input type="radio" checked={driverType === "self"}
              onChange={() => setDriverType("self")} /> I'm driving it myself
          </label>
          <label style={{ display: "block", fontSize: 13, color: "#14181f", marginBottom: 10 }}>
            <input type="radio" checked={driverType === "assigned"}
              onChange={() => setDriverType("assigned")} /> I'm assigning a driver
          </label>

          {driverType === "assigned" && (
            <>
              <input value={driverName} onChange={(e) => setDriverName(e.target.value)}
                placeholder="Driver's name"
                style={{
                  width: "100%", padding: 8, marginBottom: 8, background: "#ffffff",
                  border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
                }} />
              <input value={driverContact} onChange={(e) => setDriverContact(e.target.value)}
                placeholder="Driver's email"
                style={{
                  width: "100%", padding: 8, marginBottom: 8, background: "#ffffff",
                  border: "1px solid #e2e5ea", borderRadius: 6, color: "#14181f", fontSize: 13,
                }} />
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: -4, marginBottom: 10 }}>
                Texting isn't available right now — we'll email the driver a private confirmation link instead.
              </p>

              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
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
              background: (driverType === "assigned" && !driverConsent) ? "#d1e7dd" : "#166534",
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
          background: "#f7f8fa", border: "1px solid #e2e5ea", borderRadius: 12,
          padding: "16px 20px",
        }}>
          {result.error && <p style={{ color: "#991b1b", fontSize: 13 }}>{result.error}</p>}
          {result.selfAttestationNeeded && <SelfAttestPrompt token={result.token} />}
          {result.assignedLinkSent && (
            <div>
              <p style={{ color: "#166534", fontSize: 12, marginBottom: 8 }}>
                Confirmation email sent to the driver automatically.
              </p>
              <p style={{ color: "#4b5568", fontSize: 12, marginBottom: 6 }}>
                You can also share this link directly if needed:
              </p>
              <LinkBox url={result.confirmUrl} />
            </div>
          )}
          {result.assignedLinkSent === false && result.confirmUrl && (
            <div>
              <p style={{ color: "#991b1b", fontSize: 13, marginBottom: 6 }}>
                {result.error || "The confirmation email couldn't be sent."} Share this link with the driver yourself:
              </p>
              <LinkBox url={result.confirmUrl} />
            </div>
          )}
          {!result.error && (
            <button onClick={() => { setResult(null); setDriverName(""); setDriverContact(""); setDriverConsent(false); }}
              style={{
                marginTop: 12, background: "transparent", color: "#4b5568", border: "1px solid #e2e5ea",
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
      display: "flex", alignItems: "center", gap: 8, background: "#ffffff",
      border: "1px solid #e2e5ea", borderRadius: 6, padding: "8px 10px", marginBottom: 8,
    }}>
      <code style={{ color: "#1d4ed8", fontSize: 13, wordBreak: "break-all", flex: 1 }}>{url}</code>
      <button
        onClick={() => navigator.clipboard.writeText(url)}
        style={{
          background: "#e2e5ea", color: "#14181f", border: "none", borderRadius: 6,
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
  if (answered) return <p style={{ color: "#166534", fontSize: 13 }}>Thanks - recorded.</p>;
  return (
    <div>
      <p style={{ fontSize: 13, color: "#14181f", marginBottom: 8 }}>
        Confirm: are you covered under your own active insurance/authority for this trip?
      </p>
      <button onClick={() => respond("own_authority")}
        style={{ marginRight: 8, background: "#166534", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
        Yes
      </button>
      <button onClick={() => respond("neither")}
        style={{ background: "#fdecec", color: "#991b1b", border: "1px solid #991b1b", borderRadius: 6, padding: "6px 12px", fontSize: 12 }}>
        No / not sure
      </button>
    </div>
  );
}
