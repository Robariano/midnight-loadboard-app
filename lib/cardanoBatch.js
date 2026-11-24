// Batched Cardano records: instead of one transaction per carrier check,
// checks wait in a queue (Supabase table cardano_record_queue) and are
// written together, many records in one label-8420 transaction. Cardano's
// fee is mostly a fixed amount per transaction, so this costs far less.
//
// A batch is written when either:
//   - BATCH_SIZE checks are waiting, or
//   - the oldest waiting check is BATCH_MAX_WAIT_MINUTES old
// (checked whenever someone runs a check), plus the daily Authority Watch
// cron, which writes anything left over (/api/cron/cardano-batch does the
// same on demand).
//
// Settings (optional):
//   CARDANO_BATCH=0                 turn batching off (one transaction per check)
//   CARDANO_BATCH_SIZE              default 20 (hard cap 25 to stay well under
//                                   Cardano's 16 KB transaction size)
//   CARDANO_BATCH_MAX_WAIT_MINUTES  default 60
import { getServiceClient } from "./supabase";
import {
  cardanoConfig, batchMetadata, recordMetadata, submitMetadata, explorerUrl,
  blockfrost, findTodaysRecord, METADATA_LABEL,
} from "./cardanoRecord";

const TABLE = "cardano_record_queue";
const HARD_CAP = 25;

export function batchSettings(env = process.env) {
  const size = Math.min(HARD_CAP, Math.max(1, Number(env.CARDANO_BATCH_SIZE) || 20));
  const maxWaitMinutes = Math.max(1, Number(env.CARDANO_BATCH_MAX_WAIT_MINUTES) || 60);
  return { size, maxWaitMinutes };
}

// Put one check (from fingerprintSnapshot) in the queue. Returns null if the
// queue table isn't there (caller then writes the record right away).
// Otherwise { queued: true } while it waits, or { existing: true, txHash, url }
// once it's on Cardano (or if today's identical record already is).
export async function queueCheck(fp, { env = process.env, config = cardanoConfig(env) } = {}) {
  const supabase = getServiceClient();
  const key = { dot: fp.record.dot, checked_on: fp.record.checkedOn, sha256: fp.hash };

  const { data: row, error } = await supabase.from(TABLE).select("status, tx_hash")
    .eq("dot", key.dot).eq("checked_on", key.checked_on).eq("sha256", key.sha256).maybeSingle();
  if (error) return null; // table missing or unreachable: fall back
  if (row?.status === "sent" && row.tx_hash) return { existing: true, txHash: row.tx_hash, url: explorerUrl(config.network, row.tx_hash) };
  if (row) {
    await flushIfDue({ env }).catch(() => null);
    return { queued: true };
  }

  // Already written today as a single record (from before batching)?
  const rows = await blockfrost(config, `/metadata/txs/labels/${METADATA_LABEL}?order=desc&count=100`).catch(() => []);
  const today = findTodaysRecord(rows, fp);
  if (today) return { existing: true, txHash: today.tx_hash, url: explorerUrl(config.network, today.tx_hash) };

  const { error: insertError } = await supabase.from(TABLE).insert({ ...key, entry: recordMetadata(fp) });
  // 23505 = someone queued the same check a moment ago; that's fine.
  if (insertError && insertError.code !== "23505") return null;
  await flushIfDue({ env }).catch(() => null);
  return { queued: true };
}

// Write a batch if one is due (full, or the oldest check has waited long enough).
export async function flushIfDue({ env = process.env } = {}) {
  const { size, maxWaitMinutes } = batchSettings(env);
  const supabase = getServiceClient();
  const { data: pending, error } = await supabase.from(TABLE).select("id, created_at")
    .eq("status", "pending").order("created_at", { ascending: true }).limit(size);
  if (error || !pending?.length) return { written: 0 };
  const ageMinutes = (Date.now() - new Date(pending[0].created_at).getTime()) / 60000;
  if (pending.length < size && ageMinutes < maxWaitMinutes) return { written: 0, waiting: pending.length };
  return flushBatch({ env });
}

// Write up to one batch now. Rows are claimed first (pending -> sending), so
// two requests running at once never write the same check twice.
export async function flushBatch({ env = process.env } = {}) {
  const config = cardanoConfig(env);
  if (!config.enabled) return { written: 0, skipped: true };
  const { size } = batchSettings(env);
  const supabase = getServiceClient();

  // Rows stuck in "sending" for 15+ minutes (a request died mid-write) go back
  // to the queue. If that write did land, the next batch just repeats them,
  // which is harmless: same facts, same fingerprint.
  const stale = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  await supabase.from(TABLE).update({ status: "pending" }).eq("status", "sending").lt("claimed_at", stale);

  const { data: pending } = await supabase.from(TABLE).select("id")
    .eq("status", "pending").order("created_at", { ascending: true }).limit(size);
  if (!pending?.length) return { written: 0 };

  const { data: claimed, error: claimError } = await supabase.from(TABLE)
    .update({ status: "sending", claimed_at: new Date().toISOString() })
    .in("id", pending.map((p) => p.id)).eq("status", "pending")
    .select("id, entry");
  if (claimError || !claimed?.length) return { written: 0 };

  const ids = claimed.map((c) => c.id);
  try {
    const res = await submitMetadata(batchMetadata(claimed.map((c) => c.entry)), env);
    if (res.skipped) throw new Error(res.reason || "Cardano recording is off.");
    await supabase.from(TABLE).update({ status: "sent", tx_hash: res.txHash, sent_at: new Date().toISOString(), last_error: null }).in("id", ids);
    return { written: ids.length, txHash: res.txHash, url: res.url, fee: res.fee };
  } catch (e) {
    await supabase.from(TABLE).update({ status: "pending", last_error: String(e.message).slice(0, 300) }).in("id", ids);
    throw e;
  }
}
