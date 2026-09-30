-- Lets a carrier send one of their saved documents (bill of lading, rate
-- confirmation, lumper receipt, proof of delivery, etc.) straight to a
-- factoring company, broker, or anyone else by email, instead of
-- downloading it and attaching it manually. Logs every send the same way
-- document_shares logs every share, so the carrier has a record of what
-- was sent, to whom, and when.

create table document_sends (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references driver_documents(id),
  carrier_id uuid not null references carriers(id),
  recipient_email text not null,
  recipient_label text, -- e.g. "RTS Financial" or a broker name - the carrier's own note
  note text,
  sent_at timestamptz not null default now()
);

create index on document_sends (document_id);
create index on document_sends (carrier_id);
