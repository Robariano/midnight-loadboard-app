-- Midnight Loadboard — database schema
-- Paste this into Supabase: Project > SQL Editor > New Query > Run

create extension if not exists "uuid-ossp";

create table carriers (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  contact_email text not null,
  contact_phone text,
  dot_number text,
  mc_number text,
  cdl_class text,
  cdl_link text,
  insurance_link text,
  authority_link text,
  insurance_expiration_date date,
  insurance_alert_sent_at timestamptz, -- when we last warned this carrier about upcoming expiration
  verified_status text not null default 'pending', -- pending / verified / pending_reverification / revoked
  verified_date timestamptz,
  lifetime_flag_count int not null default 0,
  open_flag_count int not null default 0,
  created_at timestamptz not null default now()
);

create table loads (
  id uuid primary key default uuid_generate_v4(),
  pickup_city text not null,
  delivery_city text not null,
  pickup_date date not null,
  equipment_type text not null,
  rate numeric,
  commodity text,
  weight_lbs int,
  notes text,
  shipper_name text,
  shipper_email text,
  status text not null default 'open', -- open / claimed / coverage_pending / confirmed / on_hold / delivered
  claimed_by_carrier_id uuid references carriers(id),
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table coverage_attestations (
  id uuid primary key default uuid_generate_v4(),
  load_id uuid not null references loads(id),
  carrier_id uuid not null references carriers(id),
  driver_name text,
  driver_contact text, -- phone or email; null/self if solo owner-operator
  is_self_attestation boolean not null default false,
  token text not null unique,
  response text not null default 'pending', -- covered_under_policy / own_authority / neither / pending
  submitted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table coverage_flags (
  id uuid primary key default uuid_generate_v4(),
  attestation_id uuid not null references coverage_attestations(id),
  carrier_id uuid not null references carriers(id),
  status text not null default 'open', -- open / resolved / escalated
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- One rating per delivered load, left by whoever posted the load (shipper).
create table carrier_ratings (
  id uuid primary key default uuid_generate_v4(),
  load_id uuid not null references loads(id) unique,
  carrier_id uuid not null references carriers(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  rater_name text,
  rater_email text,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index on loads (status);
create index on coverage_attestations (token);
create index on coverage_flags (carrier_id, status);
create index on carrier_ratings (carrier_id);
