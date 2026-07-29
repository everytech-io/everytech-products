import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { getProduct } from "@/lib/products";
import { SITE_NAME } from "@/lib/site";
import { productGraph } from "@/lib/structured-data";
import { AppLeapLauncher } from "./appleap-launcher";

const product = getProduct("appleap")!;

const FEATURES = [
  "Tap a tile to open Gmail, WhatsApp, Uber, Spotify, and more, right on your phone",
  "iOS universal links and custom schemes, Android intent:// URLs, with store fallback",
  "Scan a QR code on desktop to pick up the launcher on your phone",
  "Also runs as an MCP server, so an AI agent can fetch a deep link directly",
];

const TITLE = product.seoTitle!;
const DESCRIPTION = product.seoDescription!;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: product.href },
  keywords: product.keywords,
  openGraph: {
    title: `${TITLE} — ${SITE_NAME}`,
    description: DESCRIPTION,
    url: product.href,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} — ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

export default function AppLeapPage() {
  return (
    <article className="post">
      <JsonLd data={productGraph(product, FEATURES)} />
      <header className="post-header">
        <Link className="post-back" href="/#store">
          &larr; All products
        </Link>
        <p className="kicker">{product.tagline}</p>
        <h1 className="post-title">AppLeap</h1>
        <p className="post-dek">
          A mobile-only launcher that deep-links straight into the app you want &mdash; no search,
          no App Store detour if it&rsquo;s already installed. On a phone, tap a tile and it opens
          natively. On desktop, scan the QR code below to pick it up on your phone.
        </p>
        <p className="post-byline mono">
          iOS + Android &middot; store fallback built in &middot; also an MCP server
        </p>
      </header>

      <AppLeapLauncher />

      <div className="prose">
        <blockquote>
          Every deep link degrades gracefully: a wrong scheme just falls back to the app&rsquo;s
          store listing instead of doing nothing, so a stale entry fails soft, not broken.
        </blockquote>

        <h2>How it works</h2>
        <ul className="pillars">
          <li>
            <b>iOS</b>
            <span>
              Prefers a universal link when the app publishes one; otherwise a custom URL scheme,
              with a timed fallback to the App Store if nothing opens.
            </span>
          </li>
          <li>
            <b>Android</b>
            <span>
              Builds an <code>intent://</code> URL from the app&rsquo;s scheme and package name;
              Chrome falls back to the Play Store on its own if the app isn&rsquo;t installed.
            </span>
          </li>
          <li>
            <b>Desktop</b>
            <span>
              The launcher only makes sense on a phone, so desktop visitors get a QR code instead
              of a native app grid.
            </span>
          </li>
          <li>
            <b>Agents</b>
            <span>
              The same catalog is exposed over MCP at{" "}
              <code>https://appleap-mcp.everytech.workers.dev/mcp</code>, so an AI agent can call{" "}
              <code>list_apps</code> and <code>get_deeplink</code> directly, no page required.
            </span>
          </li>
        </ul>

        <h2>A note on accuracy</h2>
        <p>
          Schemes, package names, and store IDs are best-effort seed data, not guaranteed current —
          apps change their URL schemes over time without warning. A wrong entry fails soft: iOS
          falls back to the App Store, Android falls back to the Play Store, so a stale scheme
          costs an extra tap, not a broken page.
        </p>
      </div>
    </article>
  );
}
