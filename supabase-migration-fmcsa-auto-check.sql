-- Adds columns to store the FMCSA lookup result directly on the carrier
-- row, so it can be captured automatically at signup time (in
-- app/api/carriers/route.js) instead of only being fetched live when an
-- admin clicks "Check FMCSA" in app/admin/carriers/page.js.
--
-- fmcsa_snapshot stores the same object shape lib/fmcsa.js's
-- lookupCarrierByDot()/lookupCarrierByMc() already returns (dotNumber,
-- legalName, dbaName, allowToOperate, outOfService, outOfServiceDate,
-- complaintCount, address, telephone, authorities, checkedAt) as jsonb,
-- so the existing <FmcsaSnapshot> component in app/admin/carriers/page.js
-- can render it unchanged whether it came from a fresh manual check or
-- from this stored copy.

alter table carriers
  add column if not exists fmcsa_checked_at timestamptz,
  add column if not exists fmcsa_snapshot jsonb,
  add column if not exists fmcsa_error text;
