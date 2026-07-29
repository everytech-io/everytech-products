/**
 * AppLeap catalog: deep-link data for opening native mobile apps from the
 * browser. iOS gets a universal link or custom scheme with an App Store
 * fallback; Android gets an intent:// built client-side from scheme/package,
 * falling back to the Play Store. `kind="action"` entries are OS-level URLs
 * (tel:, sms:, mailto:) that need no fallback.
 *
 * Schemes, package names, and store IDs are best-effort seed data — a wrong
 * iOS scheme degrades into the App Store fallback and a wrong Android package
 * falls back to the Play Store, so mistakes fail soft.
 */

import { EXTENDED_APPS, EXTENDED_CATEGORIES } from "./apps-extended";

export type MobileAppKind = "app" | "action";

export type MobileApp = {
  slug: string;
  name: string;
  categoryId: string;
  kind?: MobileAppKind;
  icon: string;
  accent: string;
  tagline: string;

  // kind="app" launch config
  universalLink?: string;
  iosScheme?: string;
  androidScheme?: string;
  androidPackage?: string;
  androidIntentPath?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;

  // kind="action" launch config
  actionUrl?: string;
};

export type MobileAppCategory = { id: string; name: string };

const BASE_CATEGORIES: MobileAppCategory[] = [
  { id: "essentials", name: "Essentials" },
  { id: "ai", name: "AI & Search" },
  { id: "transport", name: "Transport" },
  { id: "social", name: "Social" },
  { id: "media", name: "Media" },
  { id: "health", name: "Health" },
];

