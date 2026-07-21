# CUSTOMER-JOURNEY.md — The TITAN Customer Journey

- **Status:** Draft v1 — for founder review. On approval this becomes a protected
  constitution doc (annotate-only), sitting under BRAIN-MANIFESTO.md alongside
  EXPERIENCE-ENGINEERING.md and GROWTH-DEPARTMENT.md, and folds together with
  CUSTOMER-OS.md when its Paste-1 lands.
- **Date:** 21 July 2026
- **Origin:** Drafted from the first end-to-end production run (Liberty Contractors
  pilot intake, 21 July 2026) — every seam in this document was felt, not imagined.

## Why this document exists

TITAN's machine is complete from intake to published site. What was missing was the
journey wrapped around it: what the CUSTOMER experiences from the first conversation
to the day their site is winning work. The law of this document: **the machine's
sophistication must be invisible; the customer's experience must feel like one
smooth, inevitable slope.** Flawless from first touch → middle → live.

## The journey in four beats

### Beat 1 — READ (before they sign)

TITAN never asks a customer to type what the world already knows.

**The Input Ladder.** Intake starts with whatever the customer has, and degrades
gracefully — every rung feeds the same intake record:

1. **Website URL** — TITAN reads services, areas, contact details, years trading,
   guarantees, accreditations, tone signals; maps services onto the trade taxonomy.
2. **Google Business Profile** — categories, hours, reviews, photos, service area.
3. **Social / directory presence** — Facebook page, Checkatrade, Trustpilot, and
   similar listings.
4. **Conversation mode** — the bottom rung and always available: the intake form
   run as a guided ten-minute conversation, question by question, answerable by a
   tradesman from the van. The current intake form IS this rung; it needs to know
   it is a script, not a spreadsheet.

**Provenance law (extends the platform-wide rule):** every pre-filled intake field
carries its source — `read:website`, `read:gbp`, `read:directory`,
`founder-entered`, `customer-said`. The founder screen is a confirmation review,
not a form. A thin source yields a thin draft and **honest gaps — the ladder never
fabricates.** (Activation Law applies: no invented services, no guessed claims.)

**Presence tier is a first-class field.** Intake records what the customer does
NOT have — no website / no GBP / no photos / no reviews — because absence drives
the rest of the journey (see Beat 3) and feeds the Health Engine honestly.

**Nobody is turned away for being invisible online. Being invisible online is the
disease TITAN cures.** A customer with nothing is not an edge case; they are the
strongest before/after in the portfolio.

### Beat 2 — REVEAL (the moment that sells)

For the customer, the strategy → blueprint → render chain is invisible machinery.
What they experience is one moment: **their current presence (or the absence of
one) transforming into the TITAN build.** The before/after reveal — film-grade,
Transformium instinct, demo mode from the audit backlog. The pitch is not "I will
build you a website"; the pitch is "watch this."

- Sales demo mode is a first-class route, presentable from a phone or a laptop
  across a kitchen table.
- When there is no "before," the reveal opens from their trading reality — a card,
  a van, a phone number — and lands the same transformation.
- Taste decisions are captured visually: when a choice is aesthetic, render the
  options and let the customer point. Never ask them to choose from descriptions —
  the same law the founder holds for himself.

### Beat 3 — ONE LINK (signed → live)

Between signing and going live the customer touches exactly one thing: **a single
onboarding link, phone-first, checklist-shaped, with a progress bar.** Designed for
a roofer on a scaffold with one thumb free.

The checklist is **adaptive — generated from the presence tier:**

- **Job photos** — upload through the existing validated ingest (ADR-053), with
  job context captured at upload (what, where, before/during/after).
- **Reviews** — name customers happy to vouch; the attestation flow (ADR-053) does
  the rest. Reviews without attestation do not exist anywhere on the platform.
- **Google Business Profile** — if they have one: grant manager access (starts the
  GBP API 60-day clock; unlocks the review harvest). If they don't: **creating it
  is the first service TITAN delivers** — guided creation + verification with
  TITAN added as manager. A gap in their presence becomes a line item in our value,
  delivered on day one.
- **Confirmation** — approve the details TITAN read (Beat 1 provenance shown).
- **Commercial physics** — typical job values per service (unlocks margin-aware
  ads later, beyond CPL), lead appetite, no-go areas.

Everything else — strategy versions, blueprints, gates, CI — remains invisible.
The founder gate stays exactly where it is: in the core, never bypassed.

### Beat 4 — LIVE (the relationship)

Going live is a beginning. The customer-facing surface of the relationship:

- **The monthly report** (audit backlog): leads, speed-to-lead, spend physics with
  provenance on every number, and the before/after story retold with real data.
- **Business 360** (audit backlog) as the internal counterpart.
- The Brain's observations about the customer surface as recommendations to the
  founder — never as automatic actions (ADR-052 guardrails).

## The Imagery Ladder — and the Portfolio Law

Imagery resolves down a ladder, extending ADR-053's "real beats synthetic":

1. **Real job photos** — always win every slot they can fill.
2. **Commissioned synthetic imagery** (Replicate pipeline, trade-accurate,
   founder-gated) — permitted for hero, atmosphere, and design surfaces.
3. **Crafted honest-empty states** — as designed and intentional as full ones
   (post-audit law).

**The Portfolio Law (cannot bend): synthetic imagery is never presented as the
customer's work.** Portfolios, case studies, galleries and before/afters show real,
attested jobs — or a crafted empty state ("your first projects with TITAN will
live here"), which reads as confidence, not absence. A faked portfolio is a faked
review with better lighting. This is the imagery clause of the no-fake-proof law.

## Data principles (what we ask, ever)

1. **Ask only for what cannot be read.** Photos, review-willing customers, job
   values, preferences, taste. Everything else, the ladder reads.
2. **Provenance on every field.** Read, said, or entered — always tagged.
3. **Absence is data.** Presence tier drives the adaptive checklist and the Health
   Engine. Honest-empty over invented-full, everywhere.
4. **Taste is captured visually.** Options are rendered, never described.
5. **The customer's effort budget is ~15 minutes total** across the whole journey,
   excluding photo-taking. Every additional question must pay for itself.

## Sequencing (pilot-first discipline)

This vision must never delay the pilot. Build order, one code milestone in flight:

1. **Radar fix** (in flight) — area pages centre their own area.
2. **The Reveal / demo mode** — it helps SIGN the pilot.
3. **Onboarding link v1** — needed the day the pilot signs; includes GBP-as-service
   (starts the API clock).
4. **Read-first intake (Input Ladder)** — saves every intake after the pilot's.
5. Campaign render mode (ads land conversion-tight; noindex; one content spine) —
   sequenced with the ads department as approvals land.

— *Drafted by the TITAN Strategy Partner from the first live run. Judge it at the
gate like everything else.*
