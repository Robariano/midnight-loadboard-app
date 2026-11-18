-- Private Coverage Check (Midnight pilot): broker requests for coverage proofs.
--
-- A broker asks for proof that a carrier (DOT) has at least some liability and
-- cargo coverage through a date. The carrier approves with a private link
-- (approve_token). A worker on Nightlane's computer then builds the
-- zero-knowledge proof on Midnight and marks the request proved. Only the
-- request and the minimums live here: the carrier's real limits, keys and
-- attestations never touch this database.

create table coverage_requests (
  id uuid primary key default uuid_generate_v4(),
  request_text text not null,                 -- what the broker types to look it up, e.g. "MC 123456 load 1001"
  request_key text not null unique,           -- sha256 hex of the trimmed, lower-cased request text (= the on-chain request id)
  dot_number text not null,
  min_liability bigint not null check (min_liability >= 0),
  min_cargo bigint not null check (min_cargo >= 0),
  covered_through date not null,
  broker_contact text,                        -- optional email or phone, so Nightlane can say when it's proved
  approve_token uuid not null unique default uuid_generate_v4(),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'proving', 'proved', 'declined', 'failed')),
  error text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  proved_at timestamptz,
  updated_at timestamptz not null default now()
);

create index coverage_requests_status_idx on coverage_requests (status, created_at);
create index coverage_requests_dot_idx on coverage_requests (dot_number);

-- Only the server (service role) reads or writes this table.
alter table coverage_requests enable row level security;
