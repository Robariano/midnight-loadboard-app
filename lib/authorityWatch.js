// Authority Watch: turns an FMCSA snapshot (lib/fmcsa.js lookupCarrierByDot)
// into a small status object, and compares two of them to decide what to
// alert a carrier about.
//
// Alert rules are deliberately conservative because FMCSA's public data feed
// can leave items out (seen with new authorities that SAFER shows as
// AUTHORIZED while the feed shows nothing):
// - We only warn when an item goes from GOOD last check to BAD now. An item
//   that was never shown at signup never triggers a warning.
// - We only send "good news" for an item we previously warned about.

export const FMCSA_REGISTRATION_PHONE = "800-832-5660";

export function watchStatus(s) {
  return {
    allowToOperate: !!s.allowToOperate,
    outOfService: !!s.outOfService,
    // null = FMCSA's feed and SAFER both failed to answer; compareStatus skips it.
    propertyAuthority: s.authorityUnknown ? null : (s.authorities || []).some((a) => a.type === "Property"),
    bipdOnFile: !!s.bipdInsuranceOnFile,
    powerUnits: s.powerUnits ?? null,
  };
}

const CHECKS = [
  {
    key: "allowToOperate", good: true,
    bad: "FMCSA no longer shows you as allowed to operate",
    back: "FMCSA shows you as allowed to operate again",
  },
  {
    key: "outOfService", good: false,
    bad: "FMCSA shows an out-of-service order",
    back: "the out-of-service order no longer shows",
  },
  {
    key: "propertyAuthority", good: true,
    bad: "your for-hire authority no longer shows as active",
    back: "your for-hire authority shows as active again",
  },
  {
    key: "bipdOnFile", good: true,
    bad: "your liability insurance no longer shows on file",
    back: "your liability insurance shows on file again",
  },
];

// prev/cur are watchStatus() objects; openIssues is the list of keys we
// already warned about. Returns new problems, recoveries, and the updated
// open-issue list.
export function compareStatus(prev, cur, openIssues = []) {
  const problems = [];
  const recovered = [];
  const open = new Set(openIssues);

  for (const c of CHECKS) {
    // An item we couldn't read this time is neither a problem nor a recovery.
    if (cur[c.key] === null || cur[c.key] === undefined) continue;
    const wasGood = prev && prev[c.key] === c.good;
    const isGood = cur[c.key] === c.good;
    if (wasGood && !isGood && !open.has(c.key)) {
      problems.push({ key: c.key, text: c.bad });
      open.add(c.key);
    } else if (isGood && open.has(c.key)) {
      recovered.push({ key: c.key, text: c.back });
      open.delete(c.key);
    }
  }
  return { problems, recovered, openIssues: [...open] };
}

// Heads-up notes shown right after signup (not alerts).
export function signupNotes(s) {
  const st = watchStatus(s);
  const notes = [];
  if (!st.allowToOperate) notes.push("FMCSA's data feed doesn't show you as allowed to operate. Confirm on SAFER.");
  if (st.outOfService) notes.push("FMCSA shows an out-of-service order.");
  if (st.propertyAuthority === false) notes.push("Active for-hire authority isn't shown by FMCSA (data feed or SAFER). If you were just granted authority, it can take a few days to show; confirm on SAFER.");
  if (!st.bipdOnFile) notes.push("Liability insurance isn't shown in FMCSA's data feed. Confirm on SAFER or with your insurance agent.");
  if (st.powerUnits === 0) notes.push("FMCSA shows 0 power units. That can be normal if your only vehicle is a van under 10,001 lb (FMCSA lists those as non-CMV units, not power units), but some brokers' vetting tools still flag 0 power units, so mention your equipment when you set up with a broker.");
  return notes;
}
