-- "Need a Dispatcher?" lead capture. Separate from the carriers table on
-- purpose: this isn't about verifying/listing a carrier on the board, it's
-- a private inquiry from someone who wants dispatch help. Only the admin
-- (Rob) ever sees these rows - there is no public listing.
--
-- has_own_authority distinguishes two real cases that need different
-- follow-up: a carrier with their own MC/DOT can be signed directly, but a
-- driver running under someone else's authority can't be - legally, the
-- dispatch relationship has to go through whoever holds that authority.
-- leased_under_company captures who that is, so the follow-up is "reach
-- out to that carrier about dispatching their whole fleet" instead of a
-- direct signup.

create table dispatch_leads (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  has_own_authority boolean not null default true,
  mc_number text,
  dot_number text,
  leased_under_company text,               -- filled when has_own_authority = false
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,                              -- lanes, equipment, what they're looking for
  status text not null default 'new',      -- new / contacted / closed
  created_at timestamptz not null default now()
);