const BASE_APPS: MobileApp[] = [
  // --- Essentials (OS actions + mail) ---
  {
    slug: "phone",
    name: "Phone",
    categoryId: "essentials",
    kind: "action",
    icon: "📞",
    accent: "from-emerald-500 to-green-600",
    tagline: "Make a call",
    actionUrl: "tel:",
  },
  {
    slug: "messages",
    name: "Messages",
    categoryId: "essentials",
    kind: "action",
    icon: "💬",
    accent: "from-green-400 to-emerald-500",
    tagline: "Send an SMS",
    actionUrl: "sms:",
  },
  {
    slug: "mail",
    name: "Mail",
    categoryId: "essentials",
    kind: "action",
    icon: "✉️",
    accent: "from-sky-500 to-blue-600",
    tagline: "Compose an email",
    actionUrl: "mailto:",
  },
  {
    slug: "gmail",
    name: "Gmail",
    categoryId: "essentials",
    icon: "📧",
    accent: "from-red-500 to-rose-600",
    tagline: "Open your inbox",
    iosScheme: "googlegmail://",
    androidScheme: "googlegmail",
    androidPackage: "com.google.android.gm",
    appStoreUrl: "https://apps.apple.com/app/id422689480",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.google.android.gm",
  },
  // --- AI & Search ---
  {
    slug: "claude",
    name: "Claude",
    categoryId: "ai",
    icon: "✳️",
    accent: "from-orange-400 to-amber-600",
    tagline: "Chat with Claude",
    iosScheme: "claude://",
    androidScheme: "claude",
    androidPackage: "com.anthropic.claude",
    appStoreUrl: "https://apps.apple.com/app/id6473753684",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.anthropic.claude",
  },
  {
    slug: "gemini",
    name: "Gemini",
    categoryId: "ai",
    icon: "✨",
    accent: "from-blue-500 to-violet-600",
    tagline: "Google's AI assistant",
    androidScheme: "googleapp",
    androidPackage: "com.google.android.apps.bard",
    appStoreUrl: "https://apps.apple.com/app/id6477489729",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.google.android.apps.bard",
  },
  {
    slug: "google",
    name: "Google",
    categoryId: "ai",
    icon: "🔍",
    accent: "from-sky-400 to-blue-600",
    tagline: "Search the web",
    iosScheme: "google://",
    androidScheme: "google",
    androidPackage: "com.google.android.googlequicksearchbox",
    appStoreUrl: "https://apps.apple.com/app/id284815942",
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.google.android.googlequicksearchbox",
  },
  // --- Transport ---
  {
    slug: "uber",
    name: "Uber",
    categoryId: "transport",
    icon: "🚗",
    accent: "from-zinc-700 to-black",
    tagline: "Request a ride",
    universalLink: "https://m.uber.com/looking",
    iosScheme: "uber://",
    androidScheme: "uber",
    androidPackage: "com.ubercab",
    appStoreUrl: "https://apps.apple.com/app/id368677368",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.ubercab",
  },
  {
    slug: "grab",
    name: "Grab",
    categoryId: "transport",
    icon: "🟢",
    accent: "from-green-500 to-emerald-600",
    tagline: "Rides, food, and more",
    iosScheme: "grab://open",
    androidScheme: "grab",
    androidPackage: "com.grabtaxi.passenger",
    appStoreUrl: "https://apps.apple.com/app/id647268330",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.grabtaxi.passenger",
  },
  {
    slug: "google-maps",
    name: "Maps",
    categoryId: "transport",
    icon: "🗺️",
    accent: "from-teal-400 to-green-600",
    tagline: "Navigate anywhere",
    iosScheme: "comgooglemaps://",
    androidScheme: "comgooglemaps",
    androidPackage: "com.google.android.apps.maps",
    appStoreUrl: "https://apps.apple.com/app/id585027354",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.google.android.apps.maps",
  },
  // --- Social ---
  {
    slug: "whatsapp",
    name: "WhatsApp",
    categoryId: "social",
    icon: "🟩",
    accent: "from-green-400 to-teal-500",
    tagline: "Message anyone",
    universalLink: "https://wa.me/",
    iosScheme: "whatsapp://",
    androidScheme: "whatsapp",
    androidPackage: "com.whatsapp",
    appStoreUrl: "https://apps.apple.com/app/id310633997",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.whatsapp",
  },
  {
    slug: "telegram",
    name: "Telegram",
    categoryId: "social",
    icon: "📨",
    accent: "from-sky-400 to-cyan-600",
    tagline: "Fast, secure chats",
    universalLink: "https://t.me/",
    iosScheme: "tg://",
    androidScheme: "tg",
    androidPackage: "org.telegram.messenger",
    appStoreUrl: "https://apps.apple.com/app/id686449807",
    playStoreUrl: "https://play.google.com/store/apps/details?id=org.telegram.messenger",
  },
  {
    slug: "instagram",
    name: "Instagram",
    categoryId: "social",
    icon: "📸",
    accent: "from-fuchsia-500 to-amber-500",
    tagline: "Share moments",
    iosScheme: "instagram://app",
    androidScheme: "instagram",
    androidIntentPath: "app",
    androidPackage: "com.instagram.android",
    appStoreUrl: "https://apps.apple.com/app/id389801252",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.instagram.android",
  },
  {
    slug: "x",
    name: "X",
    categoryId: "social",
    icon: "𝕏",
    accent: "from-zinc-600 to-black",
    tagline: "What's happening",
    iosScheme: "twitter://",
    androidScheme: "twitter",
    androidPackage: "com.twitter.android",
    appStoreUrl: "https://apps.apple.com/app/id333903271",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.twitter.android",
  },
  // --- Media ---
  {
    slug: "spotify",
    name: "Spotify",
    categoryId: "media",
    icon: "🎧",
    accent: "from-green-500 to-lime-600",
    tagline: "Play some music",
    universalLink: "https://open.spotify.com/",
    iosScheme: "spotify://",
    androidScheme: "spotify",
    androidPackage: "com.spotify.music",
    appStoreUrl: "https://apps.apple.com/app/id324684580",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.spotify.music",
  },
  {
    slug: "youtube",
    name: "YouTube",
    categoryId: "media",
    icon: "▶️",
    accent: "from-red-500 to-rose-700",
    tagline: "Watch videos",
    universalLink: "https://www.youtube.com/",
    iosScheme: "youtube://",
    androidScheme: "vnd.youtube",
    androidPackage: "com.google.android.youtube",
    appStoreUrl: "https://apps.apple.com/app/id544007664",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.google.android.youtube",
  },
  // --- Health ---
  {
    slug: "myfitnesspal",
    name: "MyFitnessPal",
    categoryId: "health",
    icon: "🏋️",
    accent: "from-blue-500 to-indigo-600",
    tagline: "Track your nutrition",
    iosScheme: "mfp://",
    androidScheme: "mfp",
    androidPackage: "com.myfitnesspal.android",
    appStoreUrl: "https://apps.apple.com/app/id341232718",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.myfitnesspal.android",
  },
];

export const MOBILE_APP_CATEGORIES: MobileAppCategory[] = [
  ...BASE_CATEGORIES,
  ...EXTENDED_CATEGORIES,
];

export const MOBILE_APPS: MobileApp[] = [...BASE_APPS, ...EXTENDED_APPS];

export function getMobileApp(slug: string): MobileApp | undefined {
  return MOBILE_APPS.find((a) => a.slug === slug);
}

export function allCategories(): MobileAppCategory[] {
  return MOBILE_APP_CATEGORIES;
}

export function allApps(): MobileApp[] {
  return MOBILE_APPS;
}
