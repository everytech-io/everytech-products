import { BRAND } from "@/lib/site";

/** Open Graph canvas — the size every scraper expects. */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

/** The EveryTech mark, matching src/app/icon.svg. */
function Mark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
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
  );
}

type OgCardProps = {
  /** Small gold label above the title. */
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Short meta pills along the bottom edge. */
  chips?: string[];
};

/**
 * Shared OG card. Rendered by Satori (next/og), so: flexbox only, no external
 * fonts or images, and every element that holds more than one child declares
 * `display: flex` explicitly.
 */
export function OgCard({ eyebrow, title, subtitle, chips = [] }: OgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BRAND.ink,
        padding: "68px 72px",
        position: "relative",
      }}
    >
      {/* Oversized mark echo, bled off the right edge as a watermark. */}
      <div style={{ position: "absolute", top: 110, right: -140, display: "flex", opacity: 0.07 }}>
        <svg width="620" height="620" viewBox="0 0 100 100">
          <path
            d="M80.7 54.3 A31 31 0 1 0 61.6 78.7"
            fill="none"
            stroke={BRAND.paper}
            strokeWidth="10"
            strokeLinecap="round"
          />
          <rect x="18" y="45" width="60" height="10" rx="5" fill={BRAND.paper} />
        </svg>
      </div>

      {/* Brand lockup */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Mark />
        <div style={{ display: "flex", color: BRAND.paper, fontSize: 30, letterSpacing: "-0.01em" }}>
          EveryTech
        </div>
        <div
          style={{
            display: "flex",
            color: BRAND.muted,
            fontSize: 22,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            paddingTop: 4,
          }}
        >
          App Store
        </div>
      </div>

      {/* Headline block */}
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
        <div
          style={{
            display: "flex",
            color: BRAND.gold,
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            color: BRAND.paper,
            fontSize: 66,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            color: BRAND.muted,
            fontSize: 28,
            lineHeight: 1.45,
            marginTop: 24,
          }}
        >
          {subtitle}
        </div>
      </div>

      {/* Footer: meta pills + origin */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12 }}>
          {chips.map((chip) => (
            <div
              key={chip}
              style={{
                display: "flex",
                color: BRAND.paper,
                fontSize: 20,
                padding: "8px 18px",
                borderRadius: 999,
                border: `1px solid rgba(250, 250, 247, 0.22)`,
              }}
            >
              {chip}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", width: 10, height: 10, borderRadius: 999, background: BRAND.gold }} />
          <div style={{ display: "flex", color: BRAND.muted, fontSize: 22 }}>apps.everytech.io</div>
        </div>
      </div>
    </div>
  );
}
