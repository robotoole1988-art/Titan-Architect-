# ADR-057 — The Command Centre becomes the founder landing surface

- **Status:** Proposed (feature branch `feat/jarvis-mission-control` — the founder judges the feeling at the gate)
- **Date:** 2026-07-26
- **Implements:** THE-FEELING.md via the approved v5 prototype (`docs/experience/prototypes/titan-opening-v5.html`); the M2 navigation addendum
- **Builds on:** ADR-052 (Command Mode — proposal wording), ADR-054 (founder-only auth), ADR-056 (Jarvis Mission Control — address contract, test-artifact hygiene, ⓘ staging), ADR-022 (multiple root layouts)
- **Note:** ADR-055 does not exist; the numbering gap 054 → 056 is historical and accepted.

## Context

M1 delivered real intelligence staging (the address line, quieted cards, the
⌘K doorbell) and the founder's first-three-seconds reaction was "it looks the
same" — because M1 changed what the screen says, not the skeleton. The open
question ("Cockpit Redesign Open Question": roll the Law across the shell, or
is the shell wrong?) was answered by the founder with the v5 prototype: the
shell is wrong for the LANDING. A sidebar-and-cards admin layout can never be
the first three seconds of "I've just logged into an intelligent operating
system."

At the same time, TITAN today is small and honest: eight non-internal
businesses, one real pilot (stage `lead`), zero real enquiries, zero pending
commands, no revenue store at all. The landing must be genuinely impressive
at THAT scale with only measured data.

## Decision

### 1. Two layers, one click apart

- **Layer 1 — the Command Centre** at `/`: the founder's landing room. No
  sidebar, no command bar, no cards wall. The v5 staging order: pulse strip,
  particle Brain, typed briefing, health chips, revenue story, decisions row,
  constellation, timeline. Its root layout `(command)` loads no OS chrome
  (ADR-022 pattern) and enforces the founder session (ADR-054) on top of the
  middleware gate.
- **Layer 2 — Operations**: every existing page, unchanged, one action away.
  The Brain mark (top-left, every Operations page) returns to the room.
  Sign-in and signed-in `/login` visits land at `/` (was `/dashboard`).

### 2. Honesty at day-one scale

- Every figure in the room comes from a real query through the memory-spine
  choke point — internal businesses and test enquiries are excluded before
  any surface reads (ADR-056 §7). Provenance is available on hover/tap via
  the ⓘ affordance, verbatim.
- Where measurement does not exist the room renders crafted absence: revenue
  is ONE quiet chip ("Measurement begins with your first live campaign") —
  not three zeros — and becomes the today/week/month trio the day a real
  payment is recorded. The decisions row collapses to "Nothing awaits your
  approval."; the timeline to "The feed begins with your first live
  activity."
- The typed briefing composes only from existing facts (book counts, live
  count, measured visits, the ADR-056 situation address with its mandatory
  approval clause). Empty-state branches are unit-tested.
- The Brain's inbound data streams are labelled only with subsystems that
  exist (Website, Enquiries, Builds, Reviews, Measurement, CRM) — no
  "Google"/"Meta" streams until those integrations do.
- The pulse strip is "live" by re-running the real queries (router.refresh on
  a 60s cadence, paused when hidden) — no client-side counter ever ticks a
  number the server didn't measure.

### 3. The navigation guarantee (the M2 addendum, tested)

- **One registry.** `src/config/navigation.ts` (the sidebar's config) drives
  the ⌘K palette, the summonable rail, and the constellation. The coverage
  test (`tests/features/command-centre/navigation.test.ts`) asserts every
  destination appears in palette and rail, that the constellation is a
  strict subset (an enhancement, never the only route), and that no
  destination's click count regressed. `clickCountTable()` generates the
  written comparison from the same data.
- **⌘K is the app-wide switcher** (all 14 sections, type-ahead, Enter),
  mounted on every root layout including the room. This AMENDS ADR-056's
  doorbell: the Brain's focus key becomes ⌘J so the front door keeps a
  doorbell without two surfaces fighting over one chord. The CommandBar's
  placeholder search became the palette's click trigger — one palette, not
  two.
- **The rail** summons from the left edge (hover, click, or keyboard focus
  on the always-visible chevron) on the Command Centre; Operations pages
  keep the full sidebar unchanged, so department-to-department stays one
  click. Number keys 1–7 are additive shortcuts to the constellation
  departments — never load-bearing.

### 4. Naming

"Command Centre" now names the founder landing surface (this feature,
`src/features/command-centre`). The Brain's approval queue keeps the name
Command Mode (ADR-052); its private `CommandCentre` component is unchanged.
The Law §5 rule ("Command belongs to Mission Control") is superseded for the
landing by founder direction — the room outranks the map.

### 5. Motion and performance

- Canvas Brain: 2D, DPR-capped, `fillRect` particles, ~4ms/frame budget;
  pauses when the tab is hidden. prefers-reduced-motion renders one static
  frame and never starts the loop.
- Reveal choreography is CSS (`cc-fade-up` + server-computed delays);
  reduced motion collapses to instant, complete visibility. (This also
  properly implements the fade-up whose `@keyframes` had been lost from the
  v5 prototype file.)
- While in the room: no polling beyond the 60s refresh, no layout thrash;
  the typed briefing is presentation only.

## Consequences

- The founder lands in a room that answers "what is the state of my
  business?" honestly at day-one scale; the working layer is untouched and
  one action away — the navigation guarantee is enforced by tests, not
  promises.
- `--font-sans` in `globals.css` now actually maps to Geist (it was
  self-referential and silently fell back to the system stack) — a
  cockpit-wide typography fix that this surface exposed.
- The brain feature's public API grew read/act exports
  (`loadRecommendations`, approve/reject/accept/dismiss actions) so the room
  can wire its decisions row through the sanctioned entry point.
- ADR-056's ⌘K decision is amended (palette takes ⌘K; Ask the Brain keeps
  ⌘J). The ADR index in `docs/architecture/README.md` gains the missing 056
  row alongside 057.
- Revenue remains structurally unmeasured; the room's revenue story and chip
  render crafted absence until a real measurement path exists (a payments
  table or deal artifacts with won dates — deliberately NOT built here).
