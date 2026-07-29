// Machine-enforced, not just a comment: importing this from a client component is a
// build error, so the service-role credentials and DB driver can never reach a
// browser bundle by accident. (It happened to fail already because `postgres` pulls
// in node:tls, but that is a side effect of a dependency's internals, not a guarantee.)
import "server-only";

// AppLeap waitlist — server-only data access.
//
// Same backend-selection shape as fiq/repo.ts: postgres via DATABASE_URL, else
// Supabase via SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY, else unconfigured. Unlike
// fiq/repo.ts there is no fixture fallback here — a waitlist signup with nowhere to
// land must fail loudly (503 from the route), never pretend to succeed and drop the
// email on the floor.
//
// Never import this from a client component. The DB credentials and the list itself
// (an email marketing asset) must never reach the browser.

const EMAIL_MAX_LEN = 254;

export type WaitlistBackend = "postgres" | "supabase" | "unconfigured";

export interface WaitlistResult {
  stored: boolean;
  already: boolean;
}

/** Thrown when no backend is configured; the route maps this to 503. */
export class WaitlistUnconfiguredError extends Error {
  constructor() {
    super("appleap waitlist: no storage backend configured (need DATABASE_URL, or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)");
    this.name = "WaitlistUnconfiguredError";
  }
}

function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function hasSupabaseEnv(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** For tests/logging: which backend is active. */
export function waitlistBackend(): WaitlistBackend {
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

async function addViaPostgres(email: string, note: string | null): Promise<WaitlistResult> {
  const sql = await getSql();
  // ON CONFLICT DO NOTHING + a RETURNING clause is the whole dedupe check in one
  // round trip: an empty result means the unique index on email rejected the row,
  // i.e. it was already there. No separate SELECT, no race between check and insert.
  const rows = await sql`
    insert into appleap_waitlist (email, note)
    values (${email}, ${note})
    on conflict (email) do nothing
    returning id
  `;
  const stored = rows.length > 0;
  return { stored, already: !stored };
}

async function addViaSupabase(email: string, note: string | null): Promise<WaitlistResult> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });

  const { error } = await supabase.from("appleap_waitlist").insert({ email, note });
  if (!error) return { stored: true, already: false };

  // 23505 = unique_violation on the email column — this is the expected "already
  // signed up" path, not a real failure. Anything else is an actual storage error.
  if (error.code === "23505") return { stored: false, already: true };
  throw new Error(`appleap waitlist insert failed: ${error.message}`);
}

/**
 * Add an email to the AppLeap waitlist. Normalizes (trim + lowercase) before both
 * the dedupe check and the write, so `Foo@Bar.com ` and `foo@bar.com` collide.
 */
export async function addToWaitlist(email: string, note?: string | null): Promise<WaitlistResult> {
  const normalizedEmail = email.trim().toLowerCase().slice(0, EMAIL_MAX_LEN);
  const normalizedNote = note?.trim() ? note.trim() : null;

  const backend = waitlistBackend();
  if (backend === "postgres") return addViaPostgres(normalizedEmail, normalizedNote);
  if (backend === "supabase") return addViaSupabase(normalizedEmail, normalizedNote);
  throw new WaitlistUnconfiguredError();
}
