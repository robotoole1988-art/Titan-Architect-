# ADR-053 — Site factory completion: verified reviews + customer imagery

- **Status:** Accepted
- **Date:** 2026-07-20
- **Builds on:** ADR-023 (Business Spine), ADR-024 (activity log), ADR-027
  (publications), ADR-028 (JSON-LD honesty), ADR-033/034/036 (media pipeline,
  founder gate, drawing-vs-building), ADR-046 (memory spine), ADR-047 (the
  FAQ content-gating precedent)
- **Closes:** the two audit PARTIALs — `trust.review-wall` had no verified
  review source; the media pipeline had no customer-upload path

## Context

The review wall exists but collapses on public pages, honestly, because no
verified review data exists anywhere in the platform. The media pipeline
generates AI imagery behind the founder gate, but a business's own
photographs — often the most convincing content it has — cannot enter the
system at all. Honesty law throughout: **no fake reviews ever; every review
carries provenance.**

## Decision

### 1. Verified review ingestion v1 (founder/CRM only)

**A new spine repository: `reviews` (`CustomerReview`).** A review records
what the customer said (text, integer rating 1–5, customer name, the date
they said it) and **where it came from**: `source` is a modelled enum
(`direct` | `google` | `other`) plus optional `sourceRef`, so GBP API
ingestion can slot in later as just another source — no schema change, no
new concept. **No GBP integration now.**

**Verification is an attestation, not a boolean.** `verification` carries
who verified it and how ("email from customer on file", "Google review,
screenshot on file") plus when. The founder CRM flow requires the
attestation at entry; the model allows an unverified record (a future
ingestion buffer), but **nothing renders and nothing is emitted to search
engines unless the review is verified** — `listVerifiedForBusiness()` is
the only read the renderer and JSON-LD path use.

**Rendering (ADR-034 discipline).** The published site resolves verified
reviews at serve time (exactly like approved media) and passes them into
`renderPage`. With verified reviews, `trust.review-wall` renders them —
real names, real dates, filled stars, a source label. Without them, the
public section collapses to nothing, as today: absence, not skeletons.

**JSON-LD (ADR-028/047 discipline).** `Review` + `AggregateRating` attach
to the LocalBusiness entity **only** from ingested verified reviews passed
into the pure `buildPageJsonLd` — content-gated exactly like FAQPage. No
reviews → byte-identical output to today.

### 2. Customer image upload (founder/CRM only)

**One new core function: `ingestCustomerImage`** beside the generation
workflow, reusing its seams: validation (webp/jpeg/png, ≤8MB), dimensions +
LQIP via the same sharp path, the same `MediaStorage` bucket, and a
`MediaRecord` **born in `review`** — the founder gate applies to the
business's own photos exactly as it does to generated ones. Provenance is
honest: `provider: "customer-upload"`, model `original-photograph`, cost 0.

**Slots.** Customer images use the same slotRef vocabulary and coexist with
generated media. At serve time, when a slot has both an approved customer
photo and an approved generated asset, **the customer photo wins** (real
beats synthetic); otherwise the newest approved asset serves. Upload UI
lives on the CRM media page beside the gate.

### 3. Both feed the spine

`MemorySnapshot` gains `reviews`; the graph gains `review` nodes and
`has_review` edges with table provenance (media assets were already
nodes). Brain surfaces see reviews the moment they exist.

## Consequences

- The last two site-factory PARTIALs close with zero new honesty debt: the
  wall and the schema can only ever show what a named person verifiably said.
- One migration: `business_reviews`. Storage reuses the existing media
  bucket.
- Future Reputation department (review requests, GBP sync) plugs into the
  modelled `source` seam; nothing here presumes it.
- Public pages keep their weight budget: reviews are server-rendered copy;
  customer images ride the existing next/image + LQIP path, so the
  Lighthouse ≥90 and anti-doorway gates hold unchanged.
