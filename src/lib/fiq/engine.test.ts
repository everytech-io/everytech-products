/*
 * FranchiseIQ parity test — the acceptance gate.
 *
 * Loads the extracted seed fixture and asserts that the ported engine
 * (engine.ts) produces EXACTLY the same pillar values and totals as the
 * original client formulas (reproduced verbatim below as the ORACLE) for every
 * location × format in both markets (PH + MY).
 *
 * Run: `npm test`  (tsx src/lib/fiq/engine.test.ts)
 *
 * Falls back to the committed dummy example if the real local seed is absent, so
 * it still runs in a fresh clone — but the real gate runs against fiq-data.local.json.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { pillarScores, scoreTotal } from "./engine";
import type { Features, Format, MarketCode } from "./types";

// ── Load fixture ─────────────────────────────────────────────────────────────
interface RawFormat {
  id: string;
  market: MarketCode;
  name: string;
  color: string;
  comp_key: string;
  weights: Format["weights"];
  income_floor: number;
  anchor_weights: Record<string, number>;
}
interface Fixture {
  locations: { code: string; market: MarketCode }[];
  features: Features[];
  formats: RawFormat[];
}

const dir = path.join(process.cwd(), "scripts", "seed");
let source = "fiq-data.local.json";
let raw: string;
try {
  raw = readFileSync(path.join(dir, source), "utf8");
} catch {
  source = "fiq-data.example.json";
  raw = readFileSync(path.join(dir, source), "utf8");
}
const fx = JSON.parse(raw) as Fixture;

function normalize(r: RawFormat): Format {
  return {
    id: r.id,
    market: r.market,
    name: r.name,
    color: r.color,
    compKey: r.comp_key,
    weights: r.weights,
    incomeFloor: r.income_floor,
    anchorWeights: r.anchor_weights,
  };
}

// ── ORACLE: original client formulas, copied verbatim from the HTML apps ──────
// (public/apps/franchiseiq*.html — `pillarScores` and `score`.)
function oracle(BGYS: Features[], p: RawFormat, b: Features) {
  const maxPop = Math.max(...BGYS.map((x) => x.pop));
  const maxDens = Math.max(...BGYS.map((x) => x.dens));

  const demand = 0.6 * (b.pop / maxPop) + 0.4 * (b.dens / maxDens);

  let income = b.inc;
  if (p.income_floor && b.inc < p.income_floor) income *= 0.55;

  const aw = p.anchor_weights;
  const gravity = Object.keys(aw).reduce((s, k) => s + aw[k] * (b.poi[k] || 0), 0);
  const maxGravity = Math.max(
    ...BGYS.map((x) => Object.keys(aw).reduce((s, k) => s + aw[k] * (x.poi[k] || 0), 0)),
  );
  const traffic = 0.55 * b.tra + 0.45 * (gravity / maxGravity);

  const comp = b.comp[p.comp_key] || 0;
  const perComp = b.pop / (comp + 1);
  const maxPerComp = Math.max(...BGYS.map((x) => x.pop / ((x.comp[p.comp_key] || 0) + 1)));
  const gap = perComp / maxPerComp;

  const s = { demand, income, traffic, gap };
  const total = Math.round(
    100 * (s.demand * p.weights.demand + s.income * p.weights.income + s.traffic * p.weights.traffic + s.gap * p.weights.gap),
  );
  return { s, total };
}

// ── Compare ──────────────────────────────────────────────────────────────────
const markets: MarketCode[] = ["ph", "my"];
let checks = 0;

for (const market of markets) {
  const codes = new Set(fx.locations.filter((l) => l.market === market).map((l) => l.code));
  const feats = fx.features.filter((f) => codes.has(f.code));
  const fmts = fx.formats.filter((f) => f.market === market);
  assert.ok(feats.length > 0, `no features for market ${market}`);
  assert.ok(fmts.length > 0, `no formats for market ${market}`);

  for (const rf of fmts) {
    const f = normalize(rf);
    for (const b of feats) {
      const want = oracle(feats, rf, b);
      const gotPillars = pillarScores(b, f, feats);
      const gotTotal = scoreTotal(b, f, feats);

      assert.strictEqual(gotPillars.demand, want.s.demand, `${market}/${rf.id}/${b.code} demand`);
      assert.strictEqual(gotPillars.income, want.s.income, `${market}/${rf.id}/${b.code} income`);
      assert.strictEqual(gotPillars.traffic, want.s.traffic, `${market}/${rf.id}/${b.code} traffic`);
      assert.strictEqual(gotPillars.gap, want.s.gap, `${market}/${rf.id}/${b.code} gap`);
      assert.strictEqual(gotTotal, want.total, `${market}/${rf.id}/${b.code} total`);
      checks += 5;
    }
  }
}

console.log(
  `PASS — engine parity: ${checks} assertions across ${markets.length} markets (source: ${source})`,
);
