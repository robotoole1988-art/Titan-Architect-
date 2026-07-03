# ADR-026: Selling tools — trade taxonomy, Deal Builder, ROI calculator

- **Status:** Accepted
- **Date:** 2026-07-05
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, crm, taxonomy, pricing, economics
- **Supersedes:** — (extends ADR-024/025)
- **Superseded by:** —

## Context

Founder acceptance feedback on CRM v1: trades were free-typed (fragile
matching, no shared vocabulary), there was no way to price a deal, and the
CPL intelligence answered "what does a lead cost" but not "what does N jobs a
month cost and return". The CRM must become a selling tool.

## Decision

### One trade vocabulary: `core/trade-taxonomy`

A typed canonical taxonomy of the founder's twenty trades — id, label, and a
services vocabulary (richly seeded for roofing, driveways & paving,
landscaping, plumbing & heating, and solar; solid defaults elsewhere).
**Taxonomy ids are IDENTICAL to the market-intelligence tradeKeys** — one id
space across taxonomy, benchmarks, and the pitch mapping; no cross-walk tables
to drift. Intake and CRM quick-add select from the taxonomy (trade dropdown,
per-trade services multi-select); free text remains possible via "Other" but
the record is flagged **unclassified**. `Business` gains `tradeId?`
(migration adds `trade_id`, with a conservative ILIKE backfill for existing
rows; unmatched rows stay null). Market and pitch intelligence resolve ids
directly and keep keyword fallbacks for legacy text.

### Pricing catalogue + Deal: `core/pricing`

A typed catalogue of TITAN's six sellable services (Lead Generation flagship,
Website Build, SEO, GBP, Meta Ads, AI Search Optimisation) with
**clearly-marked founder-editable placeholder prices**. A `Deal` — package
type, included services, setup fee, MMF, monthly ad spend — is stored
**ex-VAT** as a **versioned artifact** (`ArtifactKind` gains `"deal"`;
regeneration never overwrites, activity logged — the ADR-023 artifact
machinery reused wholesale). `computeDeal` derives the phone-quote numbers:
first payment = setup + MMF + ad spend; ongoing = MMF + ad spend; inc-VAT at
20% computed to pennies, never stored. Two presentations: internal breakdown
(every line, ex/inc VAT) and customer summary (two clean figures).

### ROI calculator: `core/market-intelligence/roi`

`computeRoi` answers the founder's question deterministically: leads needed
(= customers ÷ close rate, **rounded up**), required ad spend (leads × CPL),
total monthly cost (+ the deal's MMF when one exists), expected revenue, ROI
multiple, and cost per acquired customer. Close-rate defaults are
**assumptions keyed off the trade archetype** (urgent trades close higher;
considered purchases like solar lower still). Pre-filled inputs carry their
provenance (CPL and job value from `estimateCpl`, confidence shown); edited
inputs are labelled **"founder input"** — the ADR-025 provenance rule extended
to human overrides.

### Client-safety of the market index

The ROI calculator computes live in the browser, so
`core/market-intelligence`'s public index must be importable from client
components. The DataForSEO adapter is no longer re-exported there, and its
build-time `server-only` guard became a RUNTIME guard (throw when
`window` exists): bundlers trace the provider's dynamic import into client
graphs, where `server-only` breaks the build — while the real invariant is
that the adapter never *executes* client-side and no secret lives in module
scope (the key arrives via config from server-side env reads).

## Consequences

### Positive
- No free-typed trades in the main flows — matching becomes exact, and every
  downstream engine (pitch, market, strategy) keys off one vocabulary.
- A deal with correct first/ongoing/VAT maths on any lead, versioned and
  auditable like every other artifact.
- The sales motion is closed: economics (ROI) → price (Deal) → win → build.

### Negative / Trade-offs
- Catalogue prices and close rates are placeholders/assumptions — clearly
  marked, awaiting the founder's real figures and, later, measured data.
- The taxonomy's services lists are seed-quality outside the five priority
  trades; refinement is a data-file edit.
- VAT is applied uniformly at 20% (including ad spend); pass-through/agency
  VAT treatments are out of scope until invoicing exists.

### Neutral
- Migration `20260705000000_crm_v1_1_selling_tools.sql`: `trade_id` column,
  artifact-kind check widened, conservative backfill.

## Alternatives Considered

- **Separate taxonomy id space with a mapping to market tradeKeys** — a
  cross-walk that would drift. Rejected: one id space.
- **Deals as a dedicated table** — duplicates the versioned-artifact machinery
  for no gain at this stage; revisit when invoicing needs relational queries.
- **Free-text trades with better fuzzy matching** — treats the symptom.
  Rejected per founder feedback.

## References

- ADR-023 (artifact versioning), ADR-024 (CRM), ADR-025 (provenance rule,
  estimateCpl), ADR-020 (archetypes behind close-rate defaults).
- `src/core/{trade-taxonomy,pricing}/`, `src/core/market-intelligence/roi.ts`,
  `tests/core/{trade-taxonomy,pricing,market-intelligence}/`.
