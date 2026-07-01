# PRD-004: Experience Studio

- **Status:** Draft
- **Date:** 2026-07-01
- **Author:** Robert O'Toole
- **Related:** ADR-016 (architecture), ADR-014 (Experience Strategy Generator), ADR-012 (Experience Engine)

## 1. Summary

**Experience Studio** is the first *visible* workspace for reviewing a TITAN
Experience Strategy. It shows how TITAN would position, design, and structure a
premium website experience for a business — a **strategy room** where a founder
or team member can read the full strategy at a glance.

**v0.1 uses mock data** and renders the existing Experience Strategy Generator
output. No AI, no database, no website generation.

## 2. Problem & purpose

The platform can already *generate* an Experience Strategy (PRD-001/ADR-014), but
until now there has been nowhere to *see* it. A strategy that lives only as a
data structure cannot be reviewed, judged, or approved by a human.

Experience Studio makes the strategy **tangible**: it turns the generator's
output into a beautiful, readable presentation that communicates the quality and
intent of a TITAN experience — the first step toward review, approval, and,
later, generation.

## 3. Goals & non-goals

### Goals
- Render the complete Experience Strategy for a business in a premium interface.
- Feel like a **strategy room**, not a dashboard — worthy of the £10k+ standard.
- Use the Experience Strategy Generator's output shape exactly.
- Surface the future actions (**Generate Website**, **Approve Strategy**) as
  clearly "coming soon".

### Non-goals (v0.1)
- ❌ AI or LLM calls.
- ❌ Database or persistence.
- ❌ Website generation.
- ❌ Editing the strategy.
- ❌ Selecting a real customer (a mock business is shown).

## 4. Users

- **Founder / team member** — reviews the strategy and judges its quality.
- Later: **customers** reviewing and approving their own strategy.

## 5. What it shows

- **Business identity** — name, trade, location.
- **Hero Concept** — featured as the centrepiece.
- **Visual Direction, Storytelling, Animation Strategy, Interactive Features,
  Media Direction, Conversion Strategy, SEO Strategy, Mobile Strategy, AI Media
  Brief** — each as an editorial card.
- **Coming-soon actions** — Generate Website and Approve Strategy (disabled).

## 6. Scope for v0.1

- A new feature `src/features/experience-studio` with a `/experience-studio`
  route (thin), rendering the generator output for a mock business.
- Premium dark "strategy room" design, reusing the existing design system.
- Server-rendered; no state.

## 7. Future evolution

- Select a real customer and load their Industry DNA.
- Enable **Approve Strategy** (records approval) and **Generate Website** (hands
  the strategy to the Experience Engine / Website Engine).
- Editing and versioning of strategies; side-by-side comparison.
- Driven by the Brain, which can present strategies for human approval.

## 8. Success metrics (future)

- Does a reviewer immediately grasp the strategy and its quality?
- Does the studio meet the premium standard the Manifesto demands?
- Time from strategy generated to strategy approved.

## 9. Dependencies

- **Experience Strategy Generator** (`core/experience-strategy`, ADR-014) — the
  output the studio renders.

## 10. References

- ADR-016 (Experience Studio architecture)
- `src/features/experience-studio/` and its `README.md`
- Founder Manifesto (the premium standard), Product Vision (the destination)
