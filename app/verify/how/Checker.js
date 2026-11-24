"use client";
import { useState } from "react";

// Re-derives a Nightlane record's fingerprint entirely in the visitor's
// browser: paste the label-8420 metadata from a block explorer (or Koios),
// and the SHA-256 is computed on this device with the Web Crypto API.
// Nothing is sent to Nightlane.

const EXAMPLE = `{
  "8420": {
    "app": "nightlane",
    "kind": "carrier-check",
    "dot": "3442654",
    "on": "2026-11-23",
    "sha256": "ddc937972ed5826e4e9208ce2deed49ffbff06574af788be4f66b46d3996d25d",
    "facts": {
      "v": 1,
      "name": ["SWICK LOGISTICS LLC"],
      "allowed": 1,
      "oos": 0,
      "auth": ["Broker", "Property"],
      "authUnknown": 0,
      "cargo": 0,
      "bipd": 750000,
      "pu": 1
    }
  }
}`;

function rebuild(md) {
  const f = md.facts;
  return {
    v: Number(f.v),
    dot: String(md.dot),
    name: (Array.isArray(f.name) ? f.name : [f.name || ""]).join(""),
    allowedToOperate: Number(f.allowed) === 1,
    outOfService: Number(f.oos) === 1,
    authorities: Array.isArray(f.auth) ? f.auth.map(String) : [],
    authorityUnknown: Number(f.authUnknown) === 1,
    bipdInsurance: f.bipd === undefined ? null : f.bipd,
    cargoInsurance: Number(f.cargo) === 1,
    powerUnits: f.pu === undefined ? null : Number(f.pu),
    checkedOn: String(md.on),
  };
}

function canonical(x) {
  if (Array.isArray(x)) return "[" + x.map(canonical).join(",") + "]";
  if (x && typeof x === "object") {
    return "{" + Object.keys(x).sort().map((k) => JSON.stringify(k) + ":" + canonical(x[k])).join(",") + "}";
  }
  return JSON.stringify(x === undefined ? null : x);
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Accepts {"8420": {...}}, the inner object itself, or an explorer/Koios
// response that has the record somewhere inside it.
function findRecord(value) {
  if (!value || typeof value !== "object") return null;
  if (value.facts && value.sha256 && value.on) return value;
  if (value["8420"]) return findRecord(value["8420"]);
  for (const v of Array.isArray(value) ? value : Object.values(value)) {
    const found = findRecord(v);
    if (found) return found;
  }
  return null;
}

const box = { background: "#f3f7ff", border: "1px solid #bcd0fb", borderRadius: 12, padding: 16, margin: "0 0 16px" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, wordBreak: "break-all" };

export default function Checker() {
  const [text, setText] = useState(EXAMPLE);
  const [result, setResult] = useState(null);

  async function check() {
    setResult(null);
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      setResult({ error: "That isn't valid JSON. Paste the whole metadata block, including the curly braces." });
      return;
    }
    const md = findRecord(parsed);
    if (!md) {
      setResult({ error: "Couldn't find a Nightlane record (with facts, sha256 and on) in what you pasted." });
      return;
    }
    if (md.app && md.app !== "nightlane") {
      setResult({ error: `This record says app "${md.app}", not "nightlane".` });
      return;
    }
    try {
      const bytes = canonical(rebuild(md));
      const hash = await sha256Hex(bytes);
      setResult({ bytes, hash, expected: String(md.sha256).toLowerCase(), match: hash === String(md.sha256).toLowerCase() });
    } catch (e) {
      setResult({ error: "Couldn't rebuild the record: " + e.message });
    }
  }

  return (
    <div style={box}>
      <h3 style={{ margin: "0 0 6px", color: "#14181f", fontSize: 17 }}>Check one right here, on your own device</h3>
      <p style={{ margin: "0 0 10px", color: "#374151", fontSize: 14, lineHeight: 1.6 }}>
        Paste a record&apos;s label-8420 metadata, copied from a block explorer (the transaction&apos;s Metadata tab
        on Cardanoscan) or from Koios. The fingerprint is computed in your browser with its built-in SHA-256.
        Nothing you paste is sent to Nightlane. The example below is the Swick Logistics record from step 2.
      </p>
      <textarea
        aria-label="Record metadata JSON"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        style={{ width: "100%", minHeight: 200, boxSizing: "border-box", padding: 10, borderRadius: 8, border: "1px solid #cbd5e1", ...mono }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <button onClick={check} style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Check fingerprint
        </button>
        <button onClick={() => { setText(""); setResult(null); }} style={{ background: "#fff", color: "#14181f", border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 16px", fontSize: 15, cursor: "pointer" }}>
          Clear
        </button>
      </div>

      {result?.error && <p style={{ color: "#991b1b", margin: "12px 0 0", fontSize: 14 }}>{result.error}</p>}
      {result && !result.error && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: result.match ? "#ecfdf3" : "#fdecec", border: `1px solid ${result.match ? "#86efac" : "#fca5a5"}` }}>
          <p style={{ margin: "0 0 8px", fontWeight: 800, color: result.match ? "#166534" : "#991b1b", fontSize: 16 }}>
            {result.match ? "✓ Fingerprint matches" : "✗ Fingerprint does not match"}
          </p>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "#374151" }}>Bytes hashed:</p>
          <p style={{ margin: "0 0 8px", ...mono }}>{result.bytes}</p>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "#374151" }}>Computed SHA-256: <span style={mono}>{result.hash}</span></p>
          <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>Record says: <span style={mono}>{result.expected}</span></p>
          {result.match && (
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#374151" }}>
              Last step: on the explorer, confirm the transaction was sent from Nightlane&apos;s wallet (step 1). Other
              people can and do write under label 8420, so the sender is what makes it a Nightlane record.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
