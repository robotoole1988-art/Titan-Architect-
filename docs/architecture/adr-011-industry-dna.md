# ADR-011: Industry DNA Architecture

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, knowledge, intelligence, foundation
- **Supersedes:** —
- **Superseded by:** —

## Context

TITAN's purpose is to serve **every UK trade business** — generating its website,
ads, SEO, brand, and sales assets, and eventually letting the Brain reason and
act on its behalf. To do any of that, the platform needs one **complete,
structured model of a trade business**: who it is, what it sells, who it sells
to, how it markets, how it sells, its market, its operations, its numbers, and
how its AI should behave.

Without a single shared model, every engine (Website Engine, Ads Engine, SEO
Engine) and the Brain would each invent their own representation of a business.
That fragments the data, duplicates effort, and makes cross-engine intelligence —
the entire premise of TITAN — impossible. The model must therefore be defined
**once, centrally, and before** any engine or data population begins.

## Decision

We define **TITAN Industry DNA v1.0** as a new core module,
**`src/core/industry-dna`** — **interfaces only** (no implementation, no data, no
AI, no database, no UI).

Industry DNA is composed of **twelve sections**, implemented exactly as
specified:

1. Business Identity DNA
2. Services DNA
3. Customer Psychology DNA
4. Website DNA
5. Search & SEO DNA
6. Paid Advertising DNA
7. Brand DNA
8. Sales DNA
9. Market Intelligence DNA
10. Operations DNA
11. Business Intelligence DNA
12. AI Behaviour DNA

The composed `IndustryDna` interface holds all twelve. Extensibility is a
first-class requirement and is guaranteed three ways:

- Every section extends a shared `DnaSection` base carrying an open
  `extensions` bag.
- Collections use `DnaList` (`DnaEntry[]`), where each entry has a `label`,
  optional `value`/`description`, and its own `extensions`.
- Sections are `interface`s, so they can be widened via `extends` or declaration
  merging without breaking consumers.

All fields are optional, so a business's DNA can be populated incrementally.

## Why Industry DNA is the foundation of TITAN's intelligence layer

Industry DNA is the **genome** of a trade business. It is the single source of
truth that everything intelligent in TITAN reads from and writes to:

- **The product engines** (Website, Ads, SEO, Brand) are *renderers of DNA*.
  A website is Industry DNA expressed as pages; an ad campaign is Industry DNA
  expressed as creatives and audiences. Because they read the same schema, they
  stay consistent and reinforce each other instead of drifting apart.
- **The Brain** reasons *over* Industry DNA. Its decisions, automations, and the
  behaviour of every AI employee are grounded in this structured model rather
  than in ad-hoc prompts. Section 12 (AI Behaviour DNA) even makes the Brain's
  own operating rules part of the genome.
- **Compounding intelligence.** Knowledge captured once (a pain point, a
  competitor, a winning offer) is instantly available to every engine and every
  future feature. Value accrues to one shared model instead of being trapped in
  silos.
- **Scale across every trade.** One extensible schema describes a plumber, a
  roofer, or an electrician alike. New trades need data, not new architecture.

In short: define the business once as Industry DNA, and every capability TITAN
builds becomes a function of that DNA. That is what turns a set of tools into an
intelligence layer.

## Consequences

### Positive
- A single, authoritative model of a trade business; no per-engine divergence.
- Engines and the Brain can be built against a stable contract before any data
  or intelligence exists.
- Extensible at every level, so growth is additive rather than breaking.
- Establishes the domain schema the rest of the roadmap depends on.

### Negative / Trade-offs
- A large schema to keep coherent as engines exercise it.
- v1.0 field shapes are an early model and will evolve; changing the **official**
  specification requires care and a new ADR.
- Interfaces without an implementation are validated by type-checking and the
  first consumer, not yet by runtime behaviour.

### Neutral
- Population, persistence, validation, and how each engine consumes Industry DNA
  are explicitly out of scope here — each will get its own ADR.

## Alternatives Considered

- **Let each engine model the business itself** — fastest short-term, but
  fragments the data and blocks cross-engine intelligence. Rejected; it defeats
  TITAN's purpose.
- **One untyped JSON blob per business** — flexible but throws away type safety
  and shared meaning. Rejected in favour of typed, extensible sections.
- **Design a database schema first** — premature; it couples the model to a
  persistence choice not yet made. Rejected: interface first, storage later.

## References

- `src/core/industry-dna/` (the interfaces) and its `README.md`.
- ADR-010 (Knowledge Kernel — the access contract Industry DNA may later use).
- `docs/architecture/architecture-charter.md` §1 (the `core/` layer) and §6.
