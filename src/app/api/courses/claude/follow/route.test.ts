/*
 * Course-follow endpoint — the branches that need no database.
 *
 * Run: `npm run test:course-follow`
 *
 * Scope is deliberate. Everything asserted here is reachable with no backend
 * configured: body parsing, email validation, the unconfigured-backend 503, and
 * the shared per-IP limiter. The storage layer itself (dedupe, the 23505 path) is
 * only meaningful against a real Postgres and is not faked here — a mock of our
 * own insert would assert that the mock works, not that the query does.
 *
 * Every case uses a distinct client IP: the limiter is a module-level singleton
 * shared with the FranchiseIQ and AppLeap routes, so tests that shared a bucket
 * would fail in whatever order happened to exhaust it first.
 */
import assert from "node:assert/strict";
import { POST } from "./route";

// The 503 branch is reached by *not* configuring a backend. Clear the vars in case
// the developer running this has a .env loaded into their shell.
delete process.env.DATABASE_URL;
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

let ipCounter = 0;
/** A fresh /32 per call, so each assertion gets its own full token bucket. */
function freshIp(): string {
  ipCounter += 1;
  return `203.0.113.${ipCounter % 251}:${ipCounter}`;
}

function post(body: string | undefined, ip = freshIp()): Promise<Response> {
  return POST(
    new Request("https://apps.everytech.io/api/courses/claude/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body,
    }),
  );
}

function json(email: unknown): string {
  return JSON.stringify({ email });
}

const results: string[] = [];
async function test(name: string, fn: () => Promise<void>) {
  await fn();
  results.push(name);
}

async function run() {
  // ── 400: the body never became a usable object ────────────────────────────
  await test("non-JSON body → 400", async () => {
    const res = await post("not json at all");
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "bad request" });
  });

  await test("JSON null body → 400", async () => {
    const res = await post("null");
    assert.equal(res.status, 400);
  });

  await test("JSON scalar body → 400", async () => {
    const res = await post('"hello"');
    assert.equal(res.status, 400);
  });

  // ── 400: the body is an object but the email isn't usable ─────────────────
  await test("missing email → 400", async () => {
    const res = await post(JSON.stringify({}));
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "invalid email" });
  });

  await test("non-string email → 400", async () => {
    const res = await post(json(42));
    assert.equal(res.status, 400);
  });

  await test("malformed email → 400", async () => {
    for (const bad of ["nope", "a@b", "@example.com", "a b@example.com", "a@ example.com"]) {
      const res = await post(json(bad));
      assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(bad)}`);
    }
  });

  await test("control characters in email → 400", async () => {
    // Would otherwise pass EMAIL_RE and then blow up at the Postgres wire level,
    // surfacing as a bogus 503 — a validation bug reported as an outage.
    for (const bad of ["a\u0000b@example.com", "ab@example.com\u001F", "a\u007Fb@example.com"]) {
      const res = await post(json(bad));
      assert.equal(res.status, 400, "expected 400 for a control-char address");
    }
  });

  await test("over-length email → 400", async () => {
    const res = await post(json(`${"a".repeat(250)}@example.com`));
    assert.equal(res.status, 400);
  });

  await test("a note field is ignored, not rejected", async () => {
    // The endpoint takes {email} only; an extra key is simply not read. It must not
    // become a 400, or a future client sending metadata breaks the signup.
    const quiet = console.error;
    console.error = () => {};
    try {
      const res = await post(JSON.stringify({ email: "reader@example.com", note: "hi" }));
      assert.equal(res.status, 503, "valid email + no backend should reach the storage branch");
    } finally {
      console.error = quiet;
    }
  });

  // ── 503: valid input, nowhere to put it ───────────────────────────────────
  await test("valid email with no backend configured → 503", async () => {
    const quiet = console.error;
    console.error = () => {}; // the route logs the storage failure on purpose
    try {
      const res = await post(json("Reader@Example.com "));
      assert.equal(res.status, 503);
      assert.deepEqual(await res.json(), { error: "service unavailable" });
    } finally {
      console.error = quiet;
    }
  });

  await test("503 body never leaks the underlying error", async () => {
    const quiet = console.error;
    console.error = () => {};
    try {
      const res = await post(json("reader2@example.com"));
      const body = await res.text();
      assert.equal(body.includes("DATABASE_URL"), false);
      assert.equal(body.includes("SUPABASE"), false);
      assert.equal(body.includes("FollowUnconfigured"), false);
    } finally {
      console.error = quiet;
    }
  });

  // ── 429: the shared limiter ───────────────────────────────────────────────
  await test("hammering one IP → 429 with Retry-After", async () => {
    const quiet = console.error;
    console.error = () => {};
    try {
      const ip = freshIp();
      let limited: Response | null = null;
      // CAPACITY is 30 in lib/fiq/rate-limit; 40 attempts clears it with room to
      // spare without hard-coding the constant into the assertion.
      for (let i = 0; i < 40; i += 1) {
        const res = await post(json(`reader${i}@example.com`), ip);
        if (res.status === 429) {
          limited = res;
          break;
        }
      }
      assert.ok(limited, "expected a 429 within 40 requests from one IP");
      assert.deepEqual(await limited.json(), { error: "rate limited" });
      const retryAfter = Number(limited.headers.get("Retry-After"));
      assert.ok(
        Number.isFinite(retryAfter) && retryAfter > 0,
        `expected a positive Retry-After, got ${limited.headers.get("Retry-After")}`,
      );
    } finally {
      console.error = quiet;
    }
  });

  await test("a different IP is unaffected by another IP's exhaustion", async () => {
    const quiet = console.error;
    console.error = () => {};
    try {
      const res = await post(json("elsewhere@example.com"));
      assert.notEqual(res.status, 429);
    } finally {
      console.error = quiet;
    }
  });
}

run().then(
  () => {
    for (const name of results) console.log(`  ok  ${name}`);
    console.log(`\ncourse-follow route: ${results.length} passed`);
  },
  (err) => {
    for (const name of results) console.log(`  ok  ${name}`);
    console.error(`\ncourse-follow route: FAILED after ${results.length} passed`);
    console.error(err);
    process.exit(1);
  },
);
