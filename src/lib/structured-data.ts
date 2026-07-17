import { absoluteUrl, ORG_CONTACT_EMAIL, ORG_NAME, ORG_URL, SITE_NAME } from "@/lib/site";
import type { Product } from "@/lib/products";

/** Stable @id anchors so the nodes in the graph can reference each other. */
const ORG_ID = `${ORG_URL}/#organization`;
const SITE_ID = absoluteUrl("/#website");

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG_NAME,
    url: ORG_URL,
    email: ORG_CONTACT_EMAIL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon.svg"),
    },
    description:
      "EveryTech builds first-party software products and enterprise data systems: location intelligence, AI governance, and deterministic agent pipelines.",
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
    // The store's search is a real deep link: /?q=<term> pre-filters the catalog.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** The store landing: Organization + WebSite in one graph. */
export function homeGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema()],
  };
}

/**
 * A live product's detail page: the app itself, plus breadcrumbs back to the
 * store. No `offers` and no ratings — we don't have real ones, and inventing
 * them is exactly the kind of claim that earns a manual action.
 */
export function productGraph(product: Product, featureList: string[]) {
  const url = absoluteUrl(product.href ?? `/${product.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${url}#app`,
        name: product.name,
        url,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Location intelligence",
        operatingSystem: "Web browser",
        description: product.seoDescription ?? product.excerpt,
        featureList,
        keywords: product.keywords.join(", "),
        inLanguage: "en",
        isAccessibleForFree: true,
        publisher: { "@id": ORG_ID },
        creator: { "@id": ORG_ID },
        isPartOf: { "@id": SITE_ID },
        image: `${url}/opengraph-image`,
        softwareVersion: "Pilot",
        datePublished: product.updatedAt,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: product.name,
            item: url,
          },
        ],
      },
    ],
  };
}
