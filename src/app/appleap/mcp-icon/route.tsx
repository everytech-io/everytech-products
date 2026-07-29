import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/site";

export const dynamic = "force-static";

/**
 * A standalone 512x512 PNG of AppLeap's mark, at a stable URL
 * (/appleap/mcp-icon), for pasting into MCP connector setup forms (Claude,
 * ChatGPT) that ask for an icon image — those need a plain hosted image
 * file, not a favicon route scoped to browser tab chrome.
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
          <path
            d="M32 58 C 30 30, 62 12, 70 18"
            fill="none"
            stroke={BRAND.paper}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <rect x="10" y="52" width="34" height="34" rx="10" fill={BRAND.paper} />
          <rect x="56" y="10" width="34" height="34" rx="10" fill={BRAND.gold} />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
