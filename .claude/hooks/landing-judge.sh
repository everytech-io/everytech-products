#!/usr/bin/env bash
# =============================================================================
# landing-judge.sh — GUARANTEED Stop hook for landing/marketing page review.
#
# Fires at the end of every assistant turn (Claude Code "Stop" event). If any
# landing/marketing surface changed this session (working tree OR staged), it
# runs an Opus "judge" over the CURRENT file contents + the data source of
# truth and surfaces a PASS/FAIL verdict with line-level fixes. If landing
# pages were NOT touched, it exits 0 silently (no noise).
#
# Landing surfaces judged:
#   - src/app/page.tsx                     (app-store landing)
#   - src/app/franchiseiq/page.tsx         (product page)  [matches **/page.tsx]
#   - any src/app/**/page.tsx              (future marketing pages)
#   - src/app/franchiseiq/fiq-app.tsx      (in-app marketing copy)
#
# RECURSION GUARD:
#   The headless judge is spawned as `LANDING_JUDGE_ACTIVE=1 claude -p ...`.
#   That nested `claude` runs in this same repo, so it loads THIS Stop hook
#   again — but the guard at the top sees LANDING_JUDGE_ACTIVE=1 and exits 0
#   immediately, so the judge can never re-trigger the judge. We also honor
#   Claude Code's own `stop_hook_active` flag from the hook stdin payload.
#
# ENV FLAGS:
#   LANDING_JUDGE_ACTIVE=1  -> hard recursion guard; exit 0 at once.
#   LANDING_JUDGE_DRYRUN=1  -> run full change-detection but DO NOT spawn the
#                             real judge; print what it WOULD do and exit 0.
#                             (Used to prove behavior without a recursive call.)
#
# EXIT CODES (Stop hook semantics):
#   0  -> allow stop (silent when nothing changed / on PASS).
#   2  -> block stop; stderr is fed back to the main agent (on FAIL, or as a
#         fallback instruction to run the `landing-judge` skill when `claude`
#         is unavailable).
# =============================================================================

set -uo pipefail

# --- Recursion guard #1: our own env flag (set on the headless judge call) ---
if [ "${LANDING_JUDGE_ACTIVE:-}" = "1" ]; then
  exit 0
fi

# --- Read hook stdin (JSON). May be empty when invoked manually. -------------
INPUT=""
if [ ! -t 0 ]; then
  INPUT="$(cat 2>/dev/null || true)"
fi

# --- Recursion guard #2: Claude Code's own Stop-loop flag --------------------
if [ -n "$INPUT" ] && command -v jq >/dev/null 2>&1; then
  if [ "$(printf '%s' "$INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)" = "true" ]; then
    exit 0
  fi
fi

# --- Must be inside a git repo -----------------------------------------------
if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  exit 0
fi
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT" || exit 0

# --- Detect changed landing-page files (working tree + staged) ---------------
LANDING_RE='^src/app/([^/]+/)*page\.tsx$|^src/app/franchiseiq/fiq-app\.tsx$'
CHANGED="$(
  { git diff --name-only; git diff --name-only --cached; } 2>/dev/null \
    | sort -u \
    | grep -E "$LANDING_RE" || true
)"

# Nothing relevant changed -> stay quiet.
if [ -z "$CHANGED" ]; then
  exit 0
fi

# --- Resolve the data source of truth for data-alignment checks --------------
if [ -f scripts/seed/fiq-data.local.json ]; then
  DATA_SRC="scripts/seed/fiq-data.local.json"
else
  DATA_SRC="src/lib/fiq (repo.ts / engine.ts / types.ts)"
fi

# --- The rubric the judge enforces (kept verbatim in SKILL.md) ---------------
read -r -d '' RUBRIC <<'RUBRIC_EOF'
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
RUBRIC_EOF

# --- Dry-run: prove change-detection without spawning a real judge -----------
if [ "${LANDING_JUDGE_DRYRUN:-}" = "1" ]; then
  {
    echo "[landing-judge][dry-run] landing pages changed; WOULD run the Opus judge over:"
    printf '%s\n' "$CHANGED" | sed 's/^/  - /'
    echo "[landing-judge][dry-run] data source: $DATA_SRC"
    echo "[landing-judge][dry-run] no judge spawned; exiting 0."
  } >&2
  exit 0
fi

# --- Fallback: no `claude` binary -> block and tell the agent to run skill ----
if ! command -v claude >/dev/null 2>&1; then
  {
    echo "LANDING JUDGE: landing/marketing pages changed but the 'claude' binary"
    echo "is unavailable for a headless review. Run the 'landing-judge' skill now"
    echo "to score these files against the rubric below:"
    printf '%s\n' "$CHANGED" | sed 's/^/  - /'
    echo
    echo "Data source of truth: $DATA_SRC"
    echo
    echo "$RUBRIC"
  } >&2
  exit 2
fi

# --- Run the headless Opus judge (recursion-guarded via env var) -------------
PROMPT="$(
  cat <<EOF
You are the LANDING-PAGE JUDGE for the everytech-products repo. Read the CURRENT
contents of each changed landing/marketing file listed below, AND the data
source of truth, then score each page against the rubric. Use the Read tool.

Changed landing files:
$(printf '%s\n' "$CHANGED")

Data source of truth (read this to verify data-alignment claims): $DATA_SRC

$RUBRIC
EOF
)"

VERDICT="$(LANDING_JUDGE_ACTIVE=1 claude -p "$PROMPT" --model opus 2>&1)"

{
  echo "===================== LANDING JUDGE VERDICT ====================="
  echo "$VERDICT"
  echo "================================================================"
} >&2

# Block the stop when the judge FAILs so the main agent must address it.
if printf '%s' "$VERDICT" | grep -qiE '\bFAIL\b'; then
  exit 2
fi

exit 0
