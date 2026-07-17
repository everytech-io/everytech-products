/**
 * Server-rendered JSON-LD. No client JS: the graph ships inside the HTML so
 * crawlers get it on the first byte.
 *
 * The payload is our own data (never user input), and JSON.stringify output is
 * escaped for `<` so a value can never break out of the script element.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
