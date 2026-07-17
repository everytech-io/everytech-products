/**
 * Canonical site identity. Every SEO surface (metadata, robots, sitemap,
 * JSON-LD, OG images) reads from here so the store only ever declares one
 * origin and one name for itself.
 *
 * `NEXT_PUBLIC_SITE_URL` stays overridable for preview/staging deploys, which
 * should not advertise the production canonical. Production leaves it unset.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://apps.everytech.io").replace(
  /\/$/,
  "",
);

/** Store name, as it appears in OG/Twitter cards and structured data. */
export const SITE_NAME = "EveryTech App Store";

/** The organization behind the store; the sibling main site is the Org's canonical home. */
export const ORG_NAME = "EveryTech";
export const ORG_URL = "https://everytech.io";
export const ORG_CONTACT_EMAIL = "contact@everytech.io";

/** Absolute URL for a site-relative path — required by JSON-LD and sitemaps. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

/**
 * Last substantive change to the store landing itself (ISO date). Bump when the
 * hub copy or the catalog changes; product pages carry their own `updatedAt`.
 * Hand-maintained on purpose — build time would claim a fresh edit on every
 * redeploy, which is exactly the signal crawlers learn to discount.
 */
export const STORE_UPDATED_AT = "2026-07-17";

/** Brand palette, mirrored from globals.css `:root` for use in next/og images. */
export const BRAND = {
  ink: "#16140f",
  paper: "#fafaf7",
  gold: "#c89519",
  muted: "#8b8578",
} as const;
