import type { Metadata } from "next";
import Link from "next/link";
import { getProduct } from "@/lib/products";
import { FranchiseIQApp } from "./fiq-app";

const product = getProduct("franchiseiq")!;

export const metadata: Metadata = {
  title: product.name,
  description: product.excerpt,
  openGraph: { title: product.name, description: product.excerpt, url: "/franchiseiq" },
};

export default function FranchiseIQPage() {
  return (
    <article className="post">
      <header className="post-header">
        <Link className="post-back" href="/#products">
          &larr; All products
        </Link>
        <p className="kicker">{product.tagline}</p>
        <h1 className="post-title">FranchiseIQ</h1>
        <p className="post-dek">
          A 0 to 100 franchise-viability score for any neighborhood, with a live pillar breakdown
          and a reverse mode that ranks every format for a location. Two live markets:{" "}
          <strong>Philippines</strong> (Quezon City) and <strong>Malaysia</strong> (Kuala Lumpur).
        </p>
        <p className="post-byline mono">
          Live pilot &middot; open government data &middot; PSGC + DOSM keyed &middot; PH &amp; MY
        </p>
        <div className="post-actions">
          <a
            className="hero__cta-note"
            href="https://everytech.io/briefing/"
            target="_blank"
            rel="noopener"
          >
            Talk to us &rarr;
          </a>
        </div>
      </header>

      <FranchiseIQApp />

      <div className="prose">
        <blockquote>
          Choosing a franchise site in Metro Manila is usually done on instinct. FranchiseIQ turns
          open government data into a defensible score, and shows its work for every pillar.
        </blockquote>

        <h2>What it does</h2>
        <p>
          Pick a barangay and a franchise format and FranchiseIQ returns a single 0 to 100 viability
          score, a verdict, and a breakdown across four weighted pillars. Switch to reverse mode and
          it ranks all four formats for one location, so you can ask both &ldquo;is this site good
          for a coffee shop?&rdquo; and &ldquo;what should go here?&rdquo;
        </p>

        <ul className="pillars">
          <li>
            <b>Demand</b>
            <span>Population and density, normalized within the pilot city.</span>
          </li>
          <li>
            <b>Spending power</b>
            <span>A poverty-inverse income index, with a soft floor penalty for premium formats.</span>
          </li>
          <li>
            <b>Foot traffic</b>
            <span>Measured road traffic blended with format-specific anchor gravity.</span>
          </li>
          <li>
            <b>Competition gap</b>
            <span>Residents served per existing outlet: how much room is left.</span>
          </li>
        </ul>

        <h2>How it is built</h2>
        <p>
          Each market joins every dataset on one canonical government identifier: the 10-digit PSGC
          (Philippine Standard Geographic Code) in the Philippines, the DOSM administrative code in
          Malaysia. Population, income, road traffic, and points of interest all key on that one
          code. Name matching is forbidden outside the single step that owns the code to name to
          geometry mapping, which is where most naive location tools quietly corrupt their results.
        </p>
        <p>
          The scoring engine is a transparent weighted dot product, identical across markets, not a
          black box. It is deterministic and designed to port verbatim from this frontend into a
          Postgres or edge function, so the demo math and the production math are the same math.
          Adding a country is a data-adapter and weight-matrix change, not a rewrite; extending a
          country from one pilot city to the whole nation is an ingestion job, because the schema and
          the join key already assume national scale.
        </p>

        <h2>Honest limitations</h2>
        <p>
          Each live pilot runs on a clearly labeled seed dataset (12 Quezon City barangays for PH, 12
          Kuala Lumpur zones for MY). Income is city-resolution in the pilots, foot traffic is a
          modeled proxy (road traffic plus anchor gravity), and informal-vendor competitor counts
          undercount. Those caveats travel with the product rather than hiding in a footnote, which
          is the whole point: a real-data product that is honest about what its data can and cannot
          say. Use the provenance panel above each map to see the exact sources per market.
        </p>
      </div>
    </article>
  );
}
