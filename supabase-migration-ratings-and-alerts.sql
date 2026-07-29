-- Migration for the ratings + insurance-alert features added 2026-07-29.
-- Your Supabase project already has the original tables from
-- supabase-schema.sql, so don't re-run that file — just run this one.
-- Paste into Supabase: Project > SQL Editor > New Query > Run

-- New column on carriers, used by the daily insurance-expiration cron job
-- to make sure each carrier is only warned once per expiration date.
alter table carriers add column if not exists insurance_alert_sent_at timestamptz;

-- New table: one shipper rating per delivered load.
create table if not exists carrier_ratings (
  id uuid primary key default uuid_generate_v4(),
  load_id uuid not null references loads(id) unique,
  carrier_id uuid not null references carriers(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  rater_name text,
  rater_email text,
  created_at timestamptz not null default now()
);

create index if not exists carrier_ratings_carrier_id_idx on carrier_ratings (carrier_id);
