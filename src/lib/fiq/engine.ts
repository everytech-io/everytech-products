// FranchiseIQ — scoring engine (server-only).
//
// Ported VERBATIM from the two pilot HTML apps (public/apps/franchiseiq*.html)
// so that, for identical inputs, this produces byte-identical scores. The
// arithmetic below is intentionally written in the same operation order as the
// original client code; the parity test (engine.test.ts) is the acceptance gate.
//
// Normalization constants (maxPop, maxDens, maxGravity, maxPerComp) are computed
// PER MARKET from that market's full feature set — maxGravity and maxPerComp also
// depend on the chosen format (its anchorWeights / compKey), exactly as before.

import type { Features, Format, Pillar, ScoreResult, RankEntry } from "./types";

export interface RawPillars {
  demand: number;
  income: number;
  traffic: number;
  gap: number;
}

/** Sum of anchor-weight × POI count, in the format's anchorWeights key order. */
function gravityOf(f: Features, anchorWeights: Record<string, number>): number {
  return Object.keys(anchorWeights).reduce(
    (s, k) => s + anchorWeights[k] * (f.poi[k] || 0),
    0,
  );
}

/**
 * The four raw pillar scores (each 0..1) for a location under a format.
 * `all` is the market's complete feature set, used for the same-market
 * normalization the original client engine performed.
 */
export function pillarScores(b: Features, p: Format, all: Features[]): RawPillars {
  const maxPop = Math.max(...all.map((x) => x.pop));
  const maxDens = Math.max(...all.map((x) => x.dens));

  // Demand: population + density, normalized.
  const demand = 0.6 * (b.pop / maxPop) + 0.4 * (b.dens / maxDens);

  // Income: spending index, with a soft floor penalty for premium formats.
  let income = b.inc;
  if (p.incomeFloor && b.inc < p.incomeFloor) income *= 0.55;

  // Traffic: measured traffic index blended with anchor-POI gravity for this format.
  const aw = p.anchorWeights;
  const gravity = gravityOf(b, aw);
  const maxGravity = Math.max(...all.map((x) => gravityOf(x, aw)));
  const traffic = 0.55 * b.tra + 0.45 * (gravity / maxGravity);

  // Gap: demand served per existing competitor (higher = more room).
  const comp = b.comp[p.compKey] || 0;
  const perComp = b.pop / (comp + 1);
  const maxPerComp = Math.max(...all.map((x) => x.pop / ((x.comp[p.compKey] || 0) + 1)));
  const gap = perComp / maxPerComp;

  return { demand, income, traffic, gap };
}

/** Weighted 0..100 total (rounded), matching the client's `score()`. */
export function scoreTotal(b: Features, p: Format, all: Features[]): number {
  const s = pillarScores(b, p, all);
  const total =
    100 *
    (s.demand * p.weights.demand +
      s.income * p.weights.income +
      s.traffic * p.weights.traffic +
      s.gap * p.weights.gap);
  return Math.round(total);
}

export function verdict(t: number): { txt: string; ok: boolean } {
  if (t >= 75) return { txt: "STRONG SITE", ok: true };
  if (t >= 60) return { txt: "VIABLE", ok: true };
  if (t >= 45) return { txt: "MARGINAL", ok: false };
  return { txt: "NOT ADVISED", ok: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Banded-explanation composer.
//
// The original client echoed exact proprietary values ("198k residents",
// "6 existing competitors", "spending index 0.42"). Server-side we map raw
// values to BANDS so responses carry qualitative language and, at most, coarse
// rounded approximations — never the exact feature values or competitor counts.
// ─────────────────────────────────────────────────────────────────────────────

function residentsBand(pop: number): string {
  if (pop < 20000) return "under 20k residents";
  return `≈${Math.round(pop / 25000) * 25}k residents`;
}

function densityBand(dens: number): string {
  if (dens >= 30000) return "very high density";
  if (dens >= 18000) return "high density";
  if (dens >= 10000) return "moderate density";
  return "low density";
}

function spendingBand(inc: number): string {
  if (inc >= 0.75) return "premium spending power";
  if (inc >= 0.6) return "strong spending power";
  if (inc >= 0.45) return "moderate spending power";
  return "limited spending power";
}

function trafficBand(tra: number): string {
  if (tra >= 0.85) return "very high foot traffic";
  if (tra >= 0.65) return "high foot traffic";
  if (tra >= 0.45) return "moderate foot traffic";
  return "low foot traffic";
}

function anchorBand(ratio: number): string {
  if (ratio >= 0.7) return "with strong anchor pull nearby";
  if (ratio >= 0.4) return "with some nearby anchors";
  return "with few nearby anchors";
}

function roomBand(gap: number): string {
  if (gap >= 0.66) return "lots of room — low competition";
  if (gap >= 0.33) return "some room — moderate competition";
  return "crowded — high competition";
}

export function explainBanded(b: Features, p: Format, all: Features[]): Record<
  keyof RawPillars,
  string
> {
  const aw = p.anchorWeights;
  const gravity = gravityOf(b, aw);
  const maxGravity = Math.max(...all.map((x) => gravityOf(x, aw)));
  const anchorRatio = maxGravity > 0 ? gravity / maxGravity : 0;

  const s = pillarScores(b, p, all);

  const floorNote =
    p.incomeFloor && b.inc < p.incomeFloor
      ? "below this format's spending floor — penalized"
      : p.incomeFloor
        ? "clears this format's spending floor"
        : "no spending floor for this format";

  return {
    demand: `${residentsBand(b.pop)}, ${densityBand(b.dens)}.`,
    income: `${spendingBand(b.inc)}; ${floorNote}.`,
    traffic: `${trafficBand(b.tra)} ${anchorBand(anchorRatio)}.`,
    gap: `${roomBand(s.gap)}.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// High-level API used by the route handlers. Returns OUTPUTS ONLY.
// ─────────────────────────────────────────────────────────────────────────────

const PILLAR_LABELS: Record<keyof RawPillars, string> = {
  demand: "Demand",
  income: "Spending power",
  traffic: "Foot traffic",
  gap: "Competition gap",
};

export function scoreLocation(b: Features, p: Format, all: Features[]): ScoreResult {
  const s = pillarScores(b, p, all);
  const total = scoreTotal(b, p, all);
  const v = verdict(total);
  const why = explainBanded(b, p, all);

  const pillars: Pillar[] = [
    { key: "demand", label: PILLAR_LABELS.demand, value: s.demand, weight: p.weights.demand, why: why.demand },
    { key: "income", label: PILLAR_LABELS.income, value: s.income, weight: p.weights.income, why: why.income },
    { key: "traffic", label: PILLAR_LABELS.traffic, value: s.traffic, weight: p.weights.traffic, why: why.traffic },
    { key: "gap", label: PILLAR_LABELS.gap, value: s.gap, weight: p.weights.gap, why: why.gap },
  ];

  return { code: b.code, total, verdict: v.txt, ok: v.ok, pillars };
}

/** Reverse mode: rank every format for one location, best first. */
export function rankFormats(b: Features, formats: Format[], all: Features[]): RankEntry[] {
  return formats
    .map((p) => ({ format: p.id, name: p.name, total: scoreTotal(b, p, all) }))
    .sort((a, c) => c.total - a.total);
}

/** Map-coloring: derived totals for every location under one format. */
export function scoreAll(all: Features[], p: Format): { code: string; total: number }[] {
  return all.map((b) => ({ code: b.code, total: scoreTotal(b, p, all) }));
}
