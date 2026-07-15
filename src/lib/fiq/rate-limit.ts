// Simple in-memory per-IP token bucket for the POST endpoints. Deters bulk
// scraping / enumeration of scores. In-process only (resets on redeploy and is
// per-instance); good enough for a single Railway service and the pilot's needs.

interface Bucket {
  tokens: number;
  updated: number;
}

const BUCKETS = new Map<string, Bucket>();

const CAPACITY = 30; // burst
const REFILL_PER_SEC = 1; // sustained ~1 req/s/IP
const SWEEP_AFTER_MS = 10 * 60 * 1000;

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds until next token
}

export function rateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  let b = BUCKETS.get(ip);
  if (!b) {
    b = { tokens: CAPACITY, updated: now };
    BUCKETS.set(ip, b);
  }

  // Refill based on elapsed time.
  const elapsed = (now - b.updated) / 1000;
  b.tokens = Math.min(CAPACITY, b.tokens + elapsed * REFILL_PER_SEC);
  b.updated = now;

  // Opportunistic sweep of idle buckets to bound memory.
  if (BUCKETS.size > 5000) {
    for (const [k, v] of BUCKETS) {
      if (now - v.updated > SWEEP_AFTER_MS) BUCKETS.delete(k);
    }
  }

  if (b.tokens >= 1) {
    b.tokens -= 1;
    return { ok: true, remaining: Math.floor(b.tokens), retryAfter: 0 };
  }
  return { ok: false, remaining: 0, retryAfter: Math.ceil((1 - b.tokens) / REFILL_PER_SEC) };
}

/** Best-effort client IP from proxy headers (Railway sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}
