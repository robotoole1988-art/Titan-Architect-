# ADR-063 — The business is the second axis of variation

- **Status:** Accepted
- **Date:** 2026-08-01
- **Prompted by:** a measured variety audit, run 2026-08-01
- **Builds on:** ADR-026 (trade taxonomy), ADR-029/043/044 (archetype themes),
  ADR-058 (font budget)

## Context

Measured across the real pipeline, rendering public HTML:

**Across all 35 trades** — 7 distinct section sequences, 7 distinct themes.
Thirteen trades share one identical layout (roofing, driveways, landscaping,
scaffolding, painting, general builders and seven more). Six more share
another (solar, batteries, EV, electricians, boilers, HVAC).

**Five roofers in three towns** — the case that actually matters:

| | |
| --- | --- |
| Distinct section sequences | **1 of 5** |
| Distinct themes | **1 of 5** |
| Identical `<h2>`s in the same position | **3 of 4** |
| H1 | *"Leeds's finest roofing, done properly"* → *"Bristol's finest roofing, done properly"* |

Three roofers in Leeds got the same website. Same order, same palette, same
type, same headings, same headline with the town swapped. The only genuine
differences were the business name and any imagery supplied.

The diagnosis is one sentence: **TITAN varied by trade, but not by business.**
One axis where there needed to be two.

That is not a failure of the archetype system — seven genuinely different
layouts for eight archetypes is the archetype system working. It is that
nothing downstream of the archetype varied per customer. The theme file said
so explicitly: *"The renderer never invents colour per business — it realises
the archetype's emotional register."* A coherent principle, and the direct
cause of the defect.

## Decision

**The archetype fixes the register; the business picks a variation within it.**
An emergency site stays storm-dark and urgent — it is simply no longer the
*same* storm-dark as the roofer down the road.

1. `identitySeed(businessName, location)` — FNV-1a over normalised identity.
   Deterministic and stable: a published site never reshuffles itself between
   regenerations, because a customer's brand cannot change colour because
   somebody rebuilt.
2. `pickFor(seed, axis, options)` mixes the **axis name** into the seed, so
   colour and form do not move in lockstep. Without that, every business on
   accent 3 would also be on form 3 and the combinatorics collapse back to a
   single dimension. Tested directly.
3. The builder emits `designSystem.colourRef` and `designSystem.typographyRef`
   — fields that already existed on `DesignSystemReferences` and were unused.
   `themeRef` is untouched, so everything keyed on it (`data-theme`, the
   ADR-060 showcase copy, the archetype tests) is unaffected.
4. The refs are **positional slots** (`accent-3`, not `ember`). Core must not
   import from the renderer, and the renderer owns what a slot means inside
   each register: slot 3 is an ember orange on an emergency site and a clay
   red on a premium one. The two catalogues are kept in sync by a test rather
   than a shared constant.
5. Six accents and four forms per register — 24 combinations per archetype.
   Form variation is corner radius and measure, which change perceived
   character enormously and cost nothing because they are tokens.

**Deliberately not fonts.** Typefaces load per build through `next/font`;
varying them per business would multiply the font payload that ADR-058 spent a
day getting to 82.8KB. Radius and measure buy most of the perceived difference
for zero bytes.

**Measured after:** eight roofers → 7 distinct visual identities, previously 1
across five.

## Consequences

### Positive
- The defect that mattered most commercially — two competitors in one town
  recognising the same template — is largely closed, and the measurement is
  now a permanent test rather than a one-off audit.
- Nothing new was invented. Variants, themes and the unused ref fields all
  already existed; they simply were not being driven.
- Old blueprints with no `colourRef` render byte-identically, because slot 1 in
  every register is the original token set.

### Negative / Trade-offs
- **This makes collisions unlikely, not impossible.** 24 combinations means
  two businesses in one trade collide roughly 1 time in 24. Robert's
  requirement is "cannot happen", and a hash cannot deliver that — only
  *allocation* can: choosing an identity at business-creation time that no
  other business in the same trade and area already holds, and storing it.
  That needs a uniqueness lookup, and is the natural follow-up. The founder
  review gate is the interim safety net, since two similar sites would be seen
  before either is published.
- Layout, section order, variant selection and copy are still archetype-only.
  Those are the remaining axes and would take the space from 24 to the
  hundreds. This ADR covers colour and form because they are the highest
  visual impact for the least risk.
- More combinations means more surface for the Performance Law and the box
  law to hold across. All 695 tests pass, but the variation space is now
  larger than any single test run covers exhaustively.

### Neutral
- No migration. The identity lives in the blueprint payload, which is already
  stored as JSON.
