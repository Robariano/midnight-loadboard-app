-- Adds a structured carrier-volume bucket to nightwatch_leads, so leads can
-- be sorted/filtered by size instead of only reading free-text notes. The
-- existing `notes` column stays for the open-ended follow-up (current
-- process, pain points, etc.) - see app/nightwatch/_NightwatchLeadForm.js.

alter table nightwatch_leads
  add column if not exists carrier_volume text; -- e.g. "Under 25/month", "25-100/month", "100-500/month", "500+/month", "Not sure / varies"
