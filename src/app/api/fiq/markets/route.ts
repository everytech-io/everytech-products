import { NextResponse } from "next/server";
import { getMarkets } from "@/lib/fiq/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/fiq/markets → [{code,name}]
export async function GET() {
  try {
    const markets = await getMarkets();
    return NextResponse.json(markets, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }
}
