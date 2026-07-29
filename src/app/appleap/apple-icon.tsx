import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon for /appleap — same mark as icon.svg, rasterised at 180x180
 * with the ink field bled to the edges (iOS masks its own corners, so a
 * rounded rect here would double-round; see ../apple-icon.tsx precedent).
 *
 * Flat fills only, no gradients: this renders through next/og's Satori, whose
 * SVG support is incomplete for gradients, so the two-stop tile/arc gradients
 * in icon.svg are collapsed to solid BRAND colors here rather than risk a
 * broken or inconsistent render.
 */
export default function AppLeapAppleIcon() {
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
    size,
  );
}
