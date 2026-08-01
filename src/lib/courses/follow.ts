// Machine-enforced, not just a comment: importing this from a client component is a
// build error, so the service-role credentials and DB driver can never reach a
// browser bundle by accident.
import "server-only";

// Course follow list — server-only data access.
//
// Same backend-selection shape as appleap/waitlist.ts: postgres via DATABASE_URL,
// else Supabase via SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, else unconfigured.
// There is no fixture fallback: a signup with nowhere to land must fail loudly
// (503 from the route), never pretend to succeed and drop the address on the floor.
//
// One table serves every course. `course` is a discriminator column, so a second
// week — or a second course entirely — is a new row value rather than a new table,
// and the unique key is (course, email) so one person can follow more than one.
//
// Never import this from a client component. The DB credentials and the list itself
// (an email marketing asset) must never reach the browser.

const EMAIL_MAX_LEN = 254;

/** Discriminator for the Claude Code Week 1 list. */
export const CLAUDE_WEEK_1 = "claude-week-1";

export type FollowBackend = "postgres" | "supabase" | "unconfigured";

export interface FollowResult {
  stored: boolean;
  already: boolean;
}

/** Thrown when no backend is configured; the route maps this to 503. */
export class FollowUnconfiguredError extends Error {
  constructor() {
    super(
      "course follow: no storage backend configured (need DATABASE_URL, or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)",
    );
    this.name = "FollowUnconfiguredError";
  }
}

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function hasSupabaseEnv(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** For tests/logging: which backend is active. */
export function followBackend(): FollowBackend {
  if (hasDatabaseUrl()) return "postgres";
  if (hasSupabaseEnv()) return "supabase";
  return "unconfigured";
}

// Direct Postgres (Supabase connection string works here too). Lazy singleton so the
// client is created once and never bundled into the browser. `prepare: false` keeps
// it compatible with Supabase's transaction pooler.
let _sql: ReturnType<typeof import("postgres")> | null = null;
async function getSql() {
  if (!_sql) {
    const { default: postgres } = await import("postgres");
    _sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 3, idle_timeout: 20 });
  }
  return _sql;
}

async function addViaPostgres(course: string, email: string): Promise<FollowResult> {
  const sql = await getSql();
  // ON CONFLICT DO NOTHING + a RETURNING clause is the whole dedupe check in one
  // round trip: an empty result means the (course, email) unique constraint rejected
  // the row, i.e. it was already there. No separate SELECT, no check/insert race.
  const rows = await sql`
    insert into course_followers (course, email)
    values (${course}, ${email})
    on conflict (course, email) do nothing
    returning id
  `;
  const stored = rows.length > 0;
  return { stored, already: !stored };
}

async function addViaSupabase(course: string, email: string): Promise<FollowResult> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from("course_followers").insert({ course, email });
  if (!error) return { stored: true, already: false };

  // 23505 = unique_violation on (course, email) — the expected "already following"
  // path, not a real failure. Anything else is an actual storage error.
  if (error.code === "23505") return { stored: false, already: true };
  throw new Error(`course follow insert failed: ${error.message}`);
}

/**
 * Add an email to a course's follow list. Normalizes (trim + lowercase + length cap)
 * before both the dedupe check and the write, so `Foo@Bar.com ` and `foo@bar.com`
 * collide on the same (course, email) key.
 */
export async function addCourseFollower(course: string, email: string): Promise<FollowResult> {
  const normalizedEmail = email.trim().toLowerCase().slice(0, EMAIL_MAX_LEN);

  const backend = followBackend();
  if (backend === "postgres") return addViaPostgres(course, normalizedEmail);
  if (backend === "supabase") return addViaSupabase(course, normalizedEmail);
  throw new FollowUnconfiguredError();
}
