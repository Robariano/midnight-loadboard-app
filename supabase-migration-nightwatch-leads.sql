-- Nightwatch early-access requests. Nightwatch is the broker-facing
-- continuous carrier verification feature (see app/nightwatch/page.js) -
-- not built yet, so this just captures interested brokers so Rob can
-- reach out first when it launches. Separate from dispatch_leads on
-- purpose: these are brokers, not owner-operators looking for a dispatcher.

create table nightwatch_leads (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,                              -- how many carriers/month, current process, etc.
  status text not null default 'new',      -- new / contacted / closed
  created_at timestamptz not null default now()
);
