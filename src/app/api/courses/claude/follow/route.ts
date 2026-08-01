import { NextResponse } from "next/server";
import { addCourseFollower, CLAUDE_WEEK_1 } from "@/lib/courses/follow";
import { clientIp, rateLimit } from "@/lib/fiq/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_MAX_LEN = 254;
// Pragmatic, not RFC 5322 — we're gating obvious junk, not proving deliverability.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// `\s` doesn't cover NUL and friends, and Postgres `text` rejects embedded NUL at the
// wire level — without this, "a\u0000b@x.co" passes validation and then surfaces as a
// bogus 503 (malformed input misreported as a backend outage).
const CONTROL_RE = /[\u0000-\u001F\u007F]/;

// POST /api/courses/claude/follow {email}
// → 200 {ok:true} · 400/429/503 {error}
export async function POST(req: Request) {
  // Same bucket as the FranchiseIQ and AppLeap endpoints (fiq/rate-limit despite the
  // folder name — it's a generic per-IP token bucket, and forking it per form would
  // just give an abuser N independent budgets on the same box).
  const rl = rateLimit(clientIp(req));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  // Email only. There is no note field here on purpose: the form asks one question,
  // and a field we don't render is a field an automated poster can still fill.
  const { email } = body as { email?: unknown };
  if (typeof email !== "string") {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  // Trim BEFORE validating, not after. Pasting an address off a phone keyboard
  // routinely drags a trailing space along, and rejecting that as "invalid email"
  // blames the user for something we can obviously fix ourselves. The storage layer
  // normalizes again (trim + lowercase) so the dedupe key stays consistent either way.
  const cleanEmail = email.trim();

  if (
    cleanEmail.length > EMAIL_MAX_LEN ||
    CONTROL_RE.test(cleanEmail) ||
    !EMAIL_RE.test(cleanEmail)
  ) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  try {
    await addCourseFollower(CLAUDE_WEEK_1, cleanEmail);
    // New signup and "already following" return a BYTE-IDENTICAL 200 on purpose.
    // Anything that distinguishes them — a 201/200 split, an `already` flag, different
    // copy — is a membership oracle: POST an address, read the status, learn whether
    // it is enrolled. Worse, because there's no double opt-in, probing an address that
    // wasn't enrolled silently enrolls it, so the oracle doubles as a way to sign up
    // third parties. The caller learns exactly one thing: we accepted the request.
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    // Log server-side only — the client never sees DB error text (connection strings,
    // schema details, etc. have no business leaving this process). Misconfiguration
    // (FollowUnconfiguredError) is just as worth seeing in the logs as a live DB
    // failure, so both paths land here rather than one being swallowed quietly.
    console.error("course follow storage failed:", err);
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }
}
