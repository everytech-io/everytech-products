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
          A 0 to 100 franchise-viability score for any neighborhood &mdash; with the reasoning shown
          for every point, and a reverse mode that ranks every format for a site. Live in two
          markets: <strong>Philippines</strong> (Metro Manila + Calabarzon) and{" "}
          <strong>Malaysia</strong> (Kuala Lumpur).
        </p>
        <p className="post-byline mono">
          Live pilot &middot; built on open government data &middot; decision-ready in seconds
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
          A franchise site is a seven-figure bet usually placed on instinct and a broker&rsquo;s
          pitch. FranchiseIQ turns it into a defensible, data-backed score in seconds &mdash; and
          shows its work, so the number holds up in a boardroom.
        </blockquote>

        <h2>Where it pays off</h2>
        <ul className="pillars">
          <li>
            <b>Franchise brands &amp; franchisors</b>
            <span>
              Rank every neighborhood before you sign leases. Expand into the sites the data backs,
              not the ones a broker is pushing &mdash; and cut the cost of a wrong location.
            </span>
          </li>
          <li>
            <b>SME &amp; first-time operators</b>
            <span>
              One honest go / no-go on the location you&rsquo;re about to put your capital into,
              before you commit the lease.
            </span>
          </li>
          <li>
            <b>Investors &amp; diligence</b>
            <span>
              A repeatable, comparable score across a whole pipeline, so site risk becomes a number
              you can defend in an investment memo.
            </span>
          </li>
        </ul>

        <h2>What each score weighs</h2>
        <ul className="pillars">
          <li>
            <b>Demand</b>
            <span>How many people the catchment actually holds.</span>
          </li>
          <li>
            <b>Spending power</b>
            <span>Whether the area can afford the format &mdash; premium concepts held to a higher bar.</span>
          </li>
          <li>
            <b>Foot traffic</b>
            <span>Road traffic and nearby anchors that pull customers past the door.</span>
          </li>
          <li>
            <b>Competition gap</b>
            <span>Residents left per existing outlet &mdash; the room still on the table.</span>
          </li>
        </ul>

        <h2>Why the number holds up</h2>
        <p>
          Every score is built on open government data and one transparent formula, identical across
          markets &mdash; no black box. The app shows the weight and reasoning behind each pillar, so
          a CTO or an investment committee can audit exactly why a site scored what it did. The
          pilots run on clearly labelled sample data across the Philippines (Metro Manila and
          Calabarzon) and Malaysia (Kuala Lumpur); the same engine runs unchanged on full national
          datasets, so what you&rsquo;re evaluating here is the real product, not a mockup.
        </p>
      </div>
    </article>
  );
}
