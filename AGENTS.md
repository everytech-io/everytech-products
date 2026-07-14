# AGENTS.md — everytech-products

First-party product showcase for Every Tech. Next.js app on the EveryToys stack, themed
with the EveryTech editorial design system.

## Rules

- **Stack matches `every-toys-webapp`**: Next.js 16 App Router, React 19, TypeScript,
  `@/*` alias, Tailwind v4 via `@tailwindcss/postcss`. Read `node_modules/next/dist/docs/`
  before writing route code; `params`/`searchParams` are `Promise<...>`, `cookies()`/
  `headers()` are async.
- **Theme is a port of the EveryTech Ghost theme**, not a redesign. Tokens live in
  `src/app/globals.css` `:root` and must stay in sync with
  `everytech-website/theme/assets/css/screen.css`. Base is warm white `#FAFAF7`; gold is
  `#c89519` (never neon `#FFD11A`); never a dark base. Fonts: Newsreader (display),
  Quicksand (labels), Inter (body), IBM Plex Mono (data).
- **Products are data.** Add products to `src/lib/products.ts`. A live product ships its app
  under `public/apps/` and a detail page under `src/app/<slug>/`.
- **Real-data honesty carries over from EveryToys.** Products state their data sources and
  limitations on the page (see the FranchiseIQ provenance ledger). Modeled proxies are
  labeled as proxies.

## Bundled apps

Single-file product apps live under `public/apps/*.html` and are framed same-origin by their
detail page. `next.config.ts` sets `X-Frame-Options: SAMEORIGIN` for `/apps/*` and `DENY`
for everything else.

## Commit hygiene

Conventional commits (`type(scope): subject`, lowercase subject). Scopes: `products`, `ui`,
`franchiseiq`, `theme`, `chore`.
