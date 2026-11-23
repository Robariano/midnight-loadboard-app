-- Driver status links: a private page a dispatcher sends to a driver so the
-- driver can see where their next load stands (looking -> bid sent ->
-- broker said yes -> booked -> picked up -> delivered) without texting the
-- dispatcher for every update. Plain tech, no blockchain: the link token is
-- random and unguessable, and the page never shows rates or broker names
-- unless the dispatcher writes them into the message.
--
-- Run once in the Supabase SQL editor.

create table driver_status_links (
  id uuid primary key default uuid_generate_v4(),
  token text not null unique,
  driver_name text not null,          -- first name is enough, e.g. "Arttie"
  lane text,                          -- e.g. "Tulsa, OK -> Nederland, CO"
  pickup_text text,                   -- e.g. "Tue 11/24, 10 AM Central"
  status text not null default 'looking',
  message text,                       -- short note from the dispatcher
  events jsonb not null default '[]', -- [{status, message, at}] newest last
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  view_count int not null default 0,
  last_viewed_at timestamptz
);

create index on driver_status_links (token);
create index on driver_status_links (created_at desc);

-- Service-role only (the app reads/writes through API routes).
alter table driver_status_links enable row level security;
