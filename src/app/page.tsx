import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <p className="kicker">EveryTech Products</p>
        <h1 className="hero__title">
          One shop for everything <span className="accent">EveryTech ships</span>.
        </h1>
        <p className="hero__triad mono">
          Open-data intelligence &middot; AI governance &middot; deterministic agent pipelines
        </p>
        <p className="hero__sub">
          This is EveryTech&rsquo;s product hub: the single place every first-party tool the firm
          builds is launched and lives. Not slideware, production surfaces you can open right now.
          First up is FranchiseIQ PH, a franchise-site scoring engine built entirely on open
          Philippine government data.
        </p>
        <div className="hero__cta">
          <Link className="btn" href="/franchiseiq">
            Launch FranchiseIQ
          </Link>
          <a className="hero__cta-note" href="#products">
            See all products &darr;
          </a>
        </div>
      </section>

      <section className="section" id="products" aria-label="Products">
        <div className="section-head">
          <p className="kicker">The catalog</p>
          <span className="section-head__link mono">{PRODUCTS.length} products</span>
        </div>
        <p className="section__lead">
          Every product EveryTech ships lands here, on one canonical build discipline: real data
          only, an auditable trail, and a working surface you can click. Coming-soon entries are
          honest roadmap, not vaporware.
        </p>
        <div className="pgrid-products">
          {PRODUCTS.map((p) => {
            const inner = (
              <>
                <div className="pcard__top">
                  <p className="kicker">{p.tagline}</p>
                  <span
                    className={
                      "pcard__status" + (p.status === "in-development" ? " pcard__status--soon" : "")
                    }
                  >
                    {p.statusLabel}
                  </span>
                </div>
                <h2 className="pcard__title">{p.name}</h2>
                <p className="pcard__excerpt">{p.excerpt}</p>
                <div className="pcard__meta">
                  {p.meta.map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
                <span className="pcard__more">
                  {p.href ? "Open product" : "In development"}
                  {p.href ? <span className="pcard__arrow">&rarr;</span> : null}
                </span>
              </>
            );
            return (
              <article className="pcard" key={p.slug}>
                {p.href ? (
                  <Link className="pcard__link" href={p.href}>
                    {inner}
                  </Link>
                ) : (
                  <div className="pcard__link">{inner}</div>
                )}
              </article>
            );
          })}
        </div>
      </section>

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
