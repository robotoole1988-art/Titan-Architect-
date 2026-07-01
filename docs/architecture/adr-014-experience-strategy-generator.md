# ADR-014: Experience Strategy Generator

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, experience, engine, value
- **Supersedes:** —
- **Superseded by:** —

## Context

Everything TITAN had built until now was **contract and schema**: the Knowledge
Kernel (ADR-010), Industry DNA (ADR-011), the Experience Engine (ADR-012), and
the Experience Pipeline (ADR-013) are all interfaces — essential foundations,
but they do not, by themselves, produce anything a business could look at and
use.

To validate the whole architecture and start delivering value, we need an engine
that takes real business inputs and returns a real, usable artifact — end to end,
today — without waiting for AI, persistence, or a rendering layer.

## Decision

We add **`src/core/experience-strategy`**, the **Experience Strategy Generator
(v0.1)**. It takes a business's `businessName`, `trade`, `location` (and,
optionally, its `IndustryDna`) and produces a structured **Experience Strategy**
document with ten sections: Visual Direction, Hero Concept, Storytelling,
Animation Strategy, Interactive Features, Media Direction, Conversion Strategy,
SEO Strategy, Mobile Strategy, and an AI Media Brief.

v0.1 ships a **mock implementation**: deterministic content tailored to the
inputs (e.g. SEO keywords like `"{trade} {location}"`, a hero headline naming the
location and trade). No AI, no website generation, no UI.

### Why this is the first value-producing engine

The earlier modules describe *what things are*; this engine *does something with
them*. It is the first place where inputs go in and a coherent, business-ready
output comes out. It turns the architecture from a set of contracts into a
working pipeline that yields a deliverable — the moment the platform starts
producing value rather than just enabling it.

### How it turns business inputs into a strategic website/experience brief

Three simple facts about a business — name, trade, location — are enough to
generate the *strategy* that precedes any premium website: how it should look
(Visual Direction), what the hero says and shows (Hero Concept), the story it
tells, how it moves (Animation), what it lets visitors do (Interactive
Features), how it is shot (Media Direction), how it converts, how it ranks (SEO),
how it behaves on mobile, and a brief for the media that will be created. That
document **is** the strategic website/experience brief — the same artifact a
premium agency would produce before building.

### Why it does not generate websites yet

Strategy and production are separate concerns, and separating them is
deliberate:

- A great site starts from a great brief. Getting the **strategy** right — as
  structured, inspectable data — must come before generation.
- Rendering a site is the job of the Experience Engine's blueprint (ADR-012) and
  a future Website Engine, not this module.
- Shipping the strategy first, with a mock, proves the shape and the value
  **without** prematurely committing to a generation approach or to AI.

### How the Brain can replace the mock implementation later

The engine is built for replacement:

- `ExperienceStrategyGenerator` is an **interface**; the mock is just one
  implementation. The Brain can provide its own and resolve it through
  `ExperienceStrategyGeneratorProvider`.
- `ExperienceStrategyContext` declares the backends a real generator will consume
  — the Experience **Engine** and **Pipeline**. The Brain injects those (with a
  business's real Industry DNA) and swaps the mock for genuine, AI-assisted
  generation — **with no change to any consumer**, because they depend on the
  interface, not the implementation.

### How this supports TITAN's £10k+ cinematic website vision

A £10k+ cinematic website is not a template — it is strategy, art direction, and
conversion craft executed to an agency standard. By **encoding that strategy as
structured data**, TITAN can:

- Produce agency-grade strategic briefs **consistently** for any trade, in
  seconds rather than weeks.
- Feed a downstream engine the exact direction it needs to render a premium,
  cinematic, conversion-focused experience.
- Later, have the **Brain generate and refine** these strategies automatically —
  making premium output **repeatable and economical to deliver**, which is what
  turns a £10k-quality experience into something TITAN can produce at scale.

The strategy document is the "DNA" of the finished site; this engine is where
that DNA is first written.

## Consequences

### Positive
- The architecture now produces a real, business-ready deliverable end to end.
- A clean seam (`ExperienceStrategyGenerator` + context) lets the Brain take over
  without breaking consumers.
- Structured output is inspectable, versionable, and ready to drive rendering.

### Negative / Trade-offs
- The mock content is heuristic and will be superseded; it should not be mistaken
  for AI-quality output.
- The `IndustryDna` input is accepted but not yet deeply consumed by the mock.

### Neutral
- Website generation, AI, persistence, and Brain orchestration are out of scope —
  each will get its own ADR.

## Alternatives Considered

- **Wait for AI before shipping any engine** — would delay all value and leave
  the architecture unproven. Rejected: ship the shape and the seam now, add
  intelligence later.
- **Generate the website directly** — conflates strategy with production and
  commits prematurely to a rendering/AI approach. Rejected.

## References

- ADR-012 (Experience Engine), ADR-013 (Experience Pipeline), ADR-011 (Industry
  DNA) — the contracts this engine composes.
- `src/core/experience-strategy/` and its `README.md`.
