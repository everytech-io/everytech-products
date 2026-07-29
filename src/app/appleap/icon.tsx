import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/site";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * AppLeap's own mark, scoped to /appleap and its children: a leap from one
 * app (paper square) into another (gold square), tracing the site's rounded-
 * square icon convention (see ../icon.svg) but with AppLeap's own symbol.
 */
export default function AppLeapIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BRAND.ink,
          borderRadius: 7,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 100 100">
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
    size,
  );
}
