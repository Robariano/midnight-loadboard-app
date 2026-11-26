-- Private Coverage Check: van proofs ("this van is on the carrier's policy").
--
-- Adds a request kind to coverage_requests. A vehicle request carries the VIN
-- the broker wants confirmed; the liability/cargo minimums are 0 for it. The
-- VIN is not secret (it's on the truck and the load paperwork), but this table
-- stays server-only like before.
alter table coverage_requests
  add column if not exists kind text not null default 'coverage'
    check (kind in ('coverage', 'vehicle')),
  add column if not exists vin text
    check (vin is null or vin ~ '^[A-HJ-NPR-Z0-9]{17}$');

alter table coverage_requests
  add constraint coverage_requests_vehicle_has_vin
    check (kind <> 'vehicle' or vin is not null);
