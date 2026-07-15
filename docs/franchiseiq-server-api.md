# FranchiseIQ — Server-Side Scoring API

**Status:** Proposed · awaiting review
**Goal:** Move the FranchiseIQ dataset and scoring engine off the client so the raw
feature data is never visible in the browser and never lives in the public repo. The
client only ever receives computed **outputs** (scores, verdicts, explanations).

---

## 1. Why

Today both pilot apps (`public/apps/franchiseiq.html`, `franchiseiq-my.html`) ship the
**entire dataset and weight matrix in client JS** — `BGYS` (pop, income, traffic,
competitor counts per location) and `PROFILES` (the scoring weights). Anyone can
view-source and lift all of it.

Two hard constraints shape the design:

1. **The repo is public.** So a "server-only" TypeScript data module is *not* enough —
   it would still be readable on GitHub. The data must live in a **private store**, not
   in the repo.
2. **Outputs, not inputs.** The product's value is the score. The browser should receive
   scores/verdicts and a controlled explanation — never the raw feature values or the
   weight matrix (both are IP).

---

## 2. Principles

- **Private data store** (Postgres). Raw features never enter the repo or the client bundle.
- **One scoring engine**, server-only, shared by every endpoint and both markets (PH/MY).
- **Same schema for pilot and production** — swap table *contents*, not code. Pilot loads
  today's 25 PH + 12 MY seed rows; production loads PSA/DOSM ETL output into the same tables.
- **Minimal payloads + rate limiting** so the data can't be reconstructed by enumeration.

---

## 3. Architecture

```
  Browser (FranchiseIQ UI, apps.everytech.io)
        │  fetch() — outputs only
        ▼
  Next.js Route Handlers  /api/fiq/*        ← runs on the existing Railway service
        │  service-role key (server-only env)
        ▼
  Postgres (private)  — locations · features(SENSITIVE) · formats
```

No new service to run — the API is Route Handlers inside the current `everytech-products`
Next.js app on Railway. Same origin as the apps, so no CORS.

---

## 4. Data model (Postgres)

| table | columns | sensitivity |
|-------|---------|-------------|
| `fiq_market` | `code` pk (`ph`/`my`), `name` | public |
| `fiq_location` | `code` pk, `market`, `city`, `name`, `lat`, `lng` | non-sensitive (public geography) |
| `fiq_features` | `code` pk→location, `pop`, `dens`, `inc`, `tra`, `poi` jsonb, `comp` jsonb | **SENSITIVE — server-only** |
| `fiq_format` | `id`, `market`, `name`, `color`, `comp_key`, `weights` jsonb, `income_floor`, `anchor_weights` jsonb | **weights are IP — server-only** |

- Join key = `code` (PSGC in PH, DOSM in MY) — same discipline the product already advertises.
- **RLS:** deny `anon`/`public` entirely. Only the `service_role` (used from the server)
  reads `fiq_features` and `fiq_format.weights`. `fiq_location`/`fiq_market` we serve via
  the API anyway, so they never need public grants either.

---

## 5. API contract (Route Handlers)

All under `/api/fiq`. Reads use a server-only Postgres client; nothing below returns raw features or weights.

| method · route | body / query | returns |
|---|---|---|
| `GET /markets` | — | `[{code,name}]` |
| `GET /locations` | `?market=ph` | `[{code,city,name,lat,lng}]` — **no features** (dropdown + map) |
| `GET /formats` | `?market=ph` | `[{id,name,color}]` — **no weights** |
| `POST /score` | `{market,code,format}` | `{total, verdict, pillars:[{key,label,value,weight,why}]}` |
| `POST /rank` | `{market,code}` | `[{format,name,total}]` — reverse "what fits here" |
| `POST /score-all` | `{market,format}` | `[{code,total}]` — **derived totals only**, for map coloring |

Notes:
- `weights` / `income_floor` / `anchor_weights` are **never** returned — the client shows
  `weight` per pillar in `/score` only because that's already visible in the UI; the full
  matrix stays server-side.
- Explanations (`why`) are composed **server-side** (see §6).

---

## 6. Data-protection details

