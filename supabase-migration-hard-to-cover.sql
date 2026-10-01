-- Adds a "hard to cover" flag shippers can check when posting a load, so
-- carriers can filter the board for exactly those loads instead of brokers
-- having to be asked in person. Run this once in the Supabase SQL editor.
alter table loads add column if not exists hard_to_cover boolean default false;
