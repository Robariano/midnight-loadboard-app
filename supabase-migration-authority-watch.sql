-- Authority Watch: free daily FMCSA status check for carriers.
-- A carrier signs up with their DOT number plus a cell (with SMS consent)
-- and/or email. A daily cron re-reads FMCSA's PUBLIC data (QCMobile, never
-- Motus logins) and alerts them when something goes from good to bad
-- (allowed to operate, out-of-service, property authority, liability
-- insurance on file), and again when it comes back.
-- Each row is one subscription; stop_token is the unguessable unsubscribe link.

create table authority_watches (
  id uuid primary key default uuid_generate_v4(),
  dot_number text not null,
  legal_name text,
  phone text,                               -- E.164, only stored with sms_consent
  email text,
  sms_consent boolean not null default false,
  stop_token uuid not null unique default uuid_generate_v4(),
  active boolean not null default true,
  last_status jsonb,                        -- { allowToOperate, outOfService, propertyAuthority, bipdOnFile, powerUnits }
  last_snapshot jsonb,                      -- full lookupCarrierByDot() result from the last good check
  open_issues text[] not null default '{}', -- status keys we alerted on and haven't seen recover yet
  last_checked_at timestamptz,
  last_check_error text,
  last_alert_at timestamptz,
  stopped_at timestamptz,
  created_at timestamptz not null default now()
);

create index authority_watches_active_checked_idx on authority_watches (active, last_checked_at);
create index authority_watches_dot_idx on authority_watches (dot_number);

-- Only the server (service role) reads or writes this table.
alter table authority_watches enable row level security;
