"use client";
import { useState } from "react";
import { SOURCE_STORAGE_KEY } from "./_SourceTracker";

// The lead-capture form used on /dispatch/contact (and /need-a-dispatcher,
// which redirects there). Posts to /api/dispatch-leads -> dispatch_leads
// table -> admin panel, SMS and email alerts.
//
// The request body keeps the exact shape the API already accepts, so no
// backend or database change is needed. The extra structured answers
// (trucks, equipment, lanes, how they dispatch now, call/text preference,
// SMS consent) are folded into `notes` as labeled lines, so they show up in
// the admin panel and the lead alert email as-is.
//
// Company-name auto-fill reuses the public /api/check-broker FMCSA lookup.

const C = {
  ink: "#14181f",
  label: "#4b5568",
  muted: "#6b7280",
  line: "#e2e5ea",
  panel: "#f7f8fa",
  brand: "#7a2e1f",
  brandSoft: "#f1e6cc",
  green: "#166534",
  red: "#991b1b",
};

const inputStyle = {
  width: "100%",
  padding: "12px 12px",
  background: "#ffffff",
  border: `1px solid ${C.line}`,
  borderRadius: 6,
  color: C.ink,
  fontFamily: "inherit",
  fontSize: 16, // 16px+ stops iPhones from zooming into the field
  minHeight: 46,
};
const badInput = { ...inputStyle, border: `1.5px solid ${C.red}` };
const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: C.label, marginBottom: 6 };
const hintStyle = { fontWeight: 400, color: C.muted };
const fieldWrap = { marginBottom: 16 };
const errStyle = { color: C.red, fontSize: 12, margin: "5px 0 0" };

const EQUIPMENT = ["Flatbed", "Step deck", "Hotshot", "Dry van", "Box truck", "Cargo van"];
const TRUCK_COUNTS = ["1–2", "3–5", "6–15", "16+"];
const CURRENT_DISPATCH = [
  "I do it myself",
  "In-house dispatcher",
  "Outside dispatch service",
  "Drivers find their own loads",
  "Just getting started",
];

const ROLES = [
  { key: "own", label: "I have my own authority" },
  { key: "fleet", label: "I run a fleet with leased-on drivers" },
  { key: "leased", label: "I'm leased on to a carrier" },
];

function Chip({ selected, onClick, children }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} style={{
      padding: "9px 14px", borderRadius: 999, cursor: "pointer", fontSize: 14, fontWeight: 600,
      border: selected ? `1.5px solid ${C.brand}` : `1px solid ${C.line}`,
      background: selected ? C.brand : "#ffffff",
      color: selected ? "#ffffff" : C.ink,
      minHeight: 40,
    }}>
      {children}
    </button>
  );
}

function Check() {
  return (
    <span aria-hidden="true" style={{
      flex: "none", width: 20, height: 20, borderRadius: "50%", background: C.green,
      display: "inline-grid", placeItems: "center", marginTop: 1,
    }}>
      <svg width="11" height="11" viewBox="0 0 14 14"><path d="M2.5 7.5l3 3 6-7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

function Pitch({ title, items }) {
  return (
    <div style={{
      background: "#eef4ff", border: "1px solid #c7d7f5", borderRadius: 8,
      padding: "12px 14px", marginBottom: 16,
    }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: "#1e3a8a", margin: "0 0 8px", lineHeight: 1.4 }}>{title}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map(([head, sub]) => (
          <li key={head} style={{ display: "flex", gap: 10, padding: "5px 0", fontSize: 13, lineHeight: 1.45, color: "#1e3a8a" }}>
            <Check />
            <span><b>{head}</b>{sub ? <> {sub}</> : null}</span>
          </li>
        ))}
      </ul>
      <p style={{ fontSize: 12, color: "#1e3a8a", margin: "8px 0 0", lineHeight: 1.45 }}>
        <b>What happens next:</b> I call or text you, we talk for about 10 minutes about your trucks and lanes,
        you sign a short dispatch agreement and send your W-9, COI and authority letter, and I start finding loads.
      </p>
    </div>
  );
}

