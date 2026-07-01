# PRD-006: Business Intake

- **Status:** Draft
- **Date:** 2026-07-01
- **Author:** Robert O'Toole
- **Related:** ADR-018 (architecture), ADR-014 (Experience Strategy Generator), ADR-017 (Website Blueprint Engine)

## 1. Summary

**Business Intake** is the first step of the Business → Blueprint journey — the
screen where a founder or team member enters the basic business details TITAN
needs before generating strategy and blueprint outputs. It produces a saved
**Business Intake record** that later modules consume.

**v0.1 uses mock / localStorage only.** No database, no AI, no external APIs.

## 2. Problem & purpose

Everything TITAN generates — strategy, blueprint, website — needs a starting
point: who the business is, what it does, where, for whom, with what budget,
goal, and urgency. Until now there was no way to capture that. Business Intake is
the front door: a single, premium screen that collects exactly what's needed to
begin, and saves it as a structured record.

## 3. Goals & non-goals

### Goals
- Capture the essential business details in a clear, premium form.
- Save each intake as a structured record (persisted locally).
- Show a list of saved intakes.
- Feel like the start of a high-value onboarding process.
- Surface the next step (**Generate Strategy**) as clearly "coming soon".

### Non-goals (v0.1)
- ❌ Database or backend persistence.
- ❌ AI or external APIs.
- ❌ Generating strategy, blueprint, or website.
- ❌ Editing a saved intake (create + remove only).

## 4. Users

- **Founder / team member** — onboards a new business.
- Later: **the customer** completing their own intake; **the Brain** consuming
  intakes to drive generation.

## 5. Fields

Business Name, Trade, Location, Services, Target Customer, Monthly Marketing
Budget, Current Website URL, Main Goal, Urgency Level. Business Name, Trade, and
Location are required.

## 6. Output

A saved `BusinessIntake` record with a system-managed `id`, `createdAt`, and
`updatedAt`. The record already carries the business name, trade, and location
the Experience Strategy Generator needs, plus the budget/goal/urgency that will
shape later decisions — so it is the natural input to the next stage.

## 7. Scope for v0.1

- A new feature `src/features/business-intake` with a `/business-intake` route
  (thin), a premium form, localStorage persistence, and a saved-intakes list.
- A **coming-soon "Generate Strategy"** action on each saved intake.

## 8. Future evolution

- Enable **Generate Strategy** — hand a saved intake to the Experience Strategy
  Generator, then the Website Blueprint Engine.
- Edit and richer validation; resolve Industry DNA from the trade/location.
- Real persistence and multi-user; the Brain driving intake and generation.

## 9. Success metrics (future)

- Completion rate and time to complete an intake.
- Quality/completeness of captured details.
- Conversion from intake → generated strategy.

## 10. References

- ADR-018 (Business Intake architecture)
- `src/features/business-intake/` and its `README.md`
- ADR-014 (Experience Strategy Generator — the next stage's input).
