-- Course followers — schema + RLS.
--
-- Backs the "get Day 2 when it lands" form on the course pages. A marketing signup
-- list, not user data with an account behind it, so the schema stays deliberately
-- thin: no ip address, no user agent, no referrer. Capturing any of those would turn
-- a "email me the next lesson" form into request-level tracking for zero product
-- benefit — the only thing anyone downstream needs is which course and which address.
--
-- `course` is a discriminator rather than a table per course: Week 2, or an entirely
-- different course, is a new value in this column and needs no migration. The unique
-- key is (course, email) so one person can follow more than one course, and so the
-- route's `on conflict do nothing` is an exact-duplicate check rather than a
-- cross-course collision.
--
-- (Note: this lives under supabase/migrations/ alongside 0001_fiq.sql. The AppLeap
-- waitlist schema was dropped in scripts/seed/ by mistake; new schema goes here.)

create table if not exists course_followers (
  id         bigint generated always as identity primary key,
  course     text not null,
  email      text not null,
  created_at timestamptz not null default now(),
  unique (course, email)
);

-- ── Row-level security: deny anon/public; only service_role writes ──────────
alter table course_followers enable row level security;

-- No policy is created on purpose. With RLS on and zero policies, every anon/
-- authenticated read or write is denied outright — this is a signup list, not
-- something the public (or a logged-in end user) should ever be able to read
-- back. Only the server's service-role client (the follow route, via
-- SUPABASE_SERVICE_ROLE_KEY or a direct DATABASE_URL connection) can see or
-- write these rows. Same posture as the fiq_* tables in 0001_fiq.sql.
revoke all on course_followers from anon, authenticated;
grant all on course_followers to service_role;