const CORE_TERMS = [
  ["Booked under your authority,", "on your rate cons, with your approval. Nothing books without your OK."],
  ["Every broker checked on FMCSA", "before I book."],
  ["First load free,", "then 7% per load."],
  ["You pay after you're paid.", "No upfront or setup fees."],
  ["No fee on detention or lumper.", null],
];

export default function DispatcherLeadForm() {
  const [role, setRole] = useState("own");
  const isFleet = role === "fleet";
  const hasOwnAuthority = role !== "leased";

  // Own authority / fleet
  const [companyName, setCompanyName] = useState("");
  const [idType, setIdType] = useState("dot"); // "dot" | "mc"
  const [authNumber, setAuthNumber] = useState("");
  const [lookup, setLookup] = useState(null); // { state: "loading"|"ok"|"warn"|"none", text }
  const [trucks, setTrucks] = useState("");
  const [leasedOOs, setLeasedOOs] = useState("");
  const [equipment, setEquipment] = useState([]);
  const [lanes, setLanes] = useState("");
  const [currentDispatch, setCurrentDispatch] = useState("");

  // Leased on
  const [driverName, setDriverName] = useState("");
  const [leasedUnderCompany, setLeasedUnderCompany] = useState("");
  const [carrierNumber, setCarrierNumber] = useState("");
  const [carrierContact, setCarrierContact] = useState("");
  const [okToMention, setOkToMention] = useState(false);

  // Everyone
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPref, setContactPref] = useState("Text");
  const [bestTime, setBestTime] = useState("Anytime");
  const [smsConsent, setSmsConsent] = useState(false);
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  function clearErr(key) {
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function formatPhone(value) {
    let d = value.replace(/\D/g, "");
    if (d.length === 11 && d[0] === "1") d = d.slice(1);
    d = d.slice(0, 10);
    if (d.length > 6) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    if (d.length > 3) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return d;
  }

  async function runLookup() {
    const n = authNumber.replace(/\D/g, "");
    if (n.length < 4) { setLookup(null); return; }
    setLookup({ state: "loading", text: "Looking up your authority on FMCSA…" });
    try {
      const res = await fetch("/api/check-broker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(idType === "dot" ? { dot_number: n } : { mc_number: n }),
      });
      const data = await res.json().catch(() => ({}));
      const snap = data.snapshot;
      if (!res.ok || !snap) {
        setLookup(res.status === 404
          ? { state: "warn", text: "Couldn't find that number on FMCSA. Double-check it, or just type your company name." }
          : null); // FMCSA down or rate-limited: stay quiet, the form still works
        return;
      }
      const name = snap.dbaName || snap.legalName || "";
      if (name && !companyName.trim()) setCompanyName(name);
      const units = Number.isFinite(snap.powerUnits) && snap.powerUnits > 0
        ? ` · ${snap.powerUnits} power unit${snap.powerUnits === 1 ? "" : "s"} on file` : "";
      setLookup(snap.allowToOperate
        ? { state: "ok", text: `✓ Found ${snap.legalName || name} (DOT ${snap.dotNumber})${units}` }
        : { state: "warn", text: `Found ${snap.legalName || name}, but FMCSA doesn't show it as authorized to operate right now. Send it anyway and we'll sort it out.` });
    } catch {
      setLookup(null);
    }
  }

  function validate() {
    const e = {};
    const phoneDigits = contactPhone.replace(/\D/g, "");
    if (hasOwnAuthority) {
      if (!companyName.trim()) e.companyName = "Enter your company name.";
      if (!/^\d{1,8}$/.test(authNumber.replace(/\D/g, "")) ) e.authNumber = `Enter your ${idType === "dot" ? "DOT" : "MC"} number.`;
      if (!contactName.trim()) e.contactName = "Enter your name.";
    } else {
      if (!driverName.trim()) e.driverName = "Enter your name.";
      if (!leasedUnderCompany.trim()) e.leasedUnderCompany = "Enter the carrier you run under.";
    }
    if (!phoneDigits && !contactEmail.trim()) e.contactPhone = "Enter a phone number (or an email below) so I can reach you.";
    else if (phoneDigits && phoneDigits.length !== 10) e.contactPhone = "Enter a 10-digit phone number.";
    if (contactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) e.contactEmail = "That email doesn't look right.";
    if (contactPref === "Text" && phoneDigits && !smsConsent) e.smsConsent = "Check this box so I can text you, or choose Call above.";
    return e;
  }

  function buildNotes() {
    const lines = [];
    if (hasOwnAuthority) {
      if (isFleet) lines.push("FLEET LEAD: carrier with leased-on owner-operators");
      if (isFleet && trucks) lines.push(`Trucks: ${trucks}`);
      if (isFleet && leasedOOs.trim()) lines.push(`Leased owner-operators: ${leasedOOs.trim()}`);
      if (equipment.length) lines.push(`Equipment: ${equipment.join(", ")}`);
      if (lanes.trim()) lines.push(`Home base / lanes: ${lanes.trim()}`);
      if (currentDispatch) lines.push(`Dispatch now: ${currentDispatch}`);
    } else {
      if (carrierNumber.trim()) lines.push(`Carrier MC/DOT: ${carrierNumber.trim()}`);
      if (carrierContact.trim()) lines.push(`Best contact at carrier: ${carrierContact.trim()}`);
      lines.push(`OK to mention this driver to the carrier: ${okToMention ? "yes" : "no"}`);
    }
    lines.push(`Prefers: ${contactPref}, ${bestTime.toLowerCase()}`);
    lines.push(`SMS consent: ${smsConsent ? "yes" : "no"}`);
    if (notes.trim()) lines.push(`${hasOwnAuthority ? "Notes" : "About the carrier"}: ${notes.trim()}`);
    return lines.join("\n");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      setError("Please fix the highlighted fields.");
      return;
    }
    setStatus("submitting");
    setError(null);
    let source = null;
    try {
      source = window.localStorage.getItem(SOURCE_STORAGE_KEY);
    } catch {
      // ignore — source tracking is best-effort, never worth failing the form over
    }
    const n = authNumber.replace(/\D/g, "");
    try {
      const res = await fetch("/api/dispatch-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: hasOwnAuthority ? companyName.trim() : driverName.trim(),
          has_own_authority: hasOwnAuthority,
          mc_number: hasOwnAuthority && idType === "mc" ? n : "",
          dot_number: hasOwnAuthority && idType === "dot" ? n : "",
          leased_under_company: hasOwnAuthority ? "" : leasedUnderCompany.trim(),
          contact_name: hasOwnAuthority ? contactName.trim() : driverName.trim(),
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim(),
          notes: buildNotes(),
          source,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("done");
      } else {
        setError(data.error || "Something went wrong. Please try again, or call or text (970) 903-9226.");
        setStatus("error");
      }
    } catch {
      setError("Couldn't send. Check your connection and try again, or call or text (970) 903-9226.");
      setStatus("error");
    }
  }

  if (status === "done") {
    const how = contactPref === "Call" ? "call" : "text";
    return (
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "20px" }}>
        <p style={{ color: C.green, fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>Got it, thanks.</p>
        <p style={{ color: C.ink, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
          {hasOwnAuthority
            ? `I'll ${how} you myself to talk about your first load. Not an automated system, just me.`
            : `I'll reach out to ${leasedUnderCompany.trim() || "your carrier"} and ${how} you to let you know how it goes.`}
        </p>
      </div>
    );
  }

  const authLabel = idType === "dot" ? "USDOT number" : "MC number";

  return (
    <form onSubmit={handleSubmit} noValidate style={{
      background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "18px 20px",
      color: C.ink,
    }}>
      <p style={{ ...labelStyle, marginBottom: 8 }} id="swd-role-q">Which describes you?</p>
      <div role="group" aria-labelledby="swd-role-q" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {ROLES.map((r) => {
          const on = role === r.key;
          return (
            <button key={r.key} type="button" aria-pressed={on}
              onClick={() => { setRole(r.key); setErrors({}); setError(null); }}
              style={{
                flex: "1 1 160px", padding: "10px 8px", borderRadius: 6, cursor: "pointer", minHeight: 48,
                border: on ? `2px solid ${C.brand}` : `1px solid ${C.line}`,
                background: on ? C.brandSoft : "#ffffff",
                color: C.ink, fontWeight: 700, fontSize: 14, lineHeight: 1.25,
              }}>
              {r.label}
            </button>
          );
        })}
      </div>

      {role === "own" && <Pitch title="A second dispatcher for your truck." items={CORE_TERMS} />}
      {isFleet && (
        <Pitch
          title="Backup dispatch for your fleet. When your owner-operators are sitting empty and your dispatcher is maxed out, I find and negotiate their next load."
          items={CORE_TERMS}
        />
      )}
      {role === "leased" && (
        <div style={{ background: "#fef3e2", border: "1px solid #f5d999", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: C.brand, margin: 0, lineHeight: 1.5 }}>
            <b>Introduce me to your carrier.</b> Since you run under their authority, loads are
            booked through them. A lot of carriers with leased owner-operators get stretched thin on
            dispatch. Tell me who you run under and I&apos;ll reach out to them about backup dispatch
            help, for their trucks and yours. Anything you tell me about your pay or how you&apos;re
            treated stays between us.
          </p>
        </div>
      )}

      {hasOwnAuthority ? (
        <>
          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="swd-auth">Your {authLabel}</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div role="group" aria-label="Number type" style={{ display: "inline-flex", border: `1px solid ${C.line}`, borderRadius: 6, overflow: "hidden", flex: "none" }}>
                {["dot", "mc"].map((t) => (
                  <button key={t} type="button" aria-pressed={idType === t}
                    onClick={() => { setIdType(t); setLookup(null); clearErr("authNumber"); }}
                    style={{
                      border: 0, padding: "0 14px", cursor: "pointer", fontWeight: 700, fontSize: 14,
                      background: idType === t ? C.brand : "#ffffff", color: idType === t ? "#ffffff" : C.muted,
                    }}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
              <input id="swd-auth" value={authNumber} inputMode="numeric" autoComplete="off"
                onChange={(e) => { setAuthNumber(e.target.value.replace(/\D/g, "").slice(0, 8)); clearErr("authNumber"); setLookup(null); }}
                onBlur={runLookup}
                placeholder={idType === "dot" ? "e.g. 1234567" : "e.g. 654321"}
                style={errors.authNumber ? badInput : inputStyle} />
            </div>
            {errors.authNumber && <p style={errStyle}>{errors.authNumber}</p>}
            {lookup && (
              <p aria-live="polite" style={{
                fontSize: 12, margin: "6px 0 0", lineHeight: 1.4,
                color: lookup.state === "ok" ? C.green : lookup.state === "warn" ? "#92400e" : C.muted,
              }}>{lookup.text}</p>
            )}
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="swd-company">Company name</label>
            <input id="swd-company" value={companyName} autoComplete="organization"
              onChange={(e) => { setCompanyName(e.target.value); clearErr("companyName"); }}
              placeholder="e.g. Acme Trucking LLC" style={errors.companyName ? badInput : inputStyle} />
            {errors.companyName && <p style={errStyle}>{errors.companyName}</p>}
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="swd-name">Your name</label>
            <input id="swd-name" value={contactName} autoComplete="name"
              onChange={(e) => { setContactName(e.target.value); clearErr("contactName"); }}
              placeholder="e.g. John Smith" style={errors.contactName ? badInput : inputStyle} />
            {errors.contactName && <p style={errStyle}>{errors.contactName}</p>}
          </div>
        </>
      ) : (
        <>
          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="swd-dname">Your name</label>
            <input id="swd-dname" value={driverName} autoComplete="name"
              onChange={(e) => { setDriverName(e.target.value); clearErr("driverName"); }}
              placeholder="e.g. John Smith" style={errors.driverName ? badInput : inputStyle} />
            {errors.driverName && <p style={errStyle}>{errors.driverName}</p>}
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="swd-carrier">Carrier whose authority you run under</label>
            <input id="swd-carrier" value={leasedUnderCompany}
              onChange={(e) => { setLeasedUnderCompany(e.target.value); clearErr("leasedUnderCompany"); }}
              placeholder="e.g. Big Rig Carriers LLC" style={errors.leasedUnderCompany ? badInput : inputStyle} />
            {errors.leasedUnderCompany && <p style={errStyle}>{errors.leasedUnderCompany}</p>}
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="swd-cnum">Their MC or DOT number <span style={hintStyle}>(if you know it)</span></label>
            <input id="swd-cnum" value={carrierNumber} onChange={(e) => setCarrierNumber(e.target.value)}
              placeholder="e.g. MC 654321" style={inputStyle} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="swd-ccontact">Best person to talk to there <span style={hintStyle}>(name, role, phone or email)</span></label>
            <input id="swd-ccontact" value={carrierContact} onChange={(e) => setCarrierContact(e.target.value)}
              placeholder="e.g. Mike, owner, (555) 555-5555" style={inputStyle} />
          </div>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: C.label, marginBottom: 16 }}>
            <input type="checkbox" checked={okToMention} onChange={(e) => setOkToMention(e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 1, accentColor: C.brand }} />
            <span>It&apos;s OK to tell them you sent me</span>
          </label>
        </>
      )}

      {/* Contact */}
      <div style={fieldWrap}>
        <label style={labelStyle} htmlFor="swd-phone">Cell phone</label>
        <input id="swd-phone" type="tel" inputMode="tel" autoComplete="tel" value={contactPhone}
          onChange={(e) => { setContactPhone(formatPhone(e.target.value)); clearErr("contactPhone"); clearErr("smsConsent"); }}
          placeholder="(555) 555-5555" style={errors.contactPhone ? badInput : inputStyle} />
        {errors.contactPhone && <p style={errStyle}>{errors.contactPhone}</p>}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", ...fieldWrap }}>
        <div style={{ flex: "1 1 160px" }}>
          <p style={labelStyle}>Best way to reach you</p>
          <div style={{ display: "flex", gap: 8 }}>
            {["Text", "Call"].map((p) => (
              <Chip key={p} selected={contactPref === p} onClick={() => { setContactPref(p); clearErr("smsConsent"); }}>{p}</Chip>
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 160px" }}>
          <label style={labelStyle} htmlFor="swd-time">Best time</label>
          <select id="swd-time" value={bestTime} onChange={(e) => setBestTime(e.target.value)} style={inputStyle}>
            {["Anytime", "Morning", "Afternoon", "Evening"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle} htmlFor="swd-email">Email <span style={hintStyle}>(optional)</span></label>
        <input id="swd-email" type="email" autoComplete="email" value={contactEmail}
          onChange={(e) => { setContactEmail(e.target.value); clearErr("contactEmail"); clearErr("contactPhone"); }}
          placeholder="you@example.com" style={errors.contactEmail ? badInput : inputStyle} />
        {errors.contactEmail && <p style={errStyle}>{errors.contactEmail}</p>}
      </div>

      {/* About the operation */}
      {isFleet && (
        <>
          <div style={fieldWrap}>
            <p style={labelStyle}>How many trucks?</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TRUCK_COUNTS.map((t) => (
                <Chip key={t} selected={trucks === t} onClick={() => setTrucks(trucks === t ? "" : t)}>{t}</Chip>
              ))}
            </div>
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="swd-oos">How many are leased owner-operators?</label>
            <input id="swd-oos" inputMode="numeric" value={leasedOOs}
              onChange={(e) => setLeasedOOs(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="e.g. 5" style={{ ...inputStyle, maxWidth: 140 }} />
          </div>
        </>
      )}

      {hasOwnAuthority && (
        <>
          <div style={fieldWrap}>
            <p style={labelStyle}>Equipment <span style={hintStyle}>(pick all that apply)</span></p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {EQUIPMENT.map((eq) => {
                const on = equipment.includes(eq);
                return (
                  <Chip key={eq} selected={on}
                    onClick={() => setEquipment(on ? equipment.filter((x) => x !== eq) : [...equipment, eq])}>
                    {eq}
                  </Chip>
                );
              })}
            </div>
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="swd-lanes">Home base or main lanes</label>
            <input id="swd-lanes" value={lanes} onChange={(e) => setLanes(e.target.value)}
              placeholder="e.g. Farmington, NM. Four Corners and Texas" style={inputStyle} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle} htmlFor="swd-current">How do you handle dispatch now?</label>
            <select id="swd-current" value={currentDispatch} onChange={(e) => setCurrentDispatch(e.target.value)} style={inputStyle}>
              <option value="">Choose one</option>
              {CURRENT_DISPATCH.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </>
      )}

      <div style={fieldWrap}>
        <label style={labelStyle} htmlFor="swd-notes">
          {hasOwnAuthority
            ? <>Anything else? <span style={hintStyle}>(optional)</span></>
            : <>About that carrier <span style={hintStyle}>(how many trucks, what freight, who handles their dispatch)</span></>}
        </label>
        <textarea id="swd-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder={hasOwnAuthority
            ? "e.g. Looking to stay out of Northern California"
            : "e.g. About 10 trucks, flatbed and hotshot, owner is Mike, they do their own dispatch but get busy"}
          style={{ ...inputStyle, resize: "vertical", minHeight: 84 }} />
      </div>

      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: errors.smsConsent ? 4 : 14 }}>
        <input type="checkbox" checked={smsConsent}
          onChange={(e) => { setSmsConsent(e.target.checked); clearErr("smsConsent"); }}
          style={{ width: 20, height: 20, flex: "none", marginTop: 1, accentColor: C.brand }} />
        <span>
          Yes, Steady Wake Dispatch may text me at the number above about dispatch services. Consent is not
          a condition of service. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt
          out, HELP for help. See the <a href="/privacy-policy" style={{ color: C.brand }}>Privacy Policy</a> and{" "}
          <a href="/terms-of-service" style={{ color: C.brand }}>Terms</a>.
        </span>
      </label>
      {errors.smsConsent && <p style={{ ...errStyle, margin: "0 0 14px" }}>{errors.smsConsent}</p>}

      <button type="submit" disabled={status === "submitting"} style={{
        width: "100%", padding: "15px", background: C.brand, color: "#fff",
        border: "none", borderRadius: 8, fontWeight: 800, fontSize: 17, minHeight: 54,
        cursor: status === "submitting" ? "not-allowed" : "pointer",
      }}>
        {status === "submitting" ? "Sending…" : hasOwnAuthority ? "Get my first load free" : "Send my carrier's info"}
      </button>
      {hasOwnAuthority && (
        <p style={{ fontSize: 12, color: C.muted, textAlign: "center", margin: "8px 0 0" }}>
          No dispatch fee on your first load. No upfront fees.
        </p>
      )}
      {error && <p role="alert" style={{ color: C.red, marginTop: 10, fontSize: 13 }}>{error}</p>}
    </form>
  );
}
