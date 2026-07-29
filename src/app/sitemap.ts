import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { absoluteUrl, STORE_UPDATED_AT } from "@/lib/site";

/**
 * Driven off PRODUCTS: any future product that ships a detail page (`href`)
 * enters the sitemap automatically. Roadmap entries have no `href` and no page,
 * so they stay out — submitting URLs that 404 is a crawl-quality own goal.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const productPages: MetadataRoute.Sitemap = PRODUCTS.filter((p) => p.href).map((p) => ({
    url: absoluteUrl(p.href!),
    lastModified: new Date(p.updatedAt),
    // Only a shipped, live app is the destination we actually want ranked highly —
    // a waitlist page (nothing to use yet) gets the same lower-priority monthly
    // branch as an in-development entry, not the live app's weekly/0.9.
    changeFrequency: p.status === "live" ? "weekly" : "monthly",
    priority: p.status === "live" ? 0.9 : 0.5,
  }));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(STORE_UPDATED_AT),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...productPages,
  ];
}
