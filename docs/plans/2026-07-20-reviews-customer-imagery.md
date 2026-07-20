# Verified Reviews + Customer Imagery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use sp-ecc:executing-plans to implement this plan task-by-task.

**Goal:** Close the two site-factory PARTIALs — the review wall gets a
verified review source (founder-attested, provenance-carrying, JSON-LD
gated) and the media pipeline gets a founder-gated customer photo upload
path.

**Architecture:** One new spine repository (`reviews`) + one core ingest
function beside the media generation workflow. Serve-time resolution mirrors
approved media exactly; JSON-LD stays pure (data passed in); the founder
gate is reused unchanged for uploads. Spine snapshot/graph gain review
nodes.

**Tech Stack:** TypeScript, Next.js, Vitest, sharp, Supabase (one
`business_reviews` migration; existing media bucket).

**Complexity:** High (many seams, all existing)

**Risks:**
- HIGH: JSON-LD honesty — mitigated by gating on `listVerifiedForBusiness`
  only, byte-identical output when absent (tested).
- MEDIUM: upload path handles user files — strict format/size validation,
  server-side only, same-bucket storage, gate before serving.
- LOW: fixture churn from `MemorySnapshot.reviews` (compiler finds every
  site).

**Testing:** contract tests for the review repository (memory + supabase
shape), renderer public-collapse + render-with-reviews, JSON-LD
gated-emission byte-equality, ingest validation/variants, slot preference.
E2E in browser on demo data + Lighthouse + schema inspection.

---

### Task 1: Review spine
Files: `src/core/business/{review-model.ts,repository.ts,memory-repository.ts,supabase-repository.ts,index.ts}`,
`supabase/migrations/20260720200000_reviews_v1.sql`,
`tests/core/business/{repository-contract.ts,memory-repository.test.ts}`,
`src/core/memory-spine/{model.ts,snapshot.ts,graph.ts}` + fixture updates.
CustomerReview (source enum + sourceRef for future GBP; verification
attestation), ReviewRepository (create/listForBusiness/listVerifiedForBusiness),
adapters, graph node kind "review" + edge "has_review".

### Task 2: Renderer + JSON-LD
Files: `src/features/website-renderer/model/types.ts` (+reviews),
`model/render-page.tsx` (pass-through),
`primitives/trust-review-wall.tsx` (render verified reviews; public
collapse unchanged when absent),
`src/core/website-blueprint/schema.ts` (Review/AggregateRating gated),
`components/published-site.tsx` (resolve + pass),
tests: `tests/features/website-renderer/review-wall.test.tsx`,
`tests/core/website-blueprint/schema-reviews.test.ts`.

### Task 3: CRM founder flow
Files: `src/features/crm/api/actions.ts` (addVerifiedReview),
`src/features/crm/components/lead-detail-page.tsx` (reviews card + form
with attestation), activity log entry.

### Task 4: Customer upload
Files: `src/core/media/ingest.ts` (+ index export),
`tests/core/media/ingest.test.ts`,
`src/features/crm/api/actions.ts` (uploadCustomerImage),
`src/features/crm/components/media-page.tsx` (upload UI),
`components/published-site.tsx` (slot preference: approved customer >
newest approved generated) + `tests/features/website-renderer/media-resolution.test.tsx`.

### Task 5: Gates + merge + migration push
### Task 6: Browser verification + screenshots + Lighthouse

---
**READY?** Proceeding — the milestone prompt is the approved spec (autonomous session).
