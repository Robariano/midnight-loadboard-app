// Turns an FMCSA snapshot (lib/fmcsa.js lookupCarrierByDot) into plain
// pass/fail rows. Shared by the Nightwatch Lite check page and the saved
// report so both describe the carrier the same way.
export function snapshotRows(s) {
  const hasProperty = (s.authorities || []).some((a) => a.type === "Property");
  return [
    { label: "Allowed to operate", ok: !!s.allowToOperate, value: s.allowToOperate ? "Yes" : "No" },
    { label: "Out of service", ok: !s.outOfService, value: s.outOfService ? `Yes${s.outOfServiceDate ? " (since " + s.outOfServiceDate + ")" : ""}` : "No" },
    { label: "Active for-hire authority (property)", ok: hasProperty, value: hasProperty ? "Active" : "None on file" },
    { label: "Liability insurance on file (BIPD)", ok: !!s.bipdInsuranceOnFile, value: s.bipdInsuranceOnFile ? "Yes" : "Not on file" },
    { label: "Cargo insurance on file", ok: !!s.cargoInsuranceOnFile, value: s.cargoInsuranceOnFile ? "Yes" : "Not on file", note: "Not every carrier files cargo insurance with FMCSA. Ask for their certificate if this shows no." },
  ];
}

export function overallOk(s) {
  const rows = snapshotRows(s);
  return rows.slice(0, 4).every((r) => r.ok);
}

// Driver answer -> what the report shows. Matches the Confirm Coverage
// promise: the sender sees confirmed / flagged / waiting, not the exact answer.
export function driverStatus(response) {
  if (!response || response === "pending") return { label: "Waiting on the driver", color: "#92400e", bg: "#fef3e2" };
  if (response === "neither") return { label: "Flagged: coverage not confirmed", color: "#991b1b", bg: "#fdecec" };
  return { label: "Confirmed by the driver", color: "#166534", bg: "#e9f7ef" };
}
