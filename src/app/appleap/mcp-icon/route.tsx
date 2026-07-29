import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/site";

export const dynamic = "force-static";

/**
 * A standalone 512x512 PNG of AppLeap's mark, at a stable URL
 * (/appleap/mcp-icon), for pasting into MCP connector setup forms (Claude,
 * ChatGPT) that ask for an icon image — those need a plain hosted image
 * file, not a favicon route scoped to browser tab chrome.
 *
 * Same geometry as ../icon.svg (two tiles + leaping arc), but flat fills:
 * this renders through next/og's Satori, whose gradient support is
 * unreliable, so the tile/arc gradients are collapsed to solid BRAND colors.
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BRAND.ink,
        }}
      >
        <svg width="512" height="512" viewBox="0 0 100 100">
          <rect x="12" y="54" width="36" height="26" rx="8" fill={BRAND.paper} />
          <rect x="56" y="12" width="30" height="22" rx="7" fill={BRAND.paper} />
          <path
            d="M 30 58 Q 46 20 64 28"
            fill="none"
            stroke={BRAND.gold}
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M 77 22 L 62 33 L 67 24 Z" fill={BRAND.gold} />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
