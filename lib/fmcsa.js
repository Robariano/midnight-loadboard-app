// Thin wrapper around FMCSA's public QCMobile API (SAFER data) so the admin
// carrier review screen can show live registration/safety data next to
// whatever the carrier submitted, instead of Rob cross-checking FMCSA's site
// by hand for every application.
//
// Requires a free FMCSA developer WebKey (Login.gov account -> "Get a new
// WebKey" at https://mobile.fmcsa.dot.gov/QCDevsite/logingovInfo). Set it as
// FMCSA_WEB_KEY in .env.local and in Vercel, same as the Twilio vars.
//
// Docs: https://mobile.fmcsa.dot.gov/QCDevsite/docs/qcApi

const BASE_URL = "https://mobile.fmcsa.dot.gov/qc/services";

function getWebKey() {
  const key = process.env.FMCSA_WEB_KEY;
  if (!key) {
    throw new Error("FMCSA_WEB_KEY is not configured.");
  }
  return key;
}

async function fmcsaGet(path) {
  const webKey = getWebKey();
  const url = `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}webKey=${encodeURIComponent(webKey)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`FMCSA API error ${res.status} for ${path}`);
  }
  return res.json();
}

// Looks up a carrier by DOT number and returns a normalized snapshot combining
// the base carrier record + operating authority status. Returns null if the
// DOT number doesn't resolve to a carrier on file.
export async function lookupCarrierByDot(dotNumber) {
  const cleanDot = String(dotNumber || "").trim();
  if (!cleanDot) return null;

  const [carrierRes, authorityRes] = await Promise.all([
    fmcsaGet(`/carriers/${cleanDot}`),
    fmcsaGet(`/carriers/${cleanDot}/authority`).catch(() => null),
  ]);

  const carrier = carrierRes?.content?.carrier || carrierRes?.content || carrierRes;
  if (!carrier) return null;

  const authorityList = authorityRes?.content || [];

  return {
    dotNumber: carrier.dotNumber ?? cleanDot,
    legalName: carrier.legalName || null,
    dbaName: carrier.dbaName || null,
    allowToOperate: carrier.allowToOperate === "Y",
    outOfService: carrier.outOfService === "Y",
    outOfServiceDate: carrier.outOfServiceDate || null,
    complaintCount: carrier.complaintCount ?? 0,
    address: [carrier.phyStreet, carrier.phyCity, carrier.phyState, carrier.phyZip]
      .filter(Boolean)
      .join(", "),
    telephone: carrier.telephone || null,
    authorities: Array.isArray(authorityList)
      ? authorityList.map((a) => ({
          type: a.authorityType || a.type || null,
          status: a.authorityStatus || a.status || null,
        }))
      : [],
    checkedAt: new Date().toISOString(),
  };
}
export async function lookupCarrierByMc(mcNumber) {
  const cleanMc = String(mcNumber || "").replace(/\D/g, "").trim();
  if (!cleanMc) return null;

  const docketRes = await fmcsaGet(`/carriers/docket-number/${cleanMc}`);
  const matches = docketRes?.content;
  if (!matches || !Array.isArray(matches) || matches.length === 0) return null;

  const dotNumber = matches[0]?.carrier?.dotNumber || matches[0]?.dotNumber;
  if (!dotNumber) return null;

  return lookupCarrierByDot(dotNumber);
}
