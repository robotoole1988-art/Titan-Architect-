# ADR-020: Trade-archetype intelligence in the Experience Strategy Generator

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, experience, intelligence
- **Supersedes:** —
- **Superseded by:** —

## Context

The v0.1 Experience Strategy Generator (ADR-014) substituted the business name,
trade, and location into a **single fixed template**. Every business — a plumber,
a kitchen fitter, a wedding photographer, a dentist — received the same strategy
with different words: the same "trusted local" positioning, the same emotions,
the same "problem → rescue" story arc, the same CTAs, and the same "emergency
{trade}" SEO. It did not feel like TITAN understood *this* business.

The goal of this milestone is **better strategic thinking**, without new platform
capabilities, without AI, and without changing the public generator contract.

## Decision

Introduce a deterministic **trade-intelligence layer** inside
`src/core/experience-strategy` (`trade-intelligence.ts`):

1. **Classify the trade into an archetype** — `emergency · project · premium ·
   care · recurring · event · general` — by keyword. The archetype captures *how
   customers buy*, which is the variable that changes the strategy most.
2. Derive a resolved **`TradeProfile`**: a single positioning wedge and one-line
   thesis, plus archetype-specific dominant emotions, the primary objection,
   decision triggers, a fitting story arc, trade-appropriate CTAs, trust signals
   with **real accreditations** (Gas Safe, NICEIC, GDC, FENSA…), SEO intent
   modifiers, interactive tools, and visual/motion direction.
3. **Compose every section of the existing `ExperienceStrategy` from that
   profile**, so each section is a different expression of one coherent idea.

The public contract (`generate(request): ExperienceStrategy`) and the output
**shape** are unchanged. The engine version bumps `0.1 → 0.2`.

## Consequences

### Positive
- Strategy is now tailored to the trade: an emergency plumber gets "Call now",
  Gas Safe, and "emergency" SEO; a wedding photographer gets "Check your date", a
  portfolio, and a "memory" arc; a dentist gets "Book a consultation", GDC, and a
  gentle "care" arc.
- **Experience Studio benefits with zero modification** — same output shape.
- Strategic consistency: every section reinforces one thesis.
- Pure and deterministic; no AI, no boundary change, no new capability.

### Negative / Trade-offs
- Classification is heuristic; an unusual trade falls back to a strong "general"
  profile rather than a bespoke one. New trades are a data change (add keywords /
  an archetype), not an architecture change.
- Quality is bounded by the hand-authored archetype profiles — deliberately, so
  it is inspectable and improvable, and later replaceable by the Brain behind the
  same `TradeProfile` seam.

### Neutral
- Budget / goal / services (collected at intake) are **not** yet consumed —
  using them would extend the request contract, which is deliberately deferred to
  keep the contract stable this milestone.

## Alternatives Considered

- **Extend the request with budget/goal/services now** — richer, but changes the
  public contract; deferred (trade archetype already delivers the biggest jump).
- **AI-generated strategy** — explicitly out of scope this milestone.
- **Leave the single template** — rejected; it is the source of the "generic"
  feel.

## References

- ADR-014 (Experience Strategy Generator), PRD-001.
- `src/core/experience-strategy/trade-intelligence.ts` and `generator.ts`.
