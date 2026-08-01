import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon for /courses/claude — the same mark as icon.svg (a rising
 * staircase with a leaf at the top: seven steps of curriculum, one healthier
 * recipe app), rasterised at 180x180 with the ink field bled to the edges. iOS
 * masks its own corners, so the rounded rect from icon.svg is dropped here
 * rather than double-rounded (see ../appleap/apple-icon.tsx precedent).
 *
 * Flat fills only, no gradients: this renders through next/og's Satori, whose
 * SVG gradient support is incomplete. The source mark is already flat, so the
 * two renders agree exactly.
 */
export default function AiCurriculumAppleIcon() {
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
            d="M 10 86 L 10 70 L 28 70 L 28 56 L 46 56 L 46 42 L 64 42 L 64 86 Z"
            fill={BRAND.paper}
          />
          <path d="M 60 38 C 60 20 70 10 88 10 C 88 28 78 38 60 38 Z" fill={BRAND.gold} />
          <path
            d="M 64 34 L 84 14"
            fill="none"
            stroke={BRAND.ink}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
