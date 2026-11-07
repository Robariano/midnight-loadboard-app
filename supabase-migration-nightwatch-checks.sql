-- Nightwatch Lite: one-time broker check + saved report (audit trail).
-- A broker enters a carrier's DOT (FMCSA authority/insurance snapshot is
-- stored exactly as it came back at that moment) and, optionally, the
-- driver's name/phone (sends the existing Confirm Coverage text). Each row
-- is one report, reached only by its unguessable report_token link.
-- Continuous re-checks, chameleon cross-check, and badges come later.

create table nightwatch_checks (
  id uuid primary key default uuid_generate_v4(),
  report_token uuid not null unique default uuid_generate_v4(),
  dot_number text not null,
  carrier_snapshot jsonb not null,          -- lookupCarrierByDot() result, frozen at check time
  checked_by_company text,                  -- broker company (optional, typed by broker)
  checked_by_name text,                     -- person running the check (optional)
  load_reference text,                      -- broker's load / PO number (optional)
  attestation_id uuid references coverage_attestations(id),
  driver_name text,
  driver_contact_last4 text,                -- only last 4 digits kept on the report
  driver_text_sent boolean,
  created_at timestamptz not null default now()
);

create index nightwatch_checks_dot_idx on nightwatch_checks (dot_number);
