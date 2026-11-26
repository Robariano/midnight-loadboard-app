-- Private Coverage Check: driver proofs ("this driver is on the carrier's
-- policy"). Run after supabase-migration-vehicle-requests.sql.
alter table coverage_requests drop constraint if exists coverage_requests_kind_check;
alter table coverage_requests
  add constraint coverage_requests_kind_check check (kind in ('coverage', 'vehicle', 'driver'));
alter table coverage_requests
  add column if not exists driver_name text
    check (driver_name is null or char_length(driver_name) between 2 and 32);
alter table coverage_requests
  add constraint coverage_requests_driver_has_name
    check (kind <> 'driver' or driver_name is not null);
