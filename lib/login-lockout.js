// Shared per-key lockout helper (same pattern used for admin login, generalized
// so carrier login gets the same brute-force protection from day one instead
// of needing a follow-up fix later). "key" is whatever identifies the actor
// being rate-limited - an IP for admin login, an email for carrier login.
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 15;

export async function checkLocked(supabase, table, keyColumn, keyValue) {
      const { data: record } = await supabase
        .from(table)
        .select("*")
        .eq(keyColumn, keyValue)
        .maybeSingle();

  const now = new Date();
      if (record?.locked_until && new Date(record.locked_until) > now) {
              const minutesLeft = Math.ceil((new Date(record.locked_until) - now) / 60000);
              return { locked: true, minutesLeft, record };
      }
      return { locked: false, record };
}

export async function recordFailure(supabase, table, keyColumn, keyValue, record) {
      const now = new Date();
      const windowExpired =
              record?.first_failed_at &&
              now - new Date(record.first_failed_at) > WINDOW_MINUTES * 60 * 1000;

  const failedCount = windowExpired || !record ? 1 : (record.failed_count || 0) + 1;
      const firstFailedAt = windowExpired || !record ? now.toISOString() : record.first_failed_at;
      const lockedUntil =
              failedCount >= MAX_ATTEMPTS
          ? new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
                : null;

  await supabase.from(table).upsert({
          [keyColumn]: keyValue,
          failed_count: failedCount,
          first_failed_at: firstFailedAt,
          locked_until: lockedUntil,
  });

  return { lockedUntil, lockoutMinutes: LOCKOUT_MINUTES };
}

export async function clearAttempts(supabase, table, keyColumn, keyValue, record) {
      if (record) {
              await supabase.from(table).delete().eq(keyColumn, keyValue);
      }
}
