# EveryTech Products

First-party product showcase for **Every Tech** (`everytech.io`). A Next.js app on the
same stack as the EveryToys web app, wearing the **EveryTech editorial theme** (the frozen
ThatGuy light system: Newsreader display, Quicksand labels, Inter body, IBM Plex Mono data;
warm white `#FAFAF7`, gold `#c89519`).

The site is a small catalog of shipped, first-party products. The first is **FranchiseIQ
PH**, a franchise-site location-intelligence app built on open Philippine government data.

## Stack

Same as `every-toys-webapp`:

- Next.js 16 (App Router) + React 19
- TypeScript, `@/*` path alias
- Tailwind v4 pipeline via `@tailwindcss/postcss` (the editorial design system lives in
  `src/app/globals.css`, ported from the EveryTech Ghost theme)

## Layout

| Path | What |
|---|---|
| `src/app/page.tsx` | Products catalog (home) |
| `src/app/franchiseiq/page.tsx` | FranchiseIQ product page (embeds the live app) |
| `src/app/globals.css` | EveryTech editorial theme tokens + components |
| `src/components/` | `site-header`, `site-footer`, `logo` |
| `src/lib/products.ts` | Product registry (add products here) |
| `public/apps/franchiseiq.html` | The FranchiseIQ single-file app (Leaflet + scoring engine) |

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

## Add a product

1. Add an entry to `PRODUCTS` in `src/lib/products.ts`.
2. If it has a live surface, drop the app under `public/apps/` and add a detail page under
   `src/app/<slug>/page.tsx` that frames it (see `franchiseiq`).

## Theme

The design system is a verbatim port of the EveryTech Ghost theme
(`everytech-website/theme/assets/css/screen.css`). Keep the tokens in `:root` in sync with
that source. Gold is `#c89519`, never neon; the base is always the warm `#FAFAF7`, never a
dark surface.
