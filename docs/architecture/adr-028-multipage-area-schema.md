# ADR-028: Experience v2 — multi-page sites, area pages, and schema markup

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Robert O'Toole
- **Tags:** architecture, blueprint, renderer, publishing, seo, core
- **Supersedes:** — (extends ADR-021/022/027)
- **Superseded by:** —

## Context

Blueprints and the Renderer are homepage-only; publishing serves one page. The
founder's area-page strategy needs a customer's site to be a multi-page
presence: homepage plus a genuinely unique landing page per coverage area, with
structured data everywhere. The blueprint contracts (`PageCollectionBlueprint`,
open `PageType`) were designed for this — no contract breakage.

## Decision

### Coverage areas live on the Business record

`BusinessDraft` gains `coverageAreas?: ReadonlyArray<string>` — free-entry
town/locality names captured at intake (and editable via the same server
actions). The builder receives them through
`WebsiteBlueprintRequest.coverageAreas` (additive, optional): no areas → the
homepage-only blueprint of today.

### Area pages are landing pages, not copies (the anti-doorway policy)

Google's spam policy punishes doorway pages: near-duplicate local pages that
exist only to rank. TITAN's area pages must be genuinely useful, so the
generator ENFORCES differentiation, and a test suite proves it:

- **Structural intent:** area pages use their own conversion-forward sequence
  (localised hero variant → trust → services → area FAQ → strong lead capture),
  not the homepage sequence.
- **Substantive localisation:** the area name is woven into headline, copy
  direction, FAQ direction, and SEO fields of EVERY area page; each page's
  slots differ pairwise from every other area page's.
- **Honest local proof:** each area page carries clearly-marked slots for
  area-specific evidence (jobs and reviews in that area). Real data when it
  exists; until then the slot is an explicit brief — never fabricated content
  (the platform's honesty rule).
- **Enforcement:** `tests/core/website-blueprint/area-pages.test.ts` asserts
  pairwise slot difference, area-woven copy, distinct URLs/SEO, and structural
  divergence from the homepage. A change that regresses differentiation fails
  CI.

### One publication = the whole site version

Publishing semantics are unchanged (ADR-027): a publication pins ONE blueprint
version, and that version now contains the whole page collection. Area pages
serve at `/{area-slug}` under the publication's slug or hostname; republishing
swaps the entire site atomically. Navigation between pages is driven by the
blueprint's `navigation` items (header/footer render them); the sitemap lists
every page; each page carries its own canonical/meta/OG from its own SEO
aspects.

### Schema markup (JSON-LD) is generated, never fabricated

A deterministic core module (`core/website-blueprint/schema.ts`) builds
JSON-LD from blueprint + business data only:

- **LocalBusiness** site-wide — name, areaServed (coverage areas + base
  location), url; no invented phone/address fields.
- **Service** on pages selling a service (homepage + area pages).
- **FAQPage** only where an FAQ primitive actually renders, from its question
  direction slots.
- **BreadcrumbList** on area pages (Home → area).
- **No reviews/ratings markup** until real review data exists — aggregate
  ratings without data are a Google penalty and a lie. The seam is the schema
  module; review markup plugs in there later.

The renderer injects `<script type="application/ld+json">` on published pages.

## Consequences

### Positive
- One customer site becomes a local-search surface per area, honestly
  differentiated — the founder's core SEO strategy shipped.
- Structured data on every page with zero fabrication.
- Publication semantics unchanged: the review gate now gates whole-site
  versions.

### Negative / Trade-offs
- More unbuilt-primitive placeholder surface on non-emergency archetypes until
  the primitive-craft milestone lands.
- Area slugs share the page namespace with future service pages — the URL
  planner must stay collision-aware (area slugs are checked unique today).

### Neutral
- Migration adds `coverage_areas` to `businesses` (jsonb, default `[]`).
- Out of scope, recorded: service pages, premium primitive craft, review data
  integration, blog pages, per-area ad campaigns.

## Alternatives Considered

- **One page with an area list** — simplest, but surrenders the local landing
  page entirely; an area resident lands on generic copy. Rejected.
- **Duplicate homepage per area with a swapped town name** — the literal
  doorway-page pattern Google penalises. Rejected and actively guarded against
  by test.
- **Schema markup hand-written per site** — unmaintainable at fleet scale and
  invites drift from the rendered content. Generated from the blueprint so
  markup and page can never disagree. Rejected.

## References

- ADR-021 (registry), ADR-022 (renderer), ADR-027 (publishing snapshots).
- Google spam policy on doorway pages; schema.org LocalBusiness/Service/
  FAQPage/BreadcrumbList.
- `src/core/website-blueprint/{builder,schema}.ts`, `src/core/business/model.ts`,
  `src/app/(sites)/`.
