-- Lets a carrier share their verification status + documents with one
-- specific broker via a private link, without handing over the raw files
-- to just anyone, and see proof of when that broker actually looked.
-- This is the "status instead of a stack of PDFs" idea (originally sketched
-- out under the NightHaul concept) built with plain tech - no blockchain,
-- no cryptography beyond a random unguessable link token.

create table document_shares (
  id uuid primary key default uuid_generate_v4(),
  carrier_id uuid not null references carriers(id),
  recipient_label text not null, -- e.g. "Coyote Point Brokerage" - the carrier's own note, not verified
  share_token text not null unique,
  document_ids uuid[], -- null = share everything currently in the carrier's locker
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  view_count int not null default 0,
  last_viewed_at timestamptz
);

create index on document_shares (share_token);
create index on document_shares (carrier_id);
