import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Crawlable everywhere except the FranchiseIQ JSON API, which holds no
 * indexable content and only burns crawl budget.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/api/",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/").replace(/\/$/, ""),
  };
}
