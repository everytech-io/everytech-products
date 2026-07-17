import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — the same mark as `icon.svg`, rasterised at 180x180 with the
 * ink field bled to the edges (iOS masks its own corners, so a rounded rect here
 * would double-round).
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.ink,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 100 100">
          <path
            d="M80.7 54.3 A31 31 0 1 0 61.6 78.7"
            fill="none"
            stroke={BRAND.paper}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <rect x="18" y="43" width="60" height="14" rx="7" fill={BRAND.paper} />
          <circle cx="80" cy="71" r="8" fill={BRAND.gold} />
        </svg>
      </div>
    ),
    size,
  );
}
