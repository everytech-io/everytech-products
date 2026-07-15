// FranchiseIQ — server-only data access.
//
// Reads from Supabase Postgres using the SERVICE-ROLE key (RLS denies anon/public,
// so only this server-side client can see features/weights). When Supabase env is
// absent — local dev, `next build` without a DB, CI, the parity test — it falls
// back to a local fixture JSON so nothing here requires a live database to run.
//
// Never import this from a client component. Feature rows and format weights must
// never reach the browser.

import { readFileSync } from "node:fs";
import path from "node:path";
import type {
  Features,
  Format,
  FormatPublic,
  Location,
  Market,
  MarketCode,
} from "./types";

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

interface Dataset {
  markets: Market[];
  locations: Location[];
  features: Features[];
  formats: Format[];
}

function normalizeFormat(r: RawFormat): Format {
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

// ── Sources ──────────────────────────────────────────────────────────────────

function hasSupabaseEnv(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function loadFromSupabase(): Promise<Dataset> {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const [markets, locations, features, formats] = await Promise.all([
    supabase.from("fiq_market").select("code,name"),
    supabase.from("fiq_location").select("code,market,city,name,lat,lng"),
    supabase.from("fiq_features").select("code,pop,dens,inc,tra,poi,comp"),
    supabase
      .from("fiq_format")
      .select("id,market,name,color,comp_key,weights,income_floor,anchor_weights"),
  ]);

  for (const r of [markets, locations, features, formats]) {
    if (r.error) throw new Error(`Supabase read failed: ${r.error.message}`);
  }

  return {
    markets: (markets.data ?? []) as Market[],
    locations: (locations.data ?? []) as Location[],
    features: (features.data ?? []) as Features[],
    formats: ((formats.data ?? []) as RawFormat[]).map(normalizeFormat),
  };
}

function loadFromFixture(): Dataset {
  const dir = path.join(process.cwd(), "scripts", "seed");
  let raw: string;
  try {
    raw = readFileSync(path.join(dir, "fiq-data.local.json"), "utf8");
  } catch {
    // No real seed present (fresh clone / CI) — use the committed dummy sample so
    // the build and endpoints still function with an obviously-fake dataset.
    raw = readFileSync(path.join(dir, "fiq-data.example.json"), "utf8");
  }
  const data = JSON.parse(raw) as {
    markets: Market[];
    locations: Location[];
    features: Features[];
    formats: RawFormat[];
  };
  return {
    markets: data.markets,
    locations: data.locations,
    features: data.features,
    formats: data.formats.map(normalizeFormat),
  };
}

// ── Memoized load (short TTL, per §8 of the design) ──────────────────────────

const TTL_MS = 60_000;
let cache: { at: number; data: Promise<Dataset> } | null = null;

function dataset(): Promise<Dataset> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.data;
  const data = hasSupabaseEnv() ? loadFromSupabase() : Promise.resolve(loadFromFixture());
  cache = { at: now, data };
  // On failure, drop the cache so the next call retries.
  data.catch(() => {
    if (cache?.data === data) cache = null;
  });
  return data;
}

/** For tests: which backend is active. */
export function usingSupabase(): boolean {
  return hasSupabaseEnv();
}

// ── Public accessors ─────────────────────────────────────────────────────────

export async function getMarkets(): Promise<Market[]> {
  const d = await dataset();
  return d.markets.map((m) => ({ code: m.code, name: m.name }));
}

export async function getLocations(market: MarketCode): Promise<Location[]> {
  const d = await dataset();
  return d.locations.filter((l) => l.market === market);
}

/** Public projection — no weights. */
export async function getFormatsPublic(market: MarketCode): Promise<FormatPublic[]> {
  const d = await dataset();
  return d.formats
    .filter((f) => f.market === market)
    .map((f) => ({ id: f.id, name: f.name, color: f.color }));
}

// ── Server-only accessors (features + weights) ───────────────────────────────

export async function getFeatures(market: MarketCode): Promise<Features[]> {
  const d = await dataset();
  const codes = new Set(d.locations.filter((l) => l.market === market).map((l) => l.code));
  return d.features.filter((f) => codes.has(f.code));
}

export async function getFormats(market: MarketCode): Promise<Format[]> {
  const d = await dataset();
  return d.formats.filter((f) => f.market === market);
}

export async function getFormat(market: MarketCode, id: string): Promise<Format | null> {
  const formats = await getFormats(market);
  return formats.find((f) => f.id === id) ?? null;
}

export async function getFeature(market: MarketCode, code: string): Promise<Features | null> {
  const features = await getFeatures(market);
  return features.find((f) => f.code === code) ?? null;
}

export function isMarketCode(v: unknown): v is MarketCode {
  return v === "ph" || v === "my";
}
