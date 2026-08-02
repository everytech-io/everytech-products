# TODO

Course roadmap for the AI Engineer Curriculum (`/courses/claude`). Shipped 2026-08-01:
Day 1 live at apps.everytech.io/courses/claude with the Day-2 email capture writing to
`course_followers` (verified end-to-end in prod). Next session starts here.

## Now — course content

- [ ] **Author Day 2 — "How models work"** (probabilistic output, tokens as the meter,
      first read-only Claude Code conversation about your own project; ships NOTES.md).
      Resources already mapped: Anthropic Academy "Building with the Claude API",
      platform.claude.com models overview + pricing docs. Pipeline: draft → humanizer
      skill → slop/constraints/cold-reader judges → ship. Copy rules live in the page
      itself and in agent memory (no "unlock", no numeric plan caps, official links only).
- [ ] **Wire Day-2 email sending** — capture only collects today. Decide: manual export
      from `course_followers` for the first send vs. Resend/SES automation. Must respect
      the form's promise: at most six emails, one per remaining day, nothing else.
- [ ] Author Days 3–7 (Day 3: context/tools/agents + explore marcusraitner/pulse +
      PRODUCT.md; Days 4–7: build healthyfied-recipes-ios).

## Soon — product polish

- [ ] Store-card CTA reads "Open app →" for a course — add a `ProductStatus` variant
      (or `ctaLabel` override) in `src/components/app-store.tsx` / `src/lib/products.ts`.
- [ ] Optional: publish a reference `healthyfied-recipes-ios` repo under everytech-io
      as the Day 4+ comparison artifact.
- [ ] Re-authenticate the Railway MCP (`railway login`) so infra can be inspected
      from agent sessions again.

## Later — platform (LMS staging)

- [ ] Validate: watch `course_followers` signups while Days 2–7 publish.
- [ ] Monetize (only after validation): thin in-app LMS — WorkOS auth + progress table +
      merchant-of-record checkout (Lemon Squeezy/Polar), gated lesson routes under
      `/courses/claude/*`. Hand off to a community platform only if community becomes
      the product.
