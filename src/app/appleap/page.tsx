import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { getProduct } from "@/lib/products";
import { SITE_NAME } from "@/lib/site";
import { productGraph } from "@/lib/structured-data";
import { AppLeapWaitlist } from "./appleap-waitlist";

const product = getProduct("appleap")!;

// Fed to `productGraph` as JSON-LD `featureList`, so every line here is a claim a
// crawler reads as fact. Keep them capability statements about the product, not
// invitations to do something on this page — the launcher itself is behind the beta.
const FEATURES = [
  "Carries a full prompt from one AI app into another in a single tap, context intact",
  "Resolves a working deep link into Gmail, WhatsApp, Uber, Spotify, and more, on iOS and Android",
  "Falls back to the App Store or Play Store when an app isn't installed, so a link never dead-ends",
  "Exposes the same catalog over MCP, so an AI agent can resolve a deep link with no browser involved",
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
          People pay for ChatGPT, Claude, and Gemini on the same phone, and none of them can hand
          work to another. AppLeap is the layer in between: one tap carries a whole prompt from one
          app into the next with its context intact, and the same resolver gives an AI agent a
          working link into Gmail, WhatsApp, or Uber instead of a search result.
        </p>
        <p className="post-byline mono">
          iOS + Android &middot; store fallback built in &middot; MCP endpoint for agents
        </p>
      </header>

      <AppLeapWaitlist />

      <div className="prose">
        <blockquote>
          The expensive part of moving between AI apps was never the copying. It&rsquo;s
          re-explaining what you meant, because the context didn&rsquo;t survive the trip.
        </blockquote>

        <h2>What you&rsquo;d use it for</h2>
        <ul className="pillars">
          <li>
            <b>Handing a prompt across</b>
            <span>
              Draft in the app that writes best, then send the whole thing &mdash; not a truncated
              paste &mdash; to the one that renders, codes, or searches best. The receiving app
              opens with it already loaded.
            </span>
          </li>
          <li>
            <b>Agent handoffs</b>
            <span>
              An agent that can only return text dead-ends at the phone. Over MCP it can call{" "}
              <code>list_apps</code> and <code>get_deeplink</code> and hand a person straight into
              the right app, no page and no browser in the middle.
            </span>
          </li>
          <li>
            <b>Support and onboarding links</b>
            <span>
              A link in a help flow that lands inside the app on the right screen, and still lands
              somewhere sensible for the customer who hasn&rsquo;t installed it yet.
            </span>
          </li>
          <li>
            <b>Beta access</b>
            <span>
              We onboard in small batches so early support stays personal. Invites include the MCP
              endpoint details for anyone wiring up an agent.
            </span>
          </li>
        </ul>

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
            <b>Failing soft</b>
            <span>
              Every deep link degrades gracefully: a wrong scheme falls back to the app&rsquo;s
              store listing instead of doing nothing, so a stale entry costs a tap, not a dead end.
            </span>
          </li>
        </ul>

        <h2>A note on accuracy</h2>
        <p>
          Schemes, package names, and store IDs are best-effort seed data, not guaranteed current
          &mdash; apps change their URL schemes over time without warning. A wrong entry fails soft:
          iOS falls back to the App Store, Android falls back to the Play Store, so a stale scheme
          costs an extra tap, not a broken page. Keeping the beta small for now is partly about
          catching those stale entries before we open the catalog up wider.
        </p>
      </div>
    </article>
  );
}