- **Explanations.** The current UI text echoes exact values ("198k residents",
  "6 existing competitors"). Server-side we can either keep exact phrasing (fine for the
  approximate *pilot* data) or switch to **banded language** ("≈200k residents", "high
  density", "low competition") so production numbers aren't echoed verbatim. → decision below.
- **No bulk feature endpoint.** `/score-all` returns only totals, never the inputs behind them.
- **Rate limiting.** Per-IP token bucket on the `POST` endpoints to deter scraping/enumeration.
- **Secrets.** `DATABASE_URL` / service-role key live in Railway env vars, never `NEXT_PUBLIC_*`.

---

## 7. Client changes (keep the design)

The civic-stamp UI stays exactly as-is — only the **data layer** changes:

- Delete `BGYS`, `PROFILES`, and the scoring functions from the app JS.
- On load: `GET /locations` + `GET /formats` → build the grouped dropdown, format list, map markers.
- On **Run**: `POST /score` (forward) or `POST /rank` (reverse).
- On a forward score: `POST /score-all` → recolor the map.
- Add loading + error states (graceful "service unavailable" if the API is down).
- Identical flow for PH and MY via the `market` param.

---

## 8. Caching / performance

- `/locations`, `/formats`: cache (`s-maxage`) — change rarely.
- `/score-all`: cache per `(market,format)`.
- Engine normalization constants (`maxPop`, `maxDens`, `maxGravity`, `maxPerComp`) computed
  per market from features and memoized in-process with a short TTL.

---

## 9. Rollout

1. Provision schema + RLS; load current pilot rows (25 PH + 12 MY). **Data leaves the repo.**
2. Build `src/lib/fiq/engine.ts` + Route Handlers; unit-test **exact parity** with today's
   client scores (same inputs must yield same numbers).
3. Rewrite the two apps to fetch the API; remove embedded data; keep design.
4. Set Railway env; deploy; verify `apps.everytech.io/franchiseiq` end-to-end.
5. *(Later)* Production ETL: PSA (POPCEN/CPH, SAE poverty), DPWH AADT, OSM → `fiq_features`;
   DOSM/data.gov.my → MY.

---

## 10. Open decisions (need your call before I build)

1. **Data store** — *Supabase Postgres* (EveryTech house standard, RLS, already connected)
   **[recommended]** vs *Railway Postgres* (co-located in the same Railway project, private
   networking, one bill).
2. **Explanations** — *exact numbers* (simplest, ok for approximate pilot data) vs *banded
   language* (maximum protection, better for production).
3. **Client shape** — keep *static HTML + fetch* **[recommended, preserves the design with
   least churn]** vs convert the apps to *Next.js React routes*.
4. **Repo history** — the seed data is *already* in public git history from earlier commits.
   Since it's approximate demo data, we can *leave history as-is and only stop committing
   data going forward* **[recommended]**, or *rewrite history* (`git filter-repo` + force
   push) to purge it. Real production data must never be committed regardless.

---

## 11. Decisions (locked 2026-07-15) + build plan

| decision | choice |
|---|---|
| Data store | **Supabase Postgres** (RLS deny-public; server reads via service role) |
| Explanations | **Banded** ("≈200k residents", "high density", "low competition") — no exact values leave the server |
| Client | **Convert apps to Next.js React routes** (retire the static `public/apps/*.html` iframes; port the civic-stamp UI to JSX + Leaflet-via-npm, identical look) |
| Repo history | **Leave as-is**; remove data from the working tree; never commit real data |
| Delivery | **Feature branch → PR → live preview deploy** so it can be tested before merging to `main` |

**Build (branch `feat/fiq-server-api`, opened as a PR — no auto-merge):**
- `src/lib/fiq/engine.ts` — scoring ported for **exact parity** with the current client engine, plus a banded-explanation composer. Covered by a parity test.
- `src/lib/fiq/repo.ts` — server-only Supabase reads (service-role key).
- `src/app/api/fiq/{markets,locations,formats,score,rank,score-all}/route.ts` — outputs only, POST endpoints rate-limited.
- `src/app/franchiseiq/*` — React port of the PH/MY apps (same design, same SVG icons), fetching the API.
- `supabase/migrations/0001_fiq.sql` — schema + RLS. `scripts/seed-fiq.mjs` loads from a **gitignored** local JSON (data never re-committed).
- Retire `public/apps/franchiseiq*.html`; drop the `/apps/*` header block.

**Preview + go-live (needs credentials):**
- Supabase project (URL + service-role key, or a `DATABASE_URL`) → run migration + seed.
- Railway: set env vars + a **PR/preview environment** so the branch gets its own test URL.
- You test the preview → approve → merge PR to `main` → production.
