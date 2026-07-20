# ADR-047 — Trade FAQ content bank: real answers light up the FAQ machinery

- **Status:** Accepted
- **Date:** 2026-07-20
- **Builds on:** ADR-022 (the FAQ primitive), ADR-028 (content-gated FAQPage
  JSON-LD), ADR-034 (the empty-state policy that kept it all collapsed)

## Context

Every piece of FAQ machinery already existed: `faq.reassurance-accordion`
renders complete Q&A, public-mode redaction whitelists `qa:` requirements, and
`buildPageJsonLd` emits FAQPage strictly from the same channel. All of it was
dark, because the builder only ever produced *direction* — no real answers
exist anywhere in the pipeline, and ADR-034's honesty rule (rightly) collapses
a FAQ with nothing real to say.

The audit named the missing step precisely: content. Customers of the four
demo trades ask knowable questions with researchable, typical-industry
answers (costs, timings, certifications, insurance) — content that is true of
the TRADE, not of any one business.

## Decision

**A crafted, trade-keyed Q&A bank in core** —
`src/core/website-blueprint/faq-content.ts`.

- **Crafted, not generated.** Each bank is hand-written from researched UK
  figures (July 2026): emergency roofing, driveways & paving, dentistry, and
  electrical/solar. 5–6 questions per bank, tone matched to the archetype's
  theme voice.
- **Provenance in the copy itself.** Every figure is framed as a *typical UK
  industry range* ("typically £150–£300", "always get the full cost in
  writing") — never presented as the business's own prices. No invented
  figures; the bank cites what research supports and says nothing where it
  doesn't.
- **Conservative trade matching.** `resolveFaqBank(meta)` matches on explicit
  trade-string/tradeId patterns (roofing → the roofing bank, and so on). A
  trade without a bank gets **no** `qa:` slots — the FAQ keeps its honest
  ADR-034 collapse rather than borrowing another trade's answers. Wrong
  answers are worse than no answers.
- **Rides the existing channel.** The builder appends `qa: question | answer`
  content requirements alongside the existing `questions-direction` slot.
  Nothing else changes: the renderer, the public redaction, and the FAQPage
  JSON-LD emitter all consume `qa:` exactly as built in ADR-022/028/034.
  Area pages inherit the same bank (a trade's questions do not vary by
  suburb); area differentiation continues to come from the localised slots the
  anti-doorway policy actually measures.

## Consequences

**Positive** — the FAQ section and FAQPage structured data go live on all four
demos with honest, specific, sourced-range answers; long-tail SEO surface
opens up; the pattern (crafted content bank, keyed by trade, conservative
match, honest fallback) is the template for future content types (reviews
ingestion will want the same shape).

**Negative / watch-list** — banks cover four trades; every other trade stays
collapsed until researched (deliberate). Figures date: each bank notes its
research date; ranges should be reviewed periodically (the learning feed is
the natural place to log when they were last verified).

## Verification

- Tests: bank resolution (exact four trades, nothing else), builder emits
  well-formed `qa:` slots, FAQPage JSON-LD emits for banked trades and stays
  absent for unbanked, public render shows the FAQ, unbanked trades still
  collapse, anti-doorway unaffected.
- All four demos republished; FAQ + FAQPage verified live; visual gate
  (screenshots per theme) passed by the founder. Gates + CI green.
