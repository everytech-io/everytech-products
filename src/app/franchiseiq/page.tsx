import type { Metadata } from "next";
import Link from "next/link";
import { getProduct } from "@/lib/products";

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
        <h1 className="post-title">FranchiseIQ PH</h1>
        <p className="post-dek">
          A 0 to 100 franchise-viability score for any Quezon City barangay, with a live pillar
          breakdown and a reverse mode that ranks every format for a location.
        </p>
        <p className="post-byline mono">
          Live pilot &middot; open government data &middot; PSGC-keyed &middot; 12 QC barangays
        </p>
        <div className="post-actions">
          <a className="btn" href="/apps/franchiseiq.html" target="_blank" rel="noopener">
            Open full screen
          </a>
          <a
            className="hero__cta-note"
            href="https://everytech.io/briefing/"
            target="_blank"
            rel="noopener"
          >
            Talk to the firm &rarr;
          </a>
        </div>
      </header>

      <section className="appframe" aria-label="FranchiseIQ live application">
        <div className="appframe__bar">
          <span className="appframe__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="appframe__label mono">franchiseiq · pilot: Quezon City</span>
          <a className="appframe__open" href="/apps/franchiseiq.html" target="_blank" rel="noopener">
            Open ↗
          </a>
        </div>
        <iframe
          src="/apps/franchiseiq.html"
          title="FranchiseIQ PH interactive pilot"
          loading="lazy"
        />
      </section>

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
          Every dataset is keyed to the 10-digit PSGC (Philippine Standard Geographic Code), so
          population from the PSA census, poverty from PSA small-area estimates, road traffic from
          DPWH counts, and points of interest from OpenStreetMap all join on one canonical
          identifier. Name matching is forbidden outside the single step that owns the PSGC to name
          to geometry mapping, which is where most naive location tools quietly corrupt their
          results.
        </p>
        <p>
          The scoring engine is a transparent weighted dot product, not a black box. It is
          deterministic and designed to port verbatim from this frontend into a Postgres or edge
          function, so the demo math and the production math are the same math. Extending from one
          pilot city to all 42,000 barangays is an ingestion job, not a rewrite, because the schema
          and the PSGC key already assume national scale.
        </p>

        <h2>Honest limitations</h2>
        <p>
          The live pilot runs on a clearly labeled seed dataset for 12 Quezon City barangays. Income
          is city-resolution in the pilot, foot traffic is a modeled proxy (road traffic plus anchor
          gravity), and informal-vendor competitor counts undercount. Those caveats travel with the
          product rather than hiding in a footnote, which is the whole point: a real-data product
          that is honest about what its data can and cannot say.
        </p>
      </div>

      <section className="appframe" aria-label="Provenance" style={{ boxShadow: "none" }}>
        <div className="appframe__bar">
          <span className="appframe__label mono">provenance · production pipeline sources</span>
        </div>
        <dl className="ledger" style={{ maxWidth: "none", padding: "1.1rem 1.3rem" }}>
          <div className="ledger__row">
            <dt>Population</dt>
            <dd>PSA POPCEN 2024 / CPH 2020 (OpenSTAT)</dd>
          </div>
          <div className="ledger__row">
            <dt>Income</dt>
            <dd>PSA small-area poverty estimates</dd>
          </div>
          <div className="ledger__row">
            <dt>Traffic</dt>
            <dd>DPWH AADT (data.gov.ph)</dd>
          </div>
          <div className="ledger__row">
            <dt>Points of interest</dt>
            <dd>OpenStreetMap Overpass</dd>
          </div>
          <div className="ledger__row">
            <dt>Join key</dt>
            <dd>PSGC (10-digit)</dd>
          </div>
        </dl>
      </section>
    </article>
  );
}
