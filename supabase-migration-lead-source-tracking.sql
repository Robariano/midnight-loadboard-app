-- Lets Rob see which Facebook group (or other link) a lead actually came
-- from, instead of guessing after the fact. Works with the ?src=<name>
-- tracking links documented in README.md — captured client-side (see
-- app/dispatch/_SourceTracker.js and app/nightwatch/_NightwatchLeadForm.js)
-- and stored as-is, so any label works, not just a fixed list.

alter table dispatch_leads add column source text;
alter table nightwatch_leads add column source text;
