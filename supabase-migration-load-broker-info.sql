-- Broker contact info shown on each posted load so drivers call the broker
-- directly and can check the broker's MC on FMCSA.
alter table loads add column if not exists broker_company text;
alter table loads add column if not exists broker_phone text;
alter table loads add column if not exists broker_mc text;
