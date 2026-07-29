-- AppLeap waitlist — schema + RLS.
--
-- A marketing signup list, not user data with an account behind it, so the schema
-- stays deliberately thin: no ip address, no user agent. Capturing either would
-- turn a "notify me" form into request-level tracking for zero product benefit —
-- the only things anyone downstream needs are the email and an optional note.

create table if not exists appleap_waitlist (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  note       text,
  created_at timestamptz not null default now()
);

-- ── Row-level security: deny anon/public; only service_role writes ──────────
alter table appleap_waitlist enable row level security;

-- No policy is created on purpose. With RLS on and zero policies, every anon/
-- authenticated read or write is denied outright — this is a signup list, not
-- something the public (or a logged-in end user) should ever be able to read
-- back. Only the server's service-role client (route.ts, via SUPABASE_SERVICE_ROLE_KEY
-- or a direct DATABASE_URL connection) can see or write these rows. Same posture
-- as the fiq_* tables in 0001_fiq.sql.
revoke all on appleap_waitlist from anon, authenticated;
grant all on appleap_waitlist to service_role;
