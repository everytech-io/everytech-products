import Link from "next/link";
import AppStore from "@/components/app-store";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="kicker">EveryTech App Store</p>
        <h1 className="hero__title">
          Find the app for <span className="accent">your use case</span>.
        </h1>
        <p className="hero__triad mono">
          Location intelligence &middot; AI governance &middot; deterministic agent pipelines
        </p>
        <p className="hero__sub">
          One store for every app EveryTech ships. Search the outcome you need or browse by use
          case, then open a real, working surface built on the same discipline that runs our
          enterprise work &mdash; real data, an auditable trail, no slideware. FranchiseIQ, a
          franchise-site scoring engine live for the Philippines and Malaysia on a pilot dataset,
          is the first.
        </p>
        <div className="hero__cta">
          <a className="btn" href="#store">
            Browse the store
          </a>
          <Link className="hero__cta-note" href="/franchiseiq">
            Open FranchiseIQ &rarr;
          </Link>
        </div>
      </section>

      <AppStore />

      <section className="pgrid" aria-label="How these products are built">
        <p className="kicker">Build discipline</p>
        <div className="pgrid__grid">
          <div className="pgrid__cell">
            <p className="pgrid__label mono">Real data only</p>
            <p className="pgrid__body">
              Every value carries its source and vintage. Modeled proxies are labeled as proxies, not
              presented as absolute truth.
            </p>
          </div>
          <div className="pgrid__cell">
            <p className="pgrid__label mono">One join key</p>
            <p className="pgrid__body">
              For geospatial products, everything joins on a canonical identifier (PSGC in the
              Philippines). Name matching is forbidden outside one owned mapping step.
            </p>
          </div>
          <div className="pgrid__cell">
            <p className="pgrid__label mono">Explains itself</p>
            <p className="pgrid__body">
              Scores and outputs render their own reasoning and weights, so a decision-maker sees
              exactly why the number is what it is.
            </p>
          </div>
          <div className="pgrid__cell">
            <p className="pgrid__label mono">Ships as a surface</p>
            <p className="pgrid__body">
              Not a notebook. A working, clickable product on the same stack that runs our
              enterprise work.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-strip">
        <p className="kicker">From the practice</p>
        <h2 className="cta-strip__title">Need a product like this for your data?</h2>
        <p className="cta-strip__line">
          FranchiseIQ went from scope to a working app in a day, on open data. The same discipline
          applies to your proprietary datasets.
        </p>
        <a className="btn" href="https://everytech.io/briefing/" target="_blank" rel="noopener">
          Request a briefing
        </a>
      </section>
    </>
  );
}
