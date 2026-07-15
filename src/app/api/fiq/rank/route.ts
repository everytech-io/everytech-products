import { NextResponse } from "next/server";
import { getFeature, getFeatures, getFormats, isMarketCode } from "@/lib/fiq/repo";
import { rankFormats } from "@/lib/fiq/engine";
import { clientIp, rateLimit } from "@/lib/fiq/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/fiq/rank {market,code} → [{format,name,total}] best-fit first.
export async function POST(req: Request) {
  const rl = rateLimit(clientIp(req));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: { market?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { market, code } = body;
  if (!isMarketCode(market) || typeof code !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    const [feature, all, formats] = await Promise.all([
      getFeature(market, code),
      getFeatures(market),
      getFormats(market),
    ]);
    if (!feature) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(rankFormats(feature, formats, all));
  } catch {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }
}
