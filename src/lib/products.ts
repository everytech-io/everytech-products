export type ProductStatus = "live" | "in-development";

/**
 * Use-case categories a visitor browses the store by. Keep this list tight —
 * every product tags itself with one or more of these, and the store landing
 * renders them as filter chips. Order here is the order shown.
 */
export const USE_CASES = [
  "Location & market intelligence",
  "Retail & franchise",
  "AI governance",
  "Automation & agents",
  "Open government data",
] as const;

export type UseCase = (typeof USE_CASES)[number];

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  excerpt: string;
  status: ProductStatus;
  statusLabel: string;
  /** Internal route for a product detail page, when one exists. */
  href?: string;
  /**
   * Search-result copy for the product's own page: ~150-160 chars so it renders
   * whole in a SERP. `excerpt` is the in-store card copy and runs longer, so the
   * two are deliberately separate rather than one string doing both jobs.
   */
  seoDescription?: string;
  /** Short, keyword-led page title segment; composed by the root title template. */
  seoTitle?: string;
  /** ISO date of the last substantive change to this product's page. */
  updatedAt: string;
  meta: string[];
  /** Use-case categories this product answers; used by store search/filter. */
  categories: UseCase[];
  /** Extra free-text keywords the store search should match on. */
  keywords: string[];
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
    seoTitle: "FranchiseIQ · Franchise Site Scoring",
    seoDescription:
      "Score any neighborhood 0 to 100 for a franchise format, or reverse it to rank the best format for a site. Live pilots in the Philippines and Malaysia.",
    updatedAt: "2026-07-16",
    meta: ["Geospatial", "Open gov data", "PH + MY"],
    categories: [
      "Location & market intelligence",
      "Retail & franchise",
      "Open government data",
    ],
    keywords: [
      "franchise",
      "site selection",
      "location scoring",
      "neighborhood",
      "barangay",
      "quezon city",
      "kuala lumpur",
      "philippines",
      "malaysia",
      "psgc",
      "dosm",
      "catchment",
      "expansion",
      "store opening",
      "geospatial",
    ],
  },
  {
    slug: "intent-gate",
    name: "Intent Gate",
    tagline: "Machine-readable intent specs and evaluation gates for AI output",
    excerpt:
      "The governance layer behind our RAG work, packaged as a product: declarative intent specifications and automated evaluation gates that keep generated content grounded and compliant before it ships.",
    status: "in-development",
    statusLabel: "In development",
    updatedAt: "2026-07-16",
    meta: ["AI governance", "Evaluation"],
    categories: ["AI governance"],
    keywords: [
      "rag",
      "grounding",
      "hallucination",
      "compliance",
      "eval",
      "guardrail",
      "prompt",
      "content safety",
      "intent spec",
    ],
  },
  {
    slug: "receipt",
    name: "Receipt",
    tagline: "Deterministic multi-agent pipelines with an auditable trail",
    excerpt:
      "Production-hardened agent networks with strict exception handling and a full execution ledger, so high-volume business logic runs predictably and every decision is accountable after the fact.",
    status: "in-development",
    statusLabel: "In development",
    updatedAt: "2026-07-16",
    meta: ["Agents", "Observability"],
    categories: ["Automation & agents", "AI governance"],
    keywords: [
      "agent",
      "workflow",
      "pipeline",
      "automation",
      "audit trail",
      "observability",
      "orchestration",
      "exception handling",
      "ledger",
    ],
  },
];

/** Products carrying a given use-case category. */
export function productsByUseCase(useCase: UseCase): Product[] {
  return PRODUCTS.filter((p) => p.categories.includes(useCase));
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
