"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as LT from "leaflet";
import "leaflet/dist/leaflet.css";
import "./fiq-app.css";
import { EDITIONS, editionOf } from "@/lib/franchiseiq-editions";
import type { MarketCode } from "@/lib/fiq/types";
import { FORMAT_ICONS } from "./icons";

// ── API DTOs (outputs only — no features, no weights) ────────────────────────
type LocationDTO = { code: string; city: string; name: string; lat: number; lng: number };
type FormatDTO = { id: string; name: string; color: string };
type PillarDTO = { key: string; label: string; value: number; weight: number; why: string };
type ScoreDTO = { code: string; total: number; verdict: string; ok: boolean; pillars: PillarDTO[] };
type RankDTO = { format: string; name: string; total: number };

const FOOTNOTES: Record<MarketCode, string> = {
  ph:
    "Pilot dataset: 25 sites across Metro Manila (Quezon City, Makati, Taguig), Rizal, and " +
    "Calabarzon (Cavite, Laguna) — values approximated from public sources for demonstration. " +
    "Production pipeline replaces this with PSA 2024 POPCEN + 2020 CPH (OpenSTAT API), PSA " +
    "small-area poverty estimates, DPWH AADT (data.gov.ph), and OSM Overpass POIs, keyed on PSGC codes.",
  my:
    "Pilot dataset: 12 KL zones, values approximated from public sources for demonstration. " +
    "Production pipeline replaces this with DOSM 2020 Census (MyCensus / OpenDOSM), DOSM " +
    "household income & poverty estimates, JKR / MOT traffic volumes on data.gov.my, and OSM " +
    "Overpass POIs, keyed on DOSM administrative codes.",
};

const KEY_LABEL: Record<MarketCode, string> = { ph: "PSGC", my: "DOSM" };

function markerColor(sc: number | null): string {
  if (sc == null) return "#777";
  return sc >= 75 ? "#2E7D4F" : sc >= 60 ? "#F2A900" : sc >= 45 ? "#C87F2F" : "#B3282D";
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<T>;
}

