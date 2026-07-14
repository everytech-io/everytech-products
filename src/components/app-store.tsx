"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PRODUCTS, USE_CASES, type Product, type UseCase } from "@/lib/products";

/** Build the searchable text blob for a product once. */
function haystack(p: Product): string {
  return [p.name, p.tagline, p.excerpt, ...p.meta, ...p.categories, ...p.keywords]
    .join(" ")
    .toLowerCase();
}

export default function AppStore() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<UseCase | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const matchesCategory = active ? p.categories.includes(active) : true;
      const matchesQuery = q ? haystack(p).includes(q) : true;
      return matchesCategory && matchesQuery;
    });
  }, [query, active]);

  const liveCount = PRODUCTS.filter((p) => p.status === "live").length;

  return (
    <section className="section" id="store" aria-label="App store">
      <div className="section-head">
        <p className="kicker">The app store</p>
        <span className="section-head__link mono">
          {liveCount} live · {PRODUCTS.length} total
        </span>
      </div>

      <p className="section__lead">
        Pick a use case or search for the outcome you need. Every result is a real,
        first-party EveryTech app you can open — not slideware. Coming-soon entries are
        honest roadmap.
      </p>

      {/* ── Search + use-case filter ─────────────────────────────────── */}
      <div className="store-controls">
        <div className="store-search">
          <svg
            className="store-search__icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            className="store-search__input"
            placeholder="Search by use case — “franchise location”, “agent workflow”, “grounded AI”…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products by use case"
          />
          {query ? (
            <button
              type="button"
              className="store-search__clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              &times;
            </button>
          ) : null}
        </div>

        <div className="chips" role="group" aria-label="Filter by use case">
          <button
            type="button"
            className={"chip" + (active === null ? " chip--active" : "")}
            onClick={() => setActive(null)}
            aria-pressed={active === null}
          >
            All
          </button>
          {USE_CASES.map((uc) => (
            <button
              key={uc}
              type="button"
              className={"chip" + (active === uc ? " chip--active" : "")}
              onClick={() => setActive(active === uc ? null : uc)}
              aria-pressed={active === uc}
            >
              {uc}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────── */}
      {results.length === 0 ? (
        <div className="store-empty">
          <p className="store-empty__title">No app for that yet.</p>
          <p className="store-empty__body">
            Nothing in the store matches{" "}
            {query ? <strong>&ldquo;{query}&rdquo;</strong> : "that use case"}. Tell us the
            outcome you need and we&rsquo;ll build it — that&rsquo;s how FranchiseIQ started.
          </p>
          <a className="btn btn--sm" href="https://everytech.io/briefing/" target="_blank" rel="noopener">
            Request an app
          </a>
        </div>
      ) : (
        <div className="pgrid-products">
          {results.map((p) => {
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
                  {p.categories.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
                <span className="pcard__more">
                  {p.href ? "Open app" : "In development"}
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
      )}
    </section>
  );
}
