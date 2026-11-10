import { getServiceClient } from "../../../../lib/supabase";
import { lookupCarrierByDot } from "../../../../lib/fmcsa";
import { sendAuthorityWatchAlertSMS, sendAuthorityWatchRecoveredSMS } from "../../../../lib/twilio";
import { sendAuthorityWatchAlertEmail, sendAuthorityWatchRecoveredEmail } from "../../../../lib/email";
import { watchStatus, compareStatus } from "../../../../lib/authorityWatch";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const baseUrl = process.env.APP_BASE_URL || "https://www.nightlaneloads.com";
const smsEnabled = process.env.NEXT_PUBLIC_AUTHORITY_WATCH_SMS === "true";
const BATCH = 60;          // subscriptions per run, oldest-checked first
const TIME_BUDGET_MS = 45_000;

function isAuthorized(req) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return req.headers.get("authorization") === `Bearer ${cronSecret}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Runs daily (see vercel.json). Re-reads FMCSA's public data for each active
// Authority Watch and alerts on good-to-bad changes (and on recovery of
// anything we warned about). A drop is re-checked once before alerting, so a
// one-off blip in FMCSA's feed doesn't send a scary text.
export async function GET(req) {
  if (!isAuthorized(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const started = Date.now();
  const supabase = getServiceClient();

  const { data: watches, error } = await supabase
    .from("authority_watches")
    .select("id, dot_number, legal_name, phone, email, sms_consent, stop_token, last_status, open_issues")
    .eq("active", true)
    .order("last_checked_at", { ascending: true, nullsFirst: true })
    .limit(BATCH);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  // One FMCSA lookup per DOT, even if several people watch it.
  const byDot = new Map();
  for (const w of watches) {
    if (!byDot.has(w.dot_number)) byDot.set(w.dot_number, []);
    byDot.get(w.dot_number).push(w);
  }

  const results = [];
  for (const [dot, group] of byDot) {
    if (Date.now() - started > TIME_BUDGET_MS) break;
    const now = new Date().toISOString();

    let snapshot = null;
    try {
      snapshot = await lookupCarrierByDot(dot);
    } catch (err) {
      await supabase.from("authority_watches").update({ last_checked_at: now, last_check_error: err.message })
        .in("id", group.map((w) => w.id));
      results.push({ dot, error: err.message });
      continue;
    }
    if (!snapshot) {
      // A missing record is more likely a feed hiccup than a real change; note it, don't alert.
      await supabase.from("authority_watches").update({ last_checked_at: now, last_check_error: "No FMCSA record returned" })
        .in("id", group.map((w) => w.id));
      results.push({ dot, error: "not found" });
      continue;
    }

    let cur = watchStatus(snapshot);
    // If anyone in this group would get a warning, confirm with a second read first.
    if (group.some((w) => compareStatus(w.last_status, cur, w.open_issues || []).problems.length)) {
      await sleep(2000);
      try {
        const again = await lookupCarrierByDot(dot);
        if (again) { snapshot = again; cur = watchStatus(again); }
      } catch { /* keep the first read */ }
    }

    for (const w of group) {
      const { problems, recovered, openIssues } = compareStatus(w.last_status, cur, w.open_issues || []);
      const stopUrl = `${baseUrl}/authority-watch/stop/${w.stop_token}`;
      const sent = { sms: false, email: false };

      if (problems.length || recovered.length) {
        const p = problems.map((x) => x.text);
        const r = recovered.map((x) => x.text);
        if (smsEnabled && w.phone && w.sms_consent) {
          try {
            if (p.length) await sendAuthorityWatchAlertSMS(w.phone, dot, w.legal_name, p);
            if (r.length) await sendAuthorityWatchRecoveredSMS(w.phone, dot, w.legal_name, r);
            sent.sms = true;
          } catch (err) { console.error(`[authority-watch] SMS to watch ${w.id} failed:`, err.message); }
        }
        if (w.email) {
          try {
            if (p.length) await sendAuthorityWatchAlertEmail(w.email, dot, w.legal_name, p, stopUrl);
            if (r.length) await sendAuthorityWatchRecoveredEmail(w.email, dot, w.legal_name, r, stopUrl);
            sent.email = true;
          } catch (err) { console.error(`[authority-watch] email to watch ${w.id} failed:`, err.message); }
        }
      }

      // Don't treat a problem as delivered (and so never re-sent) if neither channel worked.
      const delivered = sent.sms || sent.email;
      const keepOpen = problems.length && !delivered
        ? openIssues.filter((k) => !problems.some((x) => x.key === k))
        : openIssues;

      await supabase.from("authority_watches").update({
        last_status: problems.length && !delivered ? w.last_status : cur,
        last_snapshot: snapshot,
        open_issues: keepOpen,
        last_checked_at: now,
        last_check_error: null,
        ...(problems.length || recovered.length ? { last_alert_at: delivered ? now : undefined } : {}),
      }).eq("id", w.id);

      results.push({ dot, watch: w.id, problems: problems.length, recovered: recovered.length, ...sent });
    }
  }

  return Response.json({ checked: results.length, results });
}
