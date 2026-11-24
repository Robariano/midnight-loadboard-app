// Nightlane's tools for AI assistants (served over MCP at /api/mcp).
// Each tool wraps something the website already does, so an AI dispatcher
// anywhere can check a broker or carrier and verify Nightlane's Cardano
// records without a person opening the site.
import { lookupCarrierByDot, lookupCarrierByMc, searchCarriersByName } from "./fmcsa";
import { recordCheckIfNeeded, listRecordsForDot, expandRecords, recordFromMetadata } from "./cardanoRecord";
import { fingerprintRecord, canonicalJson } from "./carrierFingerprint";
import { koiosTx, NIGHTLANE_WALLETS } from "./koios";

const SITE = process.env.APP_BASE_URL || "https://www.nightlaneloads.com";

export const TOOLS = [
  {
    name: "check_carrier",
    title: "Check a broker or carrier",
    description:
      "Look up a US trucking broker or carrier in the FMCSA public registry (operating authority, out-of-service status, insurance on file, truck count) and save a tamper-proof record of the check on the Cardano blockchain (metadata label 8420). Give a DOT number, an MC number, or a company name. A name returns a list of matches; check again with the right DOT number. Use before booking with or paying an unfamiliar broker.",
    inputSchema: {
      type: "object",
      properties: {
        dot_number: { type: "string", description: "USDOT number, digits only." },
        mc_number: { type: "string", description: "MC (docket) number, digits only." },
        name: { type: "string", description: "Company name, if no number is known." },
      },
    },
    annotations: { readOnlyHint: false, openWorldHint: true },
  },
  {
    name: "list_records",
    title: "List a company's Cardano records",
    description:
      "List Nightlane's Cardano records for one USDOT number, newest first: what FMCSA showed about the company on each date it was checked, with the transaction hash and whether each record's fingerprint matches its facts. Useful to see a broker's history (for example, authority that was active last week and is gone today).",
    inputSchema: {
      type: "object",
      properties: { dot_number: { type: "string", description: "USDOT number, digits only." } },
      required: ["dot_number"],
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  {
    name: "verify_record",
    title: "Verify a Nightlane Cardano record",
    description:
      "Independently verify one Nightlane record on Cardano: fetch the transaction from Koios (a public Cardano API Nightlane doesn't run), rebuild each record's facts, recompute the SHA-256 fingerprint, and check the transaction was sent from Nightlane's wallet. Handles single records and batches.",
    inputSchema: {
      type: "object",
      properties: {
        tx_hash: { type: "string", description: "Cardano transaction hash (64 hex characters)." },
        dot_number: { type: "string", description: "Optional: only report the record for this USDOT number (for batch transactions)." },
        network: { type: "string", enum: ["mainnet", "preprod"], description: "Default mainnet." },
      },
      required: ["tx_hash"],
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
];

const digits = (v) => String(v || "").replace(/\D/g, "");

function summarize(s) {
  const auth = (s.authorities || []).filter((a) => a.active !== false).map((a) => a.type || a).join(", ") || (s.authorityUnknown ? "couldn't confirm" : "none");
  return [
    `${s.legalName}${s.dbaName ? ` (DBA ${s.dbaName})` : ""}, USDOT ${s.dotNumber}`,
    `Allowed to operate: ${s.allowToOperate ? "yes" : "NO"}${s.outOfService ? " - OUT OF SERVICE" : ""}`,
    `Active authority: ${auth}`,
    `Broker authority: ${s.authorityStatusCodes?.broker === "A" ? "ACTIVE" : "not active"}`,
    `Liability insurance on file: ${s.bipdInsuranceAmount ? `$${Number(s.bipdInsuranceAmount).toLocaleString("en-US")}` : s.bipdInsuranceOnFile ? "on file" : "none shown"}`,
    s.address ? `Address on file: ${s.address}` : null,
  ].filter(Boolean).join("\n");
}

async function checkCarrier({ dot_number, mc_number, name }) {
  const dot = digits(dot_number);
  const mc = digits(mc_number);
  if (!dot && !mc) {
    const q = String(name || "").trim();
    if (q.length < 3) throw new Error("Give a dot_number, an mc_number, or a name of at least 3 letters.");
    const matches = await searchCarriersByName(q);
    if (!matches.length) return { text: `No FMCSA companies found matching "${q}". Try fewer words.`, data: { matches: [] } };
    return {
      text: `FMCSA companies matching "${q}". Check again with the right dot_number (match the city and phone the broker gave you):\n`
        + matches.map((m) => `- USDOT ${m.dotNumber}: ${m.legalName}${m.dbaName ? ` (DBA ${m.dbaName})` : ""}, ${m.city}, ${m.state}`).join("\n"),
      data: { matches },
    };
  }
  const snapshot = dot ? await lookupCarrierByDot(dot) : await lookupCarrierByMc(mc);
  if (!snapshot) return { text: `No FMCSA record for ${dot ? "USDOT " + dot : "MC " + mc}.`, data: { snapshot: null } };
  const chain = snapshot.dotNumber ? await recordCheckIfNeeded(snapshot) : null;
  const chainLine = chain?.txHash
    ? `Saved on Cardano: ${chain.url}`
    : chain?.queued
      ? "Queued to be saved on Cardano in the next batch."
      : "Not saved on Cardano this time.";
  return {
    text: `${summarize(snapshot)}\n${chainLine}\nHistory: ${SITE}/verify?dot=${snapshot.dotNumber}`,
    data: { snapshot, chain },
  };
}

async function listRecords({ dot_number }) {
  const dot = digits(dot_number);
  if (!dot) throw new Error("dot_number is required.");
  const res = await listRecordsForDot(dot, { max: 10 });
  if (!res.enabled) return { text: "Cardano records aren't turned on.", data: res };
  const genuine = res.records.filter((r) => r.fromNightlane);
  if (!genuine.length) return { text: `No Nightlane Cardano records for USDOT ${dot} yet.`, data: res };
  const lines = genuine.map((r) => {
    const f = r.record;
    const facts = f ? `${f.name}; allowed ${f.allowedToOperate ? "yes" : "NO"}${f.outOfService ? ", OUT OF SERVICE" : ""}; authority ${f.authorities.join(", ") || "none"}` : "fingerprint only";
    return `- ${r.checkedOn}: ${facts}. Fingerprint ${r.hashMatches ? "matches" : r.hashMatches === false ? "DOES NOT match" : "n/a"}. tx ${r.txHash}`;
  });
  return { text: `Nightlane records for USDOT ${dot} (${res.network}), newest first:\n${lines.join("\n")}`, data: { network: res.network, records: genuine } };
}

async function verifyRecord({ tx_hash, dot_number, network }) {
  const tx = await koiosTx(tx_hash, network);
  const records = expandRecords(tx.metadata);
  if (!records.length) return { text: "That transaction's label-8420 metadata isn't a Nightlane record.", data: { tx: tx.tx } };
  const wallets = NIGHTLANE_WALLETS[tx.network] || [];
  const fromNightlane = wallets.length ? tx.senders.length > 0 && tx.senders.every((a) => wallets.includes(a)) : null;
  const want = digits(dot_number);
  const results = records
    .filter((md) => !want || String(md.dot) === want)
    .map((md) => {
      const record = recordFromMetadata(md);
      const computed = record ? fingerprintRecord(record) : null;
      return { dot: String(md.dot), on: md.on, name: record?.name || null, expected: md.sha256, computed, matches: computed === md.sha256, bytes: record ? canonicalJson(record) : null };
    });
  if (!results.length) return { text: `That transaction has no record for USDOT ${want}.`, data: { tx: tx.tx, records: records.length } };
  const ok = results.filter((r) => r.matches).length;
  const sender = fromNightlane === null ? "Sender not checked on this network." : fromNightlane ? "Sent from Nightlane's wallet: genuine Nightlane record." : "NOT sent from Nightlane's wallet: not a Nightlane record.";
  const text = [
    `Transaction ${tx.tx} (${tx.network}${records.length > 1 ? `, batch of ${records.length}` : ""}).`,
    sender,
    `${ok} of ${results.length} fingerprint${results.length === 1 ? "" : "s"} match.`,
    ...results.slice(0, 10).map((r) => `- USDOT ${r.dot} ${r.name || ""} checked ${r.on}: ${r.matches ? "matches" : "DOES NOT match"}`),
  ].join("\n");
  return { text, data: { tx: tx.tx, network: tx.network, fromNightlane, senders: tx.senders, results } };
}

export async function callTool(name, args = {}) {
  if (name === "check_carrier") return checkCarrier(args);
  if (name === "list_records") return listRecords(args);
  if (name === "verify_record") return verifyRecord(args);
  throw Object.assign(new Error(`Unknown tool: ${name}`), { code: -32602 });
}
