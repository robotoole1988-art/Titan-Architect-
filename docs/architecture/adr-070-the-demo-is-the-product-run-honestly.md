# ADR-070 — The demo is the product, run honestly

- **Status:** Proposed (the route is built and staged; the founder's
  sign-off makes these laws binding)
- **Date:** 2026-08-04
- **Prompted by:** PRD-007 v2 §3.5 (the flagship climax) and the founder's
  original queue: a live generator demonstration, under a second
- **Relates to:** ADR-059/060 (no invented facts), ADR-066 (a trade is
  looked up, never guessed), ADR-034 (designed empty states), ADR-054
  (route classification)

## Context

The flagship's climax — and independently, the strongest thing TITAN can
show a prospect — is the production chain building a real site for a named
trade and town in front of the visitor. `generateExperienceStrategy` →
`buildWebsiteBlueprint` → `renderPage` is deterministic, synchronous and
DB-free, so this needs no mocks and no theatre: the demo IS the product.
That is exactly why it needs laws — a fabricated example business served
from TITAN's own domain is one screenshot away from being mistaken for a
real customer, and one crawler away from entering the index.

## Decision

`/experience/demo/[trade]/[town]` serves the pure chain's output under
these laws, each pinned by test or construction:

1. **Taxonomy-exact trade, or 404.** The `[trade]` segment resolves via
   `getTradeDefinition` only — exact id, case-forgiven, never the fuzzy
   matcher (ADR-066). `roofer` is not a demo; `roofing` is.
2. **The town is sanitised, hard.** Letters, spaces, hyphens and
   apostrophes; 2–40 characters; title-cased — or 404. Visitor-typed words
   end up inside generated headings and must never pass through raw.
3. **The example says so, permanently.** The business is named
   `Example …` by construction; a truth strip above the site states it is
   generated for demonstration and not a real business; the strip is part
   of the document, not the flagship's frame, so the page tells the truth
   even opened alone.
4. **Never indexed.** `robots: { index: false }` at the layout AND per
   page. (A robots.txt disallow for `/experience/demo/` rides with the
   flagship increment that links to the demo publicly.)
5. **Public-mode redaction.** `renderPage(…, { mode: "public" })` — the
   blueprint's internal direction never reaches the markup, exactly as on
   published customer sites.
6. **No media, honestly.** A synthetic business has no approved
   photographs; the designed empty states render (ADR-034). The demo
   thereby demonstrates the honesty law it sells.
7. **Deterministic and cached.** `force-static` + ISR (`revalidate
   3600`); `identitySeed(name, town)` means the same request is the same
   site, byte for byte — pinned by test, because "run it twice, get the
   same site" is said out loud in the flagship.
8. **Public by prefix, with the toll paid.** `/experience/demo/` joins
   `isProtectedAppPath`'s public prefixes — the one class of rule the auth
   model demands a look-alike test for, so `/experience/demoX` is proven
   shut.
9. **Single document, inert internal links (v1).** The demo serves the
   homepage; in-site navigation renders as anchors. A multi-page demo is a
   future decision, not an accident of link-clicking.

## Consequences

- The flagship's Increment 4 becomes an iframe pointed at a route that
  already exists, is already lawful, and is already tested.
- A prospect can be shown `their trade, their town` today, from a URL —
  before the flagship ships.
- The example-business naming pattern ("Example Roofing") intentionally
  answers PRD-007 v2 Q4's first half; the towns question (curated list vs
  free text) remains open — free text is currently accepted under law 2's
  sanitisation, and a curated list would tighten it further if sanctioned.
- If the founder declines any law here, the route does not soften — it
  comes out of the tree until the law it lost is replaced by a stricter
  one.
