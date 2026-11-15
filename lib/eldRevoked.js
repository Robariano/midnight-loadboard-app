// FMCSA's official list of revoked ELDs, read from the download link on
// eld.fmcsa.dot.gov ("Revoked ELDs" → Download). The download is an HTML
// table served as .xls (~175 KB), small enough for Next's fetch cache, so
// FMCSA is asked at most every 6 hours. Throws if FMCSA can't be reached
// or the format changes; callers show a fallback link instead.
export const FMCSA_ELD_LIST_URL = "https://eld.fmcsa.dot.gov/List";
const DOWNLOAD_URL = "https://eld.fmcsa.dot.gov/List/DownloadRevoked";

const decode = (s) =>
  s.replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ").trim();

export function parseRevokedTable(html) {
  const rows = [...String(html).matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map((m) =>
    [...m[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => decode(c[1])));
  if (!rows.length) throw new Error("No rows in FMCSA revoked ELD download");
  const head = rows[0];
  const col = (name) => head.indexOf(name);
  const need = ["Device Name", "Model Number", "ELD Identifier", "Company Name", "Date Revoked", "Status"];
  if (need.some((n) => col(n) < 0)) throw new Error("FMCSA revoked ELD download changed format");
  return rows.slice(1).filter((r) => r.length === head.length).map((r) => {
    const raw = r[col("Date Revoked")];
    const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    return {
      name: r[col("Device Name")],
      model: r[col("Model Number")],
      eldId: r[col("ELD Identifier")],
      company: r[col("Company Name")],
      status: r[col("Status")], // "Revoked" (by FMCSA) or "Self-Revoked" (by the maker)
      date: m ? `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}` : "",
    };
  });
}

export async function fetchRevokedELDs() {
  const res = await fetch(DOWNLOAD_URL, {
    next: { revalidate: 6 * 60 * 60 },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`FMCSA returned ${res.status}`);
  const devices = parseRevokedTable(await res.text());
  return { devices, checkedAt: new Date().toISOString() };
}
