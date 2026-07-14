export type ProductStatus = "live" | "in-development";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  excerpt: string;
  status: ProductStatus;
  statusLabel: string;
  /** Internal route for a product detail page, when one exists. */
  href?: string;
  meta: string[];
};

export const PRODUCTS: Product[] = [
  {
    slug: "franchiseiq",
    name: "FranchiseIQ",
    tagline: "Franchise-site location intelligence on open government data",
    excerpt:
      "Score any neighborhood 0 to 100 for a franchise format, or reverse it to rank the best format for a location. Two live markets: Philippines (Quezon City, PSGC-keyed) and Malaysia (Kuala Lumpur, DOSM-keyed), both on open government data.",
    status: "live",
    statusLabel: "Live · PH + MY",
    href: "/franchiseiq",
    meta: ["Geospatial", "Open gov data", "PH + MY"],
  },
  {
    slug: "intent-gate",
    name: "Intent Gate",
    tagline: "Machine-readable intent specs and evaluation gates for AI output",
    excerpt:
      "The governance layer behind our RAG work, packaged as a product: declarative intent specifications and automated evaluation gates that keep generated content grounded and compliant before it ships.",
    status: "in-development",
    statusLabel: "In development",
    meta: ["AI governance", "Evaluation"],
  },
  {
    slug: "receipt",
    name: "Receipt",
    tagline: "Deterministic multi-agent pipelines with an auditable trail",
    excerpt:
      "Production-hardened agent networks with strict exception handling and a full execution ledger, so high-volume business logic runs predictably and every decision is accountable after the fact.",
    status: "in-development",
    statusLabel: "In development",
    meta: ["Agents", "Observability"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
