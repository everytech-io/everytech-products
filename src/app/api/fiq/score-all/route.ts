import { NextResponse } from "next/server";
import { getFeatures, getFormat, isMarketCode } from "@/lib/fiq/repo";
import { scoreAll } from "@/lib/fiq/engine";
import { clientIp, rateLimit } from "@/lib/fiq/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/fiq/score-all {market,format} → [{code,total}] — derived totals only.
export async function POST(req: Request) {
  const rl = rateLimit(clientIp(req));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: { market?: unknown; format?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { market, format } = body;
  if (!isMarketCode(market) || typeof format !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    const [all, fmt] = await Promise.all([getFeatures(market), getFormat(market, format)]);
    if (!fmt) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(scoreAll(all, fmt));
  } catch {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }
}
