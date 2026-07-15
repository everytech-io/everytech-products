import { NextResponse } from "next/server";
import { getLocations, isMarketCode } from "@/lib/fiq/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/fiq/locations?market=ph → [{code,city,name,lat,lng}] — no features.
export async function GET(req: Request) {
  const market = new URL(req.url).searchParams.get("market");
  if (!isMarketCode(market)) {
    return NextResponse.json({ error: "unknown market" }, { status: 400 });
  }
  try {
    const locations = await getLocations(market);
    const out = locations.map((l) => ({
      code: l.code,
      city: l.city,
      name: l.name,
      lat: l.lat,
      lng: l.lng,
    }));
    return NextResponse.json(out, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }
}
