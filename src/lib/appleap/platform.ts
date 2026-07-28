export type Platform = "ios" | "android" | "desktop";

export function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return "android";
  // iPadOS reports as "MacIntel" but is the only Mac with a multi-touch screen.
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iphone|ipad|ipod/i.test(ua) || iPadOs) return "ios";
  return "desktop";
}

export function isInAppBrowser(): boolean {
  return /FBAN|FBAV|Instagram|Line\/|Twitter|BytedanceWebview|GSA\//i.test(navigator.userAgent);
}
