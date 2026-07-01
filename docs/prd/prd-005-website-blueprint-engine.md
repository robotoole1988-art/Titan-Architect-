# PRD-005: Website Blueprint Engine

- **Status:** Draft
- **Date:** 2026-07-01
- **Author:** Robert O'Toole
- **Related:** ADR-017 (architecture), ADR-014 (Experience Strategy Generator), ADR-012/013 (Experience Engine, Pipeline), ADR-011 (Industry DNA), ADR-015 (Brain Orchestrator)

## 1. Summary

The **Website Blueprint Engine** is the next stage of the Experience Department.
Once an Experience Strategy has been created and approved (Experience Studio,
PRD-004), the Blueprint Engine transforms it into a complete, **platform-
independent Website Blueprint** — the master architectural document that every
future generator (website, landing page, media, SEO) will consume.

**v0.1 is architecture and interfaces only.** It does **not** generate websites,
React, HTML, CSS, Tailwind, media, or animations, and it does **not** use AI.

## 2. Why Website Blueprints exist

Between "here is the strategy" and "here is the built website" there is a missing
layer: the **architecture of the website itself** — its pages, sections,
components, and their requirements. Jumping straight from strategy to code would
bury those decisions inside generated markup, where they cannot be inspected,
reused, or improved.

The Blueprint makes that architecture **explicit and durable**: a structured
document that says exactly what the website should contain and why, before a
single line is generated.

## 3. Why TITAN creates architecture before websites

**An architect produces drawings before construction begins.** TITAN does the
digital equivalent. Designing the architecture first means:

- Decisions are made deliberately, reviewed, and reasoned about — not
  accidentally encoded in output.
- The same architecture can be built many ways and rebuilt without re-deciding.
- Quality is designed in, in line with the Manifesto's "architecture before
  shortcuts".

## 4. Why platform independence matters

The Blueprint describes **what** and **why**, never **how**. It contains no
React, HTML, CSS, Tailwind, or framework specifics. This means one blueprint can
target **React, Next.js, WordPress, Shopify, Flutter, native mobile, or future
frameworks** without changing. TITAN is never locked to a rendering technology,
and can adopt new ones — or serve customers on different stacks — from the same
source of truth.

## 5. How Blueprints become the foundation for every future website

The Website Blueprint becomes the **single source of truth** for:

- Website generation and landing-page generation
- Media generation, SEO generation
- Accessibility, analytics, conversion optimisation
- Future redesigns and future AI improvements

Everything begins with the Blueprint. Each generator reads it and produces its
part; improvements to a generator do not require re-deciding the architecture,
and redesigns start from an updated blueprint rather than a blank page.

## 6. Explainability from day one

Every element of the Blueprint carries a **confidence score**, a **reasoning
reference**, and **source references**. This is not decoration: it is what will
let the Brain eventually explain *why* the site is the way it is — e.g. a hero
section at 97% confidence, derived from Industry DNA, Experience Strategy,
competitor analysis, and customer psychology. Building this in now means TITAN's
output is inspectable and defensible, not a black box.

## 7. Why this creates a competitive advantage

Competitors either hand-build sites (slow, inconsistent, unexplainable) or use
generic AI generators (fast, but shallow and generic). TITAN designs a rigorous,
explainable, platform-independent architecture first, then generates premium
output from it — consistently, at scale, and improvable over time. The Blueprint
is the moat: it turns "make a website" into "execute a considered architecture",
and every future capability compounds on it.

## 8. Scope for v0.1

- A new core module `src/core/website-blueprint` with **TypeScript interfaces
  only**: the `WebsiteBlueprint` and all its parts, and a `WebsiteBlueprintEngine`
  contract (`ExperienceStrategy → WebsiteBlueprint`).
- Explainability (confidence/reasoning/sources) on every element.
- Dependency inversion on the abstractions it consumes.
- Documented in ADR-017.

## 9. Future evolution

- A real engine implementation behind the interfaces (still no rendering).
- Generators (website, landing page, media, SEO) that consume the Blueprint.
- The Brain producing and refining blueprints, and explaining them.

## 10. References

- ADR-017 (Website Blueprint Engine architecture)
- `src/core/website-blueprint/` and its `README.md`
- Founder Manifesto, Product Vision.
