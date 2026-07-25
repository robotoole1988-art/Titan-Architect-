# COCKPIT-DESIGN-LAW.md — The TITAN Cockpit Design Law

- **Status:** Draft v1 — for founder review; protected (annotate-only) on approval.
- **Date:** 25 July 2026
- **Scope:** Every internal surface of TITAN (the founder cockpit). Generated
  client sites are governed by EXPERIENCE-ENGINEERING.md, not this document.
- **Origin:** Founder direction, 25 July 2026: *"When I open TITAN I want to
  feel like Iron Man speaking to Jarvis — a system full of intelligence."*

## The Jarvis Principle (the law behind the laws)

Jarvis is not impressive because of his interface. He is impressive because he
**speaks first about what matters, already knows the situation, answers
anything he is asked, shows his work only when asked, and never exposes his
machinery.** Every rule below is one of those five properties turned into CSS,
copy, or information architecture. When a design question is not covered here,
answer it by asking: *which of the five properties does this serve?*

## 1. The Brain speaks first — and speaks like Jarvis

- Mission Control opens with the Brain **addressing the founder**, not with a
  wall of cards: one composed situation line ("Two enquiries are aging past
  SLA; pipeline moved +20 overnight; nothing awaits your approval."), then the
  actions. The address is Sonnet-narrated from spine payloads (ADR-048 seam) —
  same honesty, better staging.
- **Ask the Brain is the cockpit's front door**, not a search-box lookalike.
  It sits first, styled as the system's voice, with a keyboard shortcut (⌘K —
  absorbing the audit-backlog "Cmd+K palette" item into the Brain itself).
- The Brain's tone in narration: calm, precise, quietly confident. Never
  exclamatory, never hedging beyond honest absence.

## 2. Intelligence whispers; it does not shout

- **Action cards lead with the imperative** (one or two lines). The narrated
  reasoning lives behind the existing "why" affordance — never inline as a
  standing paragraph. One primary action (Accept); the rest in an overflow.
- **Badges appear only when exceptional.** NOW / HIGH CONFIDENCE / RISK on
  every card means nothing is urgent. Default states are unlabelled; a badge
  is a signal, not a decoration.
- Maximum **two levels of card nesting** on any screen. Beyond that, use
  spacing and rules, not more rounded rectangles.

## 3. No machinery on the cabin walls

- ADR numbers, engine names, store names, seam descriptions ("Decision Engine ·
  anthropic narration · approval-gated (ADR-052)", "store: Supabase (durable)")
  **never appear as standing UI text.** Provenance moves behind a single ⓘ
  affordance per module — hover/tap reveals the full honest lineage. The
  provenance law is not weakened; it is staged. Jarvis knows how he works;
  he doesn't recite it.
- Developer breadcrumbs (version strings, schema tags) live in Settings →
  About, nowhere else.

## 4. One voice of type

- **Display serif** for page titles only. **One sans** for all interface text
  and body. **Mono** reserved for true data: figures, IDs, slot names, code.
  No mixed-face body copy anywhere.
- Small-caps mono section labels survive only as module headers (one per
  module), not scattered through content.

## 5. The map has one name for each road

- One concept, one name, one place. "Pipeline" is the CRM's word — the
  Businesses page becomes **"Businesses · every business TITAN knows"** and
  drops the pipeline headline. "Command" belongs to Mission Control; CRM
  drops "Command Centre".
- The sidebar is grouped, not flat:
  - **OPERATE** — Mission Control · TITAN Brain · CRM · Businesses · Market
  - **CREATE** — Business Intake · Experience Studio
  - **SYSTEM** — Codex · PRDs · Directives · AI Employees · Roadmap ·
    Architecture (collapsed by default; the founder-meta shelf)

## 6. The state of the world before the forms

- Every screen opens with **what is** (the list, the board, the numbers).
  Creation forms live behind a primary button ("Add lead", "New intake") and
  open as a focused sheet/modal. A form never occupies the hero position of
  an operating screen.

## 7. Honest data only — test artifacts never steer

- Verification/test enquiries and internal-flag records (ADR-049) are excluded
  from briefings, top actions, health inputs and counts on every operating
  surface. The Brain's credibility is the product; it must never recommend
  chasing a test row.

## 8. Motion is life, spent sparingly

- Compositor-only, ≤300ms, easing consistent app-wide. Motion marks **state
  change and arrival** (a briefing composing in, an approval clearing) — never
  decoration. Reduced-motion always respected. Performance law unchanged:
  the cockpit stays instant; feeling fast IS feeling advanced.

## 9. Crafted absence (unchanged, restated)

- Empty states remain as designed as full ones — but styled to this law:
  quiet, single-line, with the one action that would fill them.

## Enforcement

- This document governs review at the founder gate for every cockpit-touching
  milestone. The exemplar build order: Mission Control first, judged against
  this law; then screen-by-screen rollout, mechanical, one milestone each.
- Where this law and a constitution doc conflict, constitutions win; where it
  and habit conflict, this law wins.
