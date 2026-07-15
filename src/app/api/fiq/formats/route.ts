import { NextResponse } from "next/server";
import { getFormatsPublic, isMarketCode } from "@/lib/fiq/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/fiq/formats?market=ph → [{id,name,color}] — no weights.
export async function GET(req: Request) {
  const market = new URL(req.url).searchParams.get("market");
  if (!isMarketCode(market)) {
    return NextResponse.json({ error: "unknown market" }, { status: 400 });
  }
  try {
    const formats = await getFormatsPublic(market);
    return NextResponse.json(formats, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }
}
