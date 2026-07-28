"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { Search, Smartphone, X } from "lucide-react";
import { MOBILE_APPS, MOBILE_APP_CATEGORIES, type MobileApp } from "@/lib/appleap/apps";
import { detectPlatform, isInAppBrowser, type Platform } from "@/lib/appleap/platform";
import { launchApp } from "@/lib/appleap/deeplink";
import "./appleap-launcher.css";

function DesktopGate() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);

  return (
    <div className="leap-gate">
      <div className="leap-gate__card">
        <div className="leap-gate__icon">
          <Smartphone size={26} />
        </div>
        <h3 className="leap-gate__title">This page is built for phones</h3>
        <p className="leap-gate__body">
          AppLeap opens native mobile apps, so it only works on a phone. Scan the code with your
          camera to open it there.
        </p>
        {url ? (
          <div className="leap-gate__qr">
            <QRCode value={url} size={160} />
          </div>
        ) : null}
        {url ? <p className="leap-gate__url">{url}</p> : null}
      </div>
    </div>
  );
}

function AppTile({ app, onLaunch }: { app: MobileApp; onLaunch: (app: MobileApp) => void }) {
  return (
    <button type="button" className="leap-tile" onClick={() => onLaunch(app)}>
      <span className={`leap-tile__icon bg-gradient-to-br ${app.accent}`}>{app.icon}</span>
      <span className="leap-tile__name">{app.name}</span>
    </button>
  );
}

export function AppLeapLauncher() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [inAppBrowser, setInAppBrowser] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setPlatform(detectPlatform());
    setInAppBrowser(isInAppBrowser());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOBILE_APPS.filter((a) => {
      const matchesCategory = category === "all" || a.categoryId === category;
      const matchesQuery = !q || a.name.toLowerCase().includes(q) || a.tagline.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  // Server render + first client paint both show nothing, so there's no
  // hydration mismatch from branching on a browser-only platform read.
  if (platform === null) return <div className="leap" style={{ minHeight: 420 }} />;

  if (platform === "desktop") {
    return (
      <div className="leap">
        <DesktopGate />
      </div>
    );
  }

  const tabs = [{ id: "all", name: "All" }, ...MOBILE_APP_CATEGORIES];

  return (
    <div className="leap">
      <header className="leap-header">
        <h3 className="leap-header__title">App Launcher</h3>
        <div className="store-search">
          <Search className="store-search__icon" size={18} aria-hidden="true" />
          <input
            type="search"
            className="store-search__input"
            placeholder="Search apps…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search apps"
          />
          {query ? (
            <button
              type="button"
              className="store-search__clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              &times;
            </button>
          ) : null}
        </div>
        <div className="leap-tabs chips" role="group" aria-label="Filter by category">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={"chip" + (category === t.id ? " chip--active" : "")}
              onClick={() => setCategory(t.id)}
              aria-pressed={category === t.id}
            >
              {t.name}
            </button>
          ))}
        </div>
      </header>

      {inAppBrowser && !bannerDismissed ? (
        <div className="leap-banner">
          <span>
            You&rsquo;re in an in-app browser — app links may not work here. Open this page in
            Safari or Chrome for the best results.
          </span>
          <button type="button" onClick={() => setBannerDismissed(true)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="leap-grid">
          {filtered.map((a) => (
            <AppTile key={a.slug} app={a} onLaunch={(app) => launchApp(app, platform)} />
          ))}
        </div>
      ) : (
        <div className="leap-empty">No apps match &ldquo;{query}&rdquo;.</div>
      )}
    </div>
  );
}
