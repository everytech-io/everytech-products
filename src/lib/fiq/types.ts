// FranchiseIQ — shared types for the server-side scoring engine and data layer.
// Feature values (pop, dens, inc, tra, poi, comp) and format weights are the
// proprietary inputs; they live only on the server and never travel to the client.

export type MarketCode = "ph" | "my";

export interface Market {
  code: MarketCode;
  name: string;
}

/** Public geography — safe to serve to the client (dropdown + map markers). */
export interface Location {
  code: string; // PSGC (PH) / DOSM (MY) join key
  market: MarketCode;
  city: string; // "" when the market has no city grouping (MY)
  name: string;
  lat: number;
  lng: number;
}

/** SENSITIVE — server-only. The raw feature vector behind a location. */
export interface Features {
  code: string;
  pop: number;
  dens: number;
  inc: number;
  tra: number;
  poi: Record<string, number>;
  comp: Record<string, number>;
}

/** SENSITIVE weights — server-only. `weights`/`incomeFloor`/`anchorWeights` are IP. */
export interface Format {
  id: string;
  market: MarketCode;
  name: string;
  color: string;
  compKey: string;
  weights: { demand: number; income: number; traffic: number; gap: number };
  incomeFloor: number;
  anchorWeights: Record<string, number>;
}

/** Public projection of a format (no weights). */
export interface FormatPublic {
  id: string;
  name: string;
  color: string;
}

export type PillarKey = "demand" | "income" | "traffic" | "gap";

export interface Pillar {
  key: PillarKey;
  label: string;
  value: number; // 0..1
  weight: number; // 0..1
  why: string; // banded, server-composed explanation
}

export interface ScoreResult {
  code: string;
  total: number; // 0..100, rounded
  verdict: string;
  ok: boolean;
  pillars: Pillar[];
}

export interface RankEntry {
  format: string; // format id
  name: string;
  total: number;
}
