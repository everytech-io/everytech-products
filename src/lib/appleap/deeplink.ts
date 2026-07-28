import type { MobileApp } from "./apps";
import type { Platform } from "./platform";

const FALLBACK_DELAY_MS = 1500;

function buildAndroidIntentUrl(app: MobileApp): string {
  const path = app.androidIntentPath ?? "open";
  const parts = [`intent://${path}#Intent`, `scheme=${app.androidScheme}`];
  if (app.androidPackage) parts.push(`package=${app.androidPackage}`);
  if (app.playStoreUrl) parts.push(`S.browser_fallback_url=${encodeURIComponent(app.playStoreUrl)}`);
  return `${parts.join(";")};end`;
}

/**
 * Open a native app from the browser. Must be called from a user gesture.
 *
 * - actions (tel:/sms:/mailto:) fire directly — the OS always handles them
 * - Android builds an intent:// URL; Chrome falls back to the Play Store natively
 * - iOS prefers a universal link, else custom scheme + timed App Store fallback.
 *   The timer is cancelled on visibilitychange/pagehide/blur: blur fires when the
 *   "Open in app?" sheet appears, so a hesitant user is never yanked to the store.
 */
export function launchApp(app: MobileApp, platform: Platform): void {
  if (app.kind === "action" && app.actionUrl) {
    window.location.href = app.actionUrl;
    return;
  }

  if (platform === "android" && app.androidScheme) {
    window.location.href = buildAndroidIntentUrl(app);
    return;
  }

  const storeUrl = (platform === "android" ? app.playStoreUrl : app.appStoreUrl) ?? null;
  const target = app.universalLink ?? app.iosScheme ?? storeUrl;
  if (!target) return;

  // Universal links and direct store links navigate the page themselves.
  if (target.startsWith("https:")) {
    window.location.href = target;
    return;
  }

  let done = false;
  const cleanup = () => {
    done = true;
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onHide);
    window.removeEventListener("blur", onHide);
  };
  const onHide = () => cleanup();

  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onHide);
  window.addEventListener("blur", onHide);

  const timer = setTimeout(() => {
    if (done || document.hidden) return;
    cleanup();
    if (storeUrl) window.location.href = storeUrl;
  }, FALLBACK_DELAY_MS);

  window.location.href = target;
}

/**
 * Pure variant for non-browser contexts (e.g. the MCP server): resolves the
 * best launch URL for a platform without touching window/document. Android
 * intent URLs and iOS scheme+fallback timing only make sense inside a real
 * browser gesture, so this returns the URL an agent or a browser should use.
 */
export function resolveDeeplink(
  app: MobileApp,
  platform: Exclude<Platform, "desktop">
): { url: string; kind: "action" | "intent" | "universal" | "scheme" | "store" } {
  if (app.kind === "action" && app.actionUrl) {
    return { url: app.actionUrl, kind: "action" };
  }
  if (platform === "android" && app.androidScheme) {
    return { url: buildAndroidIntentUrl(app), kind: "intent" };
  }
  if (app.universalLink) return { url: app.universalLink, kind: "universal" };
  const scheme = platform === "ios" ? app.iosScheme : undefined;
  if (scheme) return { url: scheme, kind: "scheme" };
  const storeUrl = platform === "android" ? app.playStoreUrl : app.appStoreUrl;
  if (storeUrl) return { url: storeUrl, kind: "store" };
  throw new Error(`No launch route available for ${app.slug} on ${platform}`);
}
