// Public spec: how anyone can check a Nightlane label-8420 record without
// trusting Nightlane's website. Static; mirrors lib/carrierFingerprint.js and
// recordFromMetadata() in lib/cardanoRecord.js. If either changes, the layout
// version (facts.v) changes and this page gets a new section.

import Checker from "./Checker";

export const metadata = {
  title: "How to verify a Nightlane record | Nightlane",
  description:
    "The exact recipe for re-deriving the SHA-256 fingerprint of a Nightlane carrier-check record (Cardano metadata label 8420), with a worked example from mainnet.",
};

const WALLET = "addr1qytk2zvppcytejkh09p358qkn6mm3fxc2vg2qlehj6kexj50qpvpl7qvswxtuj4g7vawuq98qpd452akzulurtfyrzss5mpx8p";
const EXAMPLE_TX = "328001821078edb2eb233e188a33b2110889a129f1e198092c8e03432e001a28";
const EXAMPLE_HASH = "ddc937972ed5826e4e9208ce2deed49ffbff06574af788be4f66b46d3996d25d";

const EXAMPLE_METADATA = `{
  "8420": {
    "app": "nightlane",
    "kind": "carrier-check",
    "dot": "3442654",
    "on": "2026-11-23",
    "sha256": "${EXAMPLE_HASH}",
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

const EXAMPLE_BYTES =
  '{"allowedToOperate":true,"authorities":["Broker","Property"],"authorityUnknown":false,"bipdInsurance":750000,"cargoInsurance":false,"checkedOn":"2026-11-23","dot":"3442654","name":"SWICK LOGISTICS LLC","outOfService":false,"powerUnits":1,"v":1}';

const JS_CODE = `// Node.js 18+. md = the object under label "8420".
const { createHash } = require("crypto");

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

// JSON, keys sorted at every level, no whitespace. Arrays keep their order.
function canonical(x) {
  if (Array.isArray(x)) return "[" + x.map(canonical).join(",") + "]";
  if (x && typeof x === "object")
    return "{" + Object.keys(x).sort()
      .map((k) => JSON.stringify(k) + ":" + canonical(x[k])).join(",") + "}";
  return JSON.stringify(x === undefined ? null : x);
}

