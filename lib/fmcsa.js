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
function insuranceOnFile(v) {
  if (v === "Y") return true;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

export async function lookupCarrierByDot(dotNumber) {
  const cleanDot = String(dotNumber || "").trim();
  if (!cleanDot) return null;

  const [carrierRes, authorityRes] = await Promise.all([
    fmcsaGet(`/carriers/${cleanDot}`),
    fmcsaGet(`/carriers/${cleanDot}/authority`).catch(() => null),
  ]);

  const carrier = carrierRes?.content?.carrier || carrierRes?.content || carrierRes;
  if (!carrier) return null;

  // content can come back as an array or a single object depending on how
  // many authority records the entity has.
  const rawAuthority = authorityRes?.content;
  const authorityList = Array.isArray(rawAuthority) ? rawAuthority : rawAuthority ? [rawAuthority] : [];

  // FMCSA's real shape here is a list of { carrierAuthority: {...} } objects,
  // each with separate Y/N flags for property, passenger, household goods,
  // and broker authority (plus a few status fields) - not a simple
  // type/status pair like we originally assumed. Flatten that into a clean
  // list of just the authority types this entity actually holds.
  const authorities = Array.isArray(authorityList)
    ? authorityList
        .map((a) => a.carrierAuthority || a)
        .filter(Boolean)
        .flatMap((ca) => [
          (ca.authorizedForProperty !== undefined || ca.commonAuthorityStatus !== undefined || ca.contractAuthorityStatus !== undefined) && {
            type: "Property",
            active:
              ca.authorizedForProperty === "Y" ||
              ca.commonAuthorityStatus === "A" ||
              ca.contractAuthorityStatus === "A",
          },
          ca.authorizedForPassenger !== undefined && { type: "Passenger", active: ca.authorizedForPassenger === "Y" },
          ca.authorizedForHouseholdGoods !== undefined && { type: "Household Goods", active: ca.authorizedForHouseholdGoods === "Y" },
          (ca.authorizedForBroker !== undefined || ca.brokerAuthorityStatus !== undefined) && {
            type: "Broker",
            active: ca.authorizedForBroker === "Y" || ca.brokerAuthorityStatus === "A",
          },
        ])
        .filter(Boolean)
        .filter((a) => a.active)
    : [];

  // The carrier record itself also carries authority status codes
  // (commonAuthorityStatus / contractAuthorityStatus / brokerAuthorityStatus,
  // "A" = active). Use them too, in case the separate /authority call fails
  // or comes back in a shape the parser above doesn't recognize.
  const types = new Set(authorities.map((a) => a.type));
  if (!types.has("Property") && (carrier.commonAuthorityStatus === "A" || carrier.contractAuthorityStatus === "A")) {
    authorities.push({ type: "Property", active: true });
  }
  if (!types.has("Broker") && carrier.brokerAuthorityStatus === "A") {
    authorities.push({ type: "Broker", active: true });
  }

  return {
    dotNumber: carrier.dotNumber ?? cleanDot,
    legalName: carrier.legalName || null,
    dbaName: carrier.dbaName || null,
    // FMCSA's QCMobile field is "allowedToOperate"; older code assumed
    // "allowToOperate". Accept either so a real active carrier isn't shown
    // as not authorized.
    allowToOperate: carrier.allowedToOperate === "Y" || carrier.allowToOperate === "Y",
    outOfService: carrier.outOfService === "Y",
    outOfServiceDate: carrier.outOfServiceDate || null,
    complaintCount: carrier.complaintCount ?? 0,
    address: [carrier.phyStreet, carrier.phyCity, carrier.phyState, carrier.phyZip]
      .filter(Boolean)
      .join(", "),
    telephone: carrier.telephone || null,
    // Insurance-on-file flags from FMCSA's own record — separate from
    // whatever insurance document link the carrier submitted themselves.
    // Meant to catch identity-theft-style double-brokering (a fraudulent
    // party operating under a real, unknowing carrier's DOT/MC number):
    // the submitted insurance link can look fine while the actual DOT
    // number FMCSA has on file shows no active insurance, or the phone
    // number/address on file don't match what was submitted at all.
    // QCMobile reports these as the amount on file in thousands of dollars
    // (e.g. "750" = $750,000, "0" = none), not Y/N. Accept either form.
    bipdInsuranceOnFile: insuranceOnFile(carrier.bipdInsuranceOnFile),
    cargoInsuranceOnFile: insuranceOnFile(carrier.cargoInsuranceOnFile),
    bipdInsuranceAmount: Number(carrier.bipdInsuranceOnFile) > 0 ? Number(carrier.bipdInsuranceOnFile) * 1000 : null,
    authorityStatusCodes: {
      common: carrier.commonAuthorityStatus || null,
      contract: carrier.contractAuthorityStatus || null,
      broker: carrier.brokerAuthorityStatus || null,
    },
    authorities,
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

// Name search: lets someone check a broker/carrier when all they have is the
// company name (e.g. a load board post that shows a name but no MC). Returns
// a short list of matches; the caller then runs the full DOT lookup on the
// one the user picks.
export async function searchCarriersByName(name, limit = 10) {
  const clean = String(name || "").trim();
  if (clean.length < 3) return [];

  const res = await fmcsaGet(`/carriers/name/${encodeURIComponent(clean)}?size=${limit}`);
  const list = Array.isArray(res?.content) ? res.content : [];

  return list
    .map((item) => item?.carrier || item)
    .filter((c) => c && c.dotNumber)
    .slice(0, limit)
    .map((c) => ({
      dotNumber: String(c.dotNumber),
      legalName: c.legalName || null,
      dbaName: c.dbaName || null,
      city: c.phyCity || null,
      state: c.phyState || null,
      allowToOperate: c.allowedToOperate === "Y" || c.allowToOperate === "Y",
    }));
}
