-- Adds approximate coordinates for a load's pickup and delivery cities, so
-- the carrier-facing /loads page can tell when a driver's phone is near
-- one of them and nudge "mark picked up / delivered" instead of requiring
-- a manual tap every time. Populated best-effort at load creation time
-- (see lib/geocode.js); older loads will just have these as null, which
-- simply means no nudge shows up for them.

alter table loads add column pickup_lat numeric;
alter table loads add column pickup_lng numeric;
alter table loads add column delivery_lat numeric;
alter table loads add column delivery_lng numeric;
