# Command Centre

The founder's landing room (ADR-057) — Layer 1 of the two-layer model. A dark
room, the particle Brain, a typed briefing, health chips, the revenue story,
the decisions row, the constellation and the timeline, staged exactly like the
approved v5 prototype (`docs/experience/prototypes/titan-opening-v5.html`).

Laws that bind this feature:

- **Honesty at day-one scale.** Every rendered figure comes from a real query
  through the memory-spine choke point (internal/test rows excluded, ADR-056
  §7). Where measurement does not exist (revenue today), the room renders the
  crafted absence — never a fake zero, never a seeded figure.
- **Proposal wording (ADR-052).** Decision cards ask; they never claim
  completed unilateral work. `isProposalShaped` in `model/decisions.ts` is the
  guard; the tests pin it.
- **Navigation guarantee (M2 addendum).** The ⌘K palette, the summonable
  rail and the constellation all derive from `src/config/navigation.ts`.
  Every destination stays reachable in at most one action from anywhere;
  `tests/features/command-centre/navigation.test.ts` proves coverage, and
  `clickCountTable()` generates the written comparison.

Structure: `api/` (server-only loader + gate actions) · `model/` (pure
composers and mappers — the testable heart) · `components/` (the room).
