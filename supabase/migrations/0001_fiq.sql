-- FranchiseIQ — schema + RLS.
--
-- The feature vectors (fiq_features) and format weights (fiq_format) are the
-- proprietary IP. RLS denies anon/public entirely; only the server's service-role
-- key reads them. fiq_market / fiq_location are served through the API too, so they
-- also need no public grants.

create table if not exists fiq_market (
  code text primary key,
  name text not null
);

create table if not exists fiq_location (
  code   text primary key,               -- PSGC (PH) / DOSM (MY) join key
  market text not null references fiq_market(code),
  city   text not null default '',
  name   text not null,
  lat    double precision not null,
  lng    double precision not null
);

create table if not exists fiq_features (
  code text primary key references fiq_location(code),  -- SENSITIVE (server-only)
  pop  integer not null,
  dens integer not null,
  inc  double precision not null,
  tra  double precision not null,
  poi  jsonb not null,
  comp jsonb not null
);

create table if not exists fiq_format (
  id            text not null,
  market        text not null references fiq_market(code),
  name          text not null,
  color         text not null,
  comp_key      text not null,
  weights       jsonb not null,           -- IP (server-only)
  income_floor  double precision not null default 0,
  anchor_weights jsonb not null,          -- IP (server-only)
  primary key (id, market)
);

create index if not exists fiq_location_market_idx on fiq_location (market);
create index if not exists fiq_format_market_idx   on fiq_format (market);

-- ── Row-level security: deny anon/public; only service_role reads ────────────
alter table fiq_market   enable row level security;
alter table fiq_location enable row level security;
alter table fiq_features enable row level security;
alter table fiq_format   enable row level security;

-- No policies are defined for anon/authenticated, so with RLS on, every read/write
-- from those roles is denied. Strip any inherited table grants to be explicit.
revoke all on fiq_market   from anon, authenticated;
revoke all on fiq_location from anon, authenticated;
revoke all on fiq_features from anon, authenticated;
revoke all on fiq_format   from anon, authenticated;

-- The service_role (used only from the server with the service-role key) bypasses
-- RLS; grant table privileges to it explicitly.
grant all on fiq_market   to service_role;
grant all on fiq_location to service_role;
grant all on fiq_features to service_role;
grant all on fiq_format   to service_role;
