import { createHash } from "crypto";

// A carrier-check "fingerprint": a SHA-256 hash of the facts Nightlane saw
// when it checked a carrier against FMCSA. Saving only the hash (on Cardano,
// see lib/cardanoRecord.js) proves later that this exact check happened on
// this date without publishing anything new; every field here is already
// public FMCSA data.
//
// The fields are fixed and versioned on purpose. Changing what goes into the
// record changes every hash, so a new layout gets a new version number and old
// records stay verifiable with the old layout.
export const FINGERPRINT_VERSION = 1;

// Pull only the facts that matter for "was this carrier legit at that moment",
// in a fixed order, with stable types.
export function recordFromSnapshot(snapshot) {
  if (!snapshot || !snapshot.dotNumber) throw new Error("A carrier snapshot with a DOT number is required.");
  const authorities = (snapshot.authorities || [])
    .map((a) => (typeof a === "string" ? a : a?.type || a?.name || JSON.stringify(a)))
    .map((s) => String(s).trim())
    .filter(Boolean)
    .sort();
  return {
    v: FINGERPRINT_VERSION,
    dot: String(snapshot.dotNumber).replace(/\D/g, ""),
    name: (snapshot.legalName || "").trim().toUpperCase(),
    allowedToOperate: !!snapshot.allowToOperate,
    outOfService: !!snapshot.outOfService,
    authorities,
    authorityUnknown: !!snapshot.authorityUnknown,
    bipdInsurance: snapshot.bipdInsuranceAmount ?? (snapshot.bipdInsuranceOnFile ? "on file" : null),
    cargoInsurance: !!snapshot.cargoInsuranceOnFile,
    powerUnits: snapshot.powerUnits ?? null,
    // Day precision (UTC) so the record reads as "checked on this date".
    checkedOn: String(snapshot.checkedAt || new Date().toISOString()).slice(0, 10),
  };
}

// JSON with keys sorted at every level, so the same facts always produce the
// same bytes and the same hash.
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

export function fingerprintRecord(record) {
  return createHash("sha256").update(canonicalJson(record)).digest("hex");
}

export function fingerprintSnapshot(snapshot) {
  const record = recordFromSnapshot(snapshot);
  return { record, hash: fingerprintRecord(record) };
}
