# ADR-061 — Nothing internal reaches the customer

- **Status:** Accepted
- **Date:** 2026-08-01
- **Prompted by:** `docs/research/2026-07-30-titan-end-to-end-audit.md` §5, item 6
- **Builds on:** ADR-026 (trade taxonomy), ADR-034 (honesty means absence),
  ADR-047 (FAQ content banks), ADR-060 (evidence vs illustration)

## Context

Four defects, all measured on rendered public pages, all visible to the first
visitor. None of them would survive a demo.

### 1. The headline printed the operational trade label, lowercased

Prose interpolated `meta.trade.toLowerCase()`. Measured H1s:

- *"Certified, future-proof **solar pv** in Leeds"*
- *"Leeds's **mot & servicing**, done right"*
- *"Gentle, expert **dentists (private)** in Leeds"*
- *"Leeds's **clutch/cambelt/wetbelt** …"* (from the ops label
  `Garage — Clutch/Cambelt/Wetbelt`)
- *"Certified, future-proof **electricians** in Leeds"* — a profession plural
  where the sentence wants a service.

The taxonomy had exactly one name per trade, and it was the founder's
workbook wording: correct for a CRM dropdown, wrong for the most-read string
on the customer's site. 28 prose interpolations used it.

### 2. Sections printed their registry name as a visible label

The eyebrow above each section heading rendered `primitiveName(section)` in
both modes. On a live driveways page a visitor read **"Lead Capture"** above
the enquiry form, **"Process Journey Map"** above the steps, **"Reassurance
FAQ"** above the questions, **"Portfolio Showcase"** above the imagery and
**"Transformation Arc"** above the before/after. "Lead Capture" reached 100%
of pages. The care archetype added "Gentle Welcome" and "Team Introduction".

### 3. The FAQ bank matched on a buried substring

`matches: /roof/i` — so **"Damp Proofing"** (p-**roof**-ing) was served the
six emergency-roofing questions, including *"How fast can you get here?"* and
*"Will my insurance cover storm damage?"*, on a damp-proofing site. This is
the same trap ADR-059 documented in the accreditation map, in a different
file, four days later. `/dent/i` had it too: "accident", "independent",
"resident".

### 4. The SEO plan could become the service list

`anchors = services.length >= 2 ? services : seoStrategy.contentPillars`.
Corrected scope, because the audit overstated this one: **all 35 taxonomy
trades carry ≥2 services, so none of them hit the fallback.** It fires only
for a trade outside the taxonomy — which TITAN will sign — and then prints
the internal publishing plan as the offer: *"design inspiration"*, *"project
galleries & case studies"*, *"Leeds & area pages"*.

## Decision

**The customer's page may only ever contain language written for the
customer.** Four fixes, each at the source rather than the symptom.

1. **`TradeDefinition` gains `customerName`** — the spoken phrase, cased for
   mid-sentence, with operational qualifiers removed: `solar PV`,
   `MOT & servicing`, `private dentistry`, `electrical work`,
   `clutch, cambelt & wetbelt repair`. `label` keeps the workbook wording for
   the CRM. `tradePhrase()` resolves one from a free-text trade, falling back
   to `humaniseTradePhrase()` which drops parentheticals and lowercases
   ordinary words **while leaving acronyms alone** — so an unclassified
   "EV Charger Repairs" survives as "EV charger repairs".

   Lowercasing stays where it is correct: keyword generation ("solar pv
   leeds" is a real search) and archetype matching. Only prose moved.

2. **`sectionEyebrow(section, mode)`** — public gets customer language ("Get
   in touch", "How it works", "Common questions"); preview keeps the
   primitive name, which is genuinely useful scaffolding for the founder and
   is exactly the line ADR-034 already draws. An unmapped primitive renders
   **no** eyebrow rather than a guess.

3. **`\b` on every FAQ matcher.** A wrong bank is worse than no bank
   (ADR-047), so damp proofing now correctly gets none.

4. **No pillar fallback.** With fewer than two taxonomy services the slot is
   still emitted — the registry requires it — but with no anchor list, so the
   explorer parses zero anchors and degrades to its crafted card grid.

**Enforcement** is `tests/core/customer-facing-copy.test.ts`: every one of the
35 trades is rendered and its H1 checked for lowercased acronyms,
parentheticals, slashes and em-dash shorthand; five archetypes are scanned for
every registry name; the FAQ assignment of the whole taxonomy is pinned
topical-or-nothing; and the service anchors are asserted to come from the
taxonomy or not to exist.

## Consequences

### Positive
- The single most-read string on every site is now correct.
- `customerName` is a real product asset — it is the phrase ads, GBP
  categories and meta descriptions should use too.
- The substring trap has now been found twice. The test pins the whole
  taxonomy, so a third instance in this file fails loudly.

### Negative / Trade-offs
- 35 hand-written names are a judgement call each. "legal services" for
  Solicitors and "mobile car repair" for Mobile Mechanic are the two most
  arguable; they are one-line edits with a test that only checks form, not
  taste.
- `sectionEyebrow` omits the label for unmapped primitives, so a new primitive
  silently renders no eyebrow in public until someone maps it. Chosen over a
  fallback that would leak the name again — absence beats internal vocabulary.

### Neutral
- No data migration. `label` is unchanged, so every stored business record,
  report and dropdown keeps working exactly as before.
