-- Cardano record queue: carrier checks wait here and are written to Cardano
-- together, many records in one label-8420 transaction, instead of one
-- transaction per check (Cardano's fee is mostly a fixed amount per
-- transaction, so batching costs much less). See lib/cardanoBatch.js.
--
-- Until this table exists, the site keeps writing one transaction per check.
--
-- Run once in the Supabase SQL editor.

create table cardano_record_queue (
  id uuid primary key default uuid_generate_v4(),
  dot text not null,
  checked_on date not null,
  sha256 text not null,
  entry jsonb not null,                     -- the record's label-8420 fields
  status text not null default 'pending',   -- pending -> sending -> sent
  tx_hash text,
  last_error text,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  unique (dot, checked_on, sha256)
);

create index on cardano_record_queue (status, created_at);

-- Service-role only (the app reads/writes through API routes).
alter table cardano_record_queue enable row level security;