export function FranchiseIQApp() {
  const [market, setMarket] = useState<MarketCode>("ph");
  const [mode, setMode] = useState<"fwd" | "rev">("fwd");
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [formats, setFormats] = useState<FormatDTO[]>([]);
  const [selCode, setSelCode] = useState("");
  const [selFormat, setSelFormat] = useState("");
  const [result, setResult] = useState<ScoreDTO | null>(null);
  const [ranking, setRanking] = useState<RankDTO[] | null>(null);
  const [scoreAll, setScoreAll] = useState<Record<string, number> | null>(null);
  const [inked, setInked] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [running, setRunning] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LT.Map | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<LT.CircleMarker[]>([]);
  const runRef = useRef<(code?: string) => void>(() => {});

  const ed = useMemo(() => editionOf(market), [market]);
  const selLoc = useMemo(() => locations.find((l) => l.code === selCode), [locations, selCode]);
  const selFmt = useMemo(() => formats.find((f) => f.id === selFormat), [formats, selFormat]);

  // ── Init Leaflet map once ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !mapEl.current || mapRef.current) return;
      const map = leaflet
        .map(mapEl.current, { scrollWheelZoom: true })
        .setView(EDITIONS[0].center, EDITIONS[0].zoom);
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 18,
        })
        .addTo(map);
      LRef.current = leaflet;
      mapRef.current = map;
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 0);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Fetch locations + formats on market change ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setResult(null);
    setRanking(null);
    setScoreAll(null);
    Promise.all([
      fetch(`/api/fiq/locations?market=${market}`).then((r) =>
        r.ok ? (r.json() as Promise<LocationDTO[]>) : Promise.reject(new Error("locations")),
      ),
      fetch(`/api/fiq/formats?market=${market}`).then((r) =>
        r.ok ? (r.json() as Promise<FormatDTO[]>) : Promise.reject(new Error("formats")),
      ),
    ])
      .then(([locs, fmts]) => {
        if (cancelled) return;
        setLocations(locs);
        setFormats(fmts);
        setSelCode(locs[0]?.code ?? "");
        setSelFormat(
          fmts.some((f) => f.id === ed.defaultFormat) ? ed.defaultFormat : fmts[0]?.id ?? "",
        );
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [market, ed.defaultFormat]);

  // ── Recenter map on market change ──────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) mapRef.current.setView(ed.center, ed.zoom);
  }, [ed, mapReady]);

  // ── Draw / recolor markers ─────────────────────────────────────────────────
  const drawMarkers = useCallback(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    locations.forEach((loc) => {
      const sc = scoreAll ? scoreAll[loc.code] ?? null : null;
      const col = markerColor(sc);
      const m = L.circleMarker([loc.lat, loc.lng], {
        radius: sc == null ? 7 : 6 + sc / 9,
        color: "#101820",
        weight: 1.5,
        fillColor: col,
        fillOpacity: 0.85,
      })
        .addTo(map)
        .bindTooltip(`<b>${loc.name}</b>${sc != null ? " · " + sc : ""}`, { direction: "top" });
      m.on("click", () => {
        setSelCode(loc.code);
        runRef.current(loc.code);
      });
      markersRef.current.push(m);
    });
  }, [locations, scoreAll]);

  useEffect(() => {
    drawMarkers();
  }, [drawMarkers, mapReady]);

  // ── Run assessment (forward score or reverse rank) ─────────────────────────
  const run = useCallback(
    async (codeArg?: string) => {
      const code = codeArg ?? selCode;
      if (!code) return;
      const loc = locations.find((l) => l.code === code);
      if (loc && mapRef.current) mapRef.current.setView([loc.lat, loc.lng], 13, { animate: true });
      setRunning(true);
      try {
        if (mode === "fwd") {
          if (!selFormat) return;
          const [sc, all] = await Promise.all([
            postJSON<ScoreDTO>("/api/fiq/score", { market, code, format: selFormat }),
            postJSON<{ code: string; total: number }[]>("/api/fiq/score-all", {
              market,
              format: selFormat,
            }),
          ]);
          const map: Record<string, number> = {};
          all.forEach((x) => (map[x.code] = x.total));
          setRanking(null);
          setScoreAll(map);
          setResult(sc);
        } else {
          const ranked = await postJSON<RankDTO[]>("/api/fiq/rank", { market, code });
          setResult(null);
          setScoreAll(null);
          setRanking(ranked);
        }
        setStatus("ready");
      } catch {
        setStatus("error");
      } finally {
        setRunning(false);
      }
    },
    [selCode, selFormat, mode, market, locations],
  );
  runRef.current = run;

  // ── Ink the stamp + fill bars shortly after a result lands ─────────────────
  useEffect(() => {
    if (!result) {
      setInked(false);
      return;
    }
    setInked(false);
    const t = setTimeout(() => setInked(true), 60);
    return () => clearTimeout(t);
  }, [result]);

  // ── Location <select> options (grouped by city when present) ───────────────
  const options = useMemo(() => {
    const hasCity = locations.some((l) => l.city);
    if (!hasCity) {
      return locations.map((l) => (
        <option key={l.code} value={l.code}>
          {l.name}
        </option>
      ));
    }
    const groups: Record<string, LocationDTO[]> = {};
    locations.forEach((l) => {
      (groups[l.city] = groups[l.city] || []).push(l);
    });
    return Object.keys(groups).map((city) => (
      <optgroup key={city} label={city}>
        {groups[city].map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
      </optgroup>
    ));
  }, [locations]);

  const unit = ed.unit;
  const marketLabel = market.toUpperCase();

  return (
    <div>
      <div className="edtabs" role="tablist" aria-label="FranchiseIQ market">
        {EDITIONS.map((e) => (
          <button
            key={e.code}
            role="tab"
            aria-selected={e.code === market}
            className={"edtab" + (e.code === market ? " edtab--active" : "")}
            onClick={() => setMarket(e.code)}
          >
            <span aria-hidden="true">{e.flag}</span> {e.country}
            <span className="edtab__city mono">{e.city}</span>
          </button>
        ))}
      </div>

      <section className="appframe" aria-label={`FranchiseIQ ${ed.country} live application`}>
        <div className="appframe__bar">
          <span className="appframe__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="appframe__label mono">
            franchiseiq · {marketLabel} · pilot: {ed.city}
          </span>
        </div>

        <div className="fiq">
          <div className="fiq-head">
            <h2>
              Franchise<span>IQ</span> {marketLabel}
            </h2>
            <div className="tag">{ed.tag}</div>
            <div className="fiq-badge">PILOT</div>
          </div>

          <div className="wrap">
            <aside className="panel-left">
              <div className="block">
                <div className="eyebrow">01 · Mode</div>
                <div className="modes">
                  <button
                    className={"mode" + (mode === "fwd" ? " active" : "")}
                    onClick={() => setMode("fwd")}
                  >
                    Score a franchise
                  </button>
                  <button
                    className={"mode" + (mode === "rev" ? " active" : "")}
                    onClick={() => setMode("rev")}
                  >
                    What fits here?
                  </button>
                </div>
              </div>

              <div className="block">
                <div className="eyebrow">02 · Location ({unit})</div>
                <select
                  value={selCode}
                  onChange={(e) => setSelCode(e.target.value)}
                  aria-label={`Select ${unit}`}
                >
                  {options}
                </select>
              </div>

              {mode === "fwd" && (
                <div className="block">
                  <div className="eyebrow">03 · Franchise type</div>
                  <div className="franchise-list">
                    {formats.map((f) => (
                      <button
                        key={f.id}
                        className={"fr-item" + (selFormat === f.id ? " active" : "")}
                        onClick={() => setSelFormat(f.id)}
                      >
                        <span className="fr-ico" style={{ color: f.color }}>
                          {FORMAT_ICONS[f.id]}
                        </span>
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="go"
                onClick={() => run()}
                disabled={running || status !== "ready" || !selCode}
              >
                {running ? "Running…" : "Run assessment"}
              </button>

              {status === "error" && (
                <div className="status err">Service unavailable — please try again.</div>
              )}

              <div className="footnote">{FOOTNOTES[market]}</div>
            </aside>

            <div className="fiq-map" ref={mapEl} role="application" aria-label={`Map of pilot ${unit}s`} />

            <aside className="panel-right">
              {result ? (
                <>
                  <div className="eyebrow">Assessment · {selLoc?.name}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{selFmt?.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>
                    {KEY_LABEL[market]} {result.code}
                  </div>
                  <div className="stamp-wrap">
                    <div className={`stamp ${inked ? "inked" : "pre"}${result.ok ? " ok" : ""}`}>
                      <div className="num">{result.total}</div>
                      <div className="lbl">/ 100 · FranchiseIQ</div>
                      <div className="verdict">{result.verdict}</div>
                    </div>
                  </div>
                  {result.pillars.map((p) => (
                    <div className="pillar" key={p.key}>
                      <div className="row">
                        <span>
                          {p.label}{" "}
                          <span className="mono" style={{ color: "#999", fontWeight: 400 }}>
                            w={Math.round(p.weight * 100)}%
                          </span>
                        </span>
                        <span className="val">{Math.round(p.value * 100)}</span>
                      </div>
                      <div className="bar">
                        <i
                          className={p.key === "traffic" ? "amber" : ""}
                          style={{ width: inked ? `${Math.round(p.value * 100)}%` : 0 }}
                        />
                      </div>
                      <div className="why">{p.why}</div>
                    </div>
                  ))}
                  <div className="footnote">
                    Map dots now show this franchise&apos;s score across all pilot {unit}s. Bigger +
                    greener = stronger site.
                  </div>
                </>
              ) : ranking ? (
                <>
                  <div className="eyebrow">Best fit · {selLoc?.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: "#888", marginBottom: 12 }}>
                    {KEY_LABEL[market]} {selCode}
                  </div>
                  <div className="ranked">
                    {ranking.map((x, i) => (
                      <div className={"rank-card" + (i === 0 ? " top" : "")} key={x.format}>
                        <span className="rk">{String(i + 1).padStart(2, "0")}</span>
                        <span
                          className="fr-ico sm"
                          style={{ color: formats.find((f) => f.id === x.format)?.color }}
                        >
                          {FORMAT_ICONS[x.format]}
                        </span>
                        <span className="nm">{x.name}</span>
                        <span className="sc">{x.total}</span>
                      </div>
                    ))}
                  </div>
                  <div className="footnote">
                    Ranking recomputes the full weight matrix per format against this {unit}&apos;s
                    features. Switch to &quot;Score a franchise&quot; for the pillar breakdown.
                  </div>
                </>
              ) : (
                <div className="empty">
                  Select a {unit} and franchise type, then run the assessment.
                  <br />
                  <br />
                  The score stamp lands here.
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <div className="prov">
        <p className="prov__head mono">
          provenance · {ed.country} production pipeline ({locations.length} pilot {unit}s, keyed on{" "}
          {ed.joinKey})
        </p>
        <dl className="ledger" style={{ maxWidth: "none" }}>
          {ed.sources.map(([k, v]) => (
            <div className="ledger__row" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