const bytes = canonical(rebuild(md));
const hash = createHash("sha256").update(bytes, "utf8").digest("hex");
console.log(hash === md.sha256 ? "MATCH" : "NO MATCH", hash);`;

const SHELL = `printf '%s' '${EXAMPLE_BYTES}' | sha256sum`;

const wrap = { maxWidth: 760, margin: "0 auto" };
const p = { color: "#374151", fontSize: 15, lineHeight: 1.65, margin: "0 0 12px" };
const h2 = { color: "#14181f", fontSize: 20, margin: "28px 0 10px" };
const pre = {
  background: "#0f172a", color: "#e2e8f0", padding: 14, borderRadius: 8, fontSize: 13,
  lineHeight: 1.5, overflowX: "auto", whiteSpace: "pre", margin: "0 0 14px",
};
const preWrap = { ...pre, whiteSpace: "pre-wrap", wordBreak: "break-all" };
const th = { textAlign: "left", padding: "6px 8px", borderBottom: "1px solid #e2e5ea", fontSize: 13, color: "#14181f" };
const td = { padding: "6px 8px", borderBottom: "1px solid #eef0f3", fontSize: 13, color: "#374151", verticalAlign: "top" };
const code = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13 };

const FIELDS = [
  ["v", "facts.v", "Number. Layout version, currently 1."],
  ["dot", "dot", "String, digits only."],
  ["name", "facts.name", "Join the array of chunks with no separator (Cardano strings max 64 bytes, so long names are split)."],
  ["allowedToOperate", "facts.allowed", "true if 1, else false."],
  ["outOfService", "facts.oos", "true if 1, else false."],
  ["authorities", "facts.auth", "Array of strings, in the order stored (already sorted when written)."],
  ["authorityUnknown", "facts.authUnknown", "true if 1, else false."],
  ["bipdInsurance", "facts.bipd", "Number (US dollars), or the string \"on file\". null if the key is absent."],
  ["cargoInsurance", "facts.cargo", "true if 1, else false."],
  ["powerUnits", "facts.pu", "Number. null if the key is absent."],
  ["checkedOn", "on", "String, UTC date YYYY-MM-DD."],
];

export default function HowToVerify() {
  return (
    <div style={wrap}>
      <p style={{ ...p, fontSize: 13, marginBottom: 4 }}><a href="/verify">← Verified on Cardano</a></p>
      <h1 style={{ color: "#14181f", marginBottom: 8 }}>How to verify a Nightlane record yourself</h1>
      <p style={p}>
        Every Nightlane carrier check saved on Cardano carries a SHA-256 fingerprint of the facts FMCSA showed that day.
        This page is the exact recipe, so anyone can re-derive the fingerprint from the on-chain data and check it
        without trusting this website. Records use transaction metadata label <strong>8420</strong>, registered to
        Nightlane in{" "}
        <a href="https://github.com/cardano-foundation/CIPs/tree/master/CIP-0010" target="_blank" rel="noopener noreferrer">CIP-0010</a>.
      </p>

      <h2 style={h2}>1. Check who sent it</h2>
      <p style={p}>
        Anyone can write metadata under any label. A record is a Nightlane record only if the transaction was sent from
        Nightlane&apos;s mainnet record wallet:
      </p>
      <pre style={preWrap}>{WALLET}</pre>
      <p style={{ ...p, fontSize: 14 }}>
        To list every transaction under label 8420 straight from Cardano (no Nightlane involved), open{" "}
        <a href="https://api.koios.rest/api/v1/tx_by_metalabel?_label=8420" target="_blank" rel="noopener noreferrer">
          api.koios.rest/api/v1/tx_by_metalabel?_label=8420
        </a>
        . That list includes transactions from other wallets too (label numbers can be used by anyone), which is why
        the sender check matters.
      </p>

      <h2 style={h2}>2. Read the metadata</h2>
      <p style={p}>A real mainnet record (Swick Logistics, checked 23 Nov 2026):</p>
      <pre style={pre}>{EXAMPLE_METADATA}</pre>
      <p style={{ ...p, fontSize: 14 }}>
        On chain:{" "}
        <a href={`https://cardanoscan.io/transaction/${EXAMPLE_TX}`} target="_blank" rel="noopener noreferrer">
          view this transaction on Cardanoscan
        </a>
        . Cardano metadata has no booleans or nulls, so flags are stored as 1/0 and unknown values are left out.
      </p>
      <p style={p}>
        <strong>Batches.</strong> To save on network fees, newer transactions can hold many checks at once. Their
        metadata says <code>&quot;kind&quot;: &quot;carrier-check-batch&quot;</code> and has a <code>records</code> list.
        Each entry in the list has the same fields as the single record above (<code>dot</code>, <code>on</code>,{" "}
        <code>sha256</code>, <code>facts</code>) and is checked exactly the same way. The checker below handles both.
      </p>

      <h2 style={h2}>3. Rebuild the record that was hashed (layout v1)</h2>
      <p style={p}>Build an object with exactly these 11 keys:</p>
      <div style={{ overflowX: "auto", marginBottom: 14 }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead><tr><th style={th}>Key</th><th style={th}>From metadata</th><th style={th}>Rule</th></tr></thead>
          <tbody>
            {FIELDS.map(([k, from, rule]) => (
              <tr key={k}><td style={{ ...td, ...code }}>{k}</td><td style={{ ...td, ...code }}>{from}</td><td style={td}>{rule}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2}>4. Serialize it the same way every time</h2>
      <ul style={{ ...p, paddingLeft: 20 }}>
        <li>JSON with object keys sorted at every level (plain code-point order; all keys are ASCII).</li>
        <li>No spaces or line breaks anywhere.</li>
        <li>Arrays keep their stored order.</li>
        <li>Strings and numbers written as standard JSON (<span style={code}>JSON.stringify</span>); booleans as <span style={code}>true</span>/<span style={code}>false</span>; missing values as <span style={code}>null</span>.</li>
        <li>Encode the result as UTF-8.</li>
      </ul>
      <p style={p}>For the example record, the exact bytes are:</p>
      <pre style={preWrap}>{EXAMPLE_BYTES}</pre>

      <h2 style={h2}>5. Hash it</h2>
      <p style={p}>SHA-256 of those bytes, as lowercase hex, must equal the record&apos;s <span style={code}>sha256</span>:</p>
      <pre style={preWrap}>{EXAMPLE_HASH}</pre>
      <p style={p}>Check it from any terminal:</p>
      <pre style={preWrap}>{SHELL}</pre>
      <p style={p}>Or in code:</p>
      <pre style={pre}>{JS_CODE}</pre>
      <Checker />

      <h2 style={h2}>Versions</h2>
      <p style={p}>
        <span style={code}>facts.v</span> is the layout version. If the set of fields or any rule above ever changes,
        new records get a new version number and this page gets a new section. Records written under an older version
        stay verifiable with that version&apos;s rules. Some of the very first test-network records carried only the
        fingerprint, without facts; those can&apos;t be re-derived.
      </p>

      <h2 style={h2}>What a record does and doesn&apos;t prove</h2>
      <p style={p}>
        A matching record proves Nightlane saw these public FMCSA facts for this DOT number on that date, and that
        nobody has changed them since. It does not prove the carrier&apos;s status today, its reputation, or that
        someone contacting you really works there.
      </p>
      <p style={{ ...p, fontSize: 14 }}>
        Source code:{" "}
        <a href="https://github.com/Robariano/midnight-loadboard-app/blob/main/lib/carrierFingerprint.js" target="_blank" rel="noopener noreferrer">lib/carrierFingerprint.js</a>
        {" · "}
        <a href="https://github.com/Robariano/midnight-loadboard-app/blob/main/docs/cardano-label-8420.md" target="_blank" rel="noopener noreferrer">label 8420 spec on GitHub</a>
      </p>
    </div>
  );
}
