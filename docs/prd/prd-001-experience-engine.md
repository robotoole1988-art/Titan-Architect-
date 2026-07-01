# PRD-001: TITAN Experience Engine

- **Status:** Draft
- **Date:** 2026-07-01
- **Author:** Robert O'Toole
- **Related:** ADR-012 (architecture), ADR-011 (Industry DNA), ADR-010 (Knowledge Kernel)

## 1. Summary

The **TITAN Experience Engine** creates premium, cinematic, high-converting
digital experiences for trade businesses. It takes a business's **Industry DNA**
(including its **Brand DNA** and **Website DNA** sections) plus **guidance**, and
produces a structured **Experience Blueprint** — the complete specification of a
digital experience — which a future rendering layer turns into a real website.

This PRD defines the product. The **v0.1 scope is architecture and interfaces
only**: no UI, no website generation, no AI, no database.

## 2. Problem & purpose

Trade businesses need websites and landing experiences that are genuinely
premium and convert — not generic templates. Today that requires expensive
agencies and bespoke work per business. TITAN already models a business
completely as Industry DNA; the missing piece is a repeatable way to turn that
DNA into an exceptional experience.

The Experience Engine is that piece: **one engine that expresses any business's
DNA as a cinematic, conversion-focused experience**, consistently and at scale.

## 3. Goals & non-goals

### Goals
- Define a single, stable **contract** for producing digital experiences from DNA.
- Make the output a **structured blueprint** (not opaque HTML), so it can be
  rendered, reviewed, versioned, and improved.
- Cover the full surface of a premium experience (see §5).
- Be **extensible** so new experience capabilities are additive, not breaking.

### Non-goals (for v0.1, and some permanently out of this module)
- ❌ Building UI or rendering a website.
- ❌ Implementing generation logic.
- ❌ Connecting any AI/LLM.
- ❌ Any database or persistence.

## 4. Users

- **Trade businesses** — the ultimate beneficiaries; their DNA drives the output.
- **The Brain** (future) — supplies creative/strategic `guidance` and will
  eventually invoke the engine autonomously.
- **Internal product engines** (e.g. a future Website Engine) — consume the
  blueprint and render it.

## 5. Capabilities the engine must eventually support

Expressed in the blueprint contract, to be implemented later:

- Cinematic website generation
- Immersive hero sections
- 3D / interactive experiences
- Conversion-focused landing pages
- Service pages
- Location pages
- Media direction (photography, video, 3D)
- Animation strategy
- SEO-ready structure
- Lead-capture flows
- Mobile-first experiences

## 6. Inputs & output

**Input — `ExperienceBrief`:**
- `industryDna` — the business's complete Industry DNA (Brand & Website DNA are
  its `.brand` and `.website` sections).
- `objectives` — conversion goals (lead-capture, phone-call, booking, …).
- `guidance` — creative/strategic direction (human now, Brain later).
- `targetPages` — which page types to produce.

**Output — `ExperienceBlueprint`:**
- `pages` (home / landing / service / location / …), each with hero, sections,
  SEO, and lead-capture direction.
- Site-wide `mediaDirection`, `animationStrategy`, `interaction` (3D),
  `seo`, `leadCapture`, and `responsive` (mobile-first) strategy.

## 7. Scope for v0.1

- A new core module `src/core/experience-engine` with **TypeScript interfaces
  only**: the `ExperienceEngine` contract, `ExperienceBrief` (input), and
  `ExperienceBlueprint` (output) with all sub-specifications.
- Async-ready contract (`Promise`-returning) and a provider seam, so a future
  implementation drops in without breaking consumers.
- Documented in ADR-012.

## 8. Dependencies

- **Industry DNA** (`core/industry-dna`, ADR-011) — the engine's primary input.
- **Knowledge Kernel** (`core/knowledge-kernel`, ADR-010) — how DNA is fetched
  (relationship deferred).
- **Brain** (future) — supplies guidance and orchestrates generation.

## 9. Success metrics (future, once implemented)

- Time to produce a complete, on-brand experience for a new business.
- Conversion performance of generated experiences vs. baseline.
- Coverage: share of the §5 capabilities expressed and rendered.
- Consistency: generated experiences reliably reflect the business's DNA.

## 10. Open questions (deferred to future ADRs)

- Generation strategy: rules/templates vs. AI-assisted (or a blend)?
- How blueprints are persisted, versioned, and rendered.
- How the engine and the Brain collaborate at runtime.

## 11. References

- ADR-012 (Experience Engine architecture)
- `src/core/experience-engine/` and its `README.md`
