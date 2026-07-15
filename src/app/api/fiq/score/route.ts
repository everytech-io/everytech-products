import { NextResponse } from "next/server";
import { getFeature, getFeatures, getFormat, isMarketCode } from "@/lib/fiq/repo";
import { scoreLocation } from "@/lib/fiq/engine";
import { clientIp, rateLimit } from "@/lib/fiq/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/fiq/score {market,code,format}
// → {code,total,verdict,ok,pillars:[{key,label,value,weight,why}]}
export async function POST(req: Request) {
  const rl = rateLimit(clientIp(req));
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: { market?: unknown; code?: unknown; format?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { market, code, format } = body;
  if (!isMarketCode(market) || typeof code !== "string" || typeof format !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  try {
    const [feature, all, fmt] = await Promise.all([
      getFeature(market, code),
      getFeatures(market),
      getFormat(market, format),
    ]);
    if (!feature || !fmt) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(scoreLocation(feature, fmt, all));
  } catch {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }
}
