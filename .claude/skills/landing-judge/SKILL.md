---
name: landing-judge
description: >-
  Judge the app's landing/marketing pages against the product goal by spawning
  an Opus judge subagent that scores each page and returns a per-page PASS/FAIL
  with line-level fixes. Use when editing landing or marketing copy in
  src/app/**/page.tsx or src/app/franchiseiq/fiq-app.tsx, when reviewing product
  page messaging, or when the user says "landing judge", "judge the landing
  pages", or "check the marketing copy". Also invoked automatically by the Stop
  hook whenever a landing page changed this session.
---

# Landing Judge

Guarantees that the marketing/landing surfaces stay aligned with the product
goal: lead with business value for CTOs, SME owners, and investors; keep on-page
claims consistent with the real current data; label pilot/seed data honestly;
and keep copy clear with a real CTA.

## When this runs

- **Automatically (guaranteed):** a project **Stop hook**
  (`.claude/settings.json` → `.claude/hooks/landing-judge.sh`) fires at the end
  of every assistant turn. If any landing page changed this session, it runs the
  judge; if none changed, it exits silently.
- **Manually:** invoke this skill directly, or run the hook by hand (below).

## Landing pages (the files judged)

- `src/app/page.tsx` — app-store landing
- `src/app/franchiseiq/page.tsx` — product page
- `src/app/franchiseiq/fiq-app.tsx` — in-app marketing copy
- any future `src/app/**/page.tsx` — new marketing pages

**Data source of truth** (read to verify data-alignment):
`scripts/seed/fiq-data.local.json` if present, otherwise the API layer in
`src/lib/fiq` (`repo.ts`, `engine.ts`, `types.ts`).

## How to run the judge (manual)

Spawn an **Opus** judge subagent (a general-purpose agent with `model: "opus"`).
Give it the rubric below, the file list above, and this instruction:

> Read the CURRENT contents of each changed landing file and the data source of
> truth. Score each page against every rubric dimension. For EACH page output
> `<path>: PASS|FAIL` followed by bullet-point, line-level fixes (quote the
> offending copy and give the correction). End with `OVERALL: PASS|FAIL`.

Return the verdict verbatim. Do not edit files from inside the judge — the judge
only scores; the main agent applies fixes.

## The rubric (verbatim — enforced by both the skill and the hook)

```
LANDING-PAGE RUBRIC (score each page against ALL four dimensions):

1. AUDIENCE — The landing pages target CTOs, SME owners, and investors. They
   MUST lead with business value and concrete use/business cases — NOT deep-tech
   jargon (e.g. PSGC code internals, "weighted dot product" math) as the
   headline. Tech credibility is fine as SUPPORTING detail, never the lede.

2. DATA ALIGNMENT — On-page claims must match the actual current data/state.
   Flag stale/incorrect figures (e.g. "12 Quezon City barangays" when the PH
   dataset is now 25 sites across Metro Manila + Calabarzon), wrong market
   coverage, wrong counts, or copy that contradicts the code/data.

3. HONESTY — Pilot/seed data must be clearly labeled. No overclaiming: do not
   misuse "production" / "live" for what is seed or pilot data.

4. CLARITY + CTA — Copy is clear and a clear call-to-action is present.

OUTPUT FORMAT — for EACH changed page, emit:
  <path>: PASS | FAIL
  then bullet-point, line-level fixes (quote the offending copy + the fix).
Finish with an overall verdict line: "OVERALL: PASS" or "OVERALL: FAIL".
```

## Current data snapshot (for quick reference; the judge reads the file itself)

As of the source of truth, FranchiseIQ ships **2 markets**: Philippines (**25**
sites across Metro Manila + Calabarzon — Quezon City, Makati, Taguig, plus Cavite,
Laguna, and Rizal) and Malaysia (**12** sites). Copy claiming "12 Quezon City
barangays", a single city, or one market is stale and must FAIL data-alignment.

## The guarantee: Stop hook + recursion guard

`.claude/settings.json` registers a **Stop hook** running
`.claude/hooks/landing-judge.sh`. The script:

1. Checks `git diff --name-only` (working tree) and `--cached` (staged) for any
   landing-page file. **No landing change → exit 0 silently.**
2. On a landing change, runs the judge **headlessly** via
   `LANDING_JUDGE_ACTIVE=1 claude -p "<rubric prompt>" --model opus` and prints
   the verdict to stderr. A **FAIL** exits `2` (blocks the stop, feeds the
   verdict back to the main agent); a **PASS** exits `0`.
3. If the `claude` binary is missing, it instead exits `2` with the rubric on
   stderr, instructing the main agent to run **this** `landing-judge` skill.

**Recursion guard.** The headless judge is launched with `LANDING_JUDGE_ACTIVE=1`
in its environment. That nested `claude -p` loads this same Stop hook, but the
first check in the script sees `LANDING_JUDGE_ACTIVE=1` and exits `0` at once —
so the judge can never re-trigger the judge. The script also honors Claude
Code's own `stop_hook_active` flag, and exits `0` when run outside a git repo or
when `claude` is unavailable in a way that can't loop.

## Running / testing the hook by hand

```bash
# See it detect a change WITHOUT spawning a real judge (safe, no recursion):
LANDING_JUDGE_DRYRUN=1 .claude/hooks/landing-judge.sh

# Prove the recursion guard short-circuits immediately:
LANDING_JUDGE_ACTIVE=1 .claude/hooks/landing-judge.sh   # exits 0, no output

# Full run (will spawn the Opus judge if a landing page changed):
.claude/hooks/landing-judge.sh
```
