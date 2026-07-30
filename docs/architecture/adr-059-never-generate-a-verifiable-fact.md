# ADR-059 — TITAN never generates a verifiable fact

- **Status:** Accepted
- **Date:** 2026-07-30
- **Prompted by:** `docs/research/2026-07-30-titan-end-to-end-audit.md` §2, finding 2
- **Builds on:** ADR-034 (honesty means absence), ADR-053 (verified reviews)

## Context

`accreditationsFor()` took the **trade name**, matched it against ten
hardcoded keyword buckets, and returned UK accreditation bodies — Gas Safe,
MCS, NICEIC, FENSA, TrustMark, Which? Trusted Trader. It never consulted the
business record, because no field existed to hold the true answer. Those
strings then rendered as shield-badge chips on the live site, and fed Google
Ads headline candidates.

Measured across all 35 trades by running the real pipeline:

- **35 of 35** published at least one accreditation the business may not hold.
- **22 of 35** published the literal string "TrustMark".
- Several were not merely unverified but wrong. EV charger installation got
  "MCS certified" — MCS does not certify EV chargers. Damp proofing got "NFRC
  member, CompetentRoofer", because the substring `roof` hides inside
  `p-ROOF-ing`. A free-text "Window Cleaner" got "FENSA / CERTASS registered",
  a double-glazing building-regulations scheme.

Three FAQ answers made the same class of claim in prose: *"All work is carried
out by or under a Part P-compliant contractor registered with NICEIC or
NAPIT"*, *"All clinicians are GDC-registered"*, and *"an MCS and Part
P-compliant installation"*.

**The law.** DMCC Act 2024 Schedule 20 paragraph 3 bans displaying a trust
mark, quality mark or equivalent without having obtained the necessary
authorisation; paragraph 4 bans falsely claiming approval by a body. These are
**banned practices** — automatically unfair, with no need to show that any
consumer was misled. In force since 6 April 2025. Section 237(7) makes it a
criminal offence, and the CMA can fine the higher of 10% of global turnover or
£300,000 — including up to £300,000 against an individual who is an accessory
to another business's infringement.

Our own research had already written the rule down. `docs/research/2026-07-26-trade-playbooks-vol2.md`,
line 7: *"No verified number = no badge."* The taxonomy file even carries a
comment about "the substring trap" — 400 lines from the code that fell into it.

## Decision

**TITAN never generates a verifiable fact.** Code composes and language models
phrase, but neither may invent:

- a registration, accreditation or scheme membership,
- a review,
- a price the business charges,
- a photograph of work the business did.

Those four are the things a customer can be sued over, and none of them is
derivable — they are facts about the world that only the business can
substantiate.

Concretely, in this change:

1. `accreditationsFor()` returns an empty list, always. The credential band
   stands on the softer trust signals until a **verified** accreditation
   exists on the business record — scheme, registration number, evidence note,
   check date, and the customer's own sign-off.
2. The keyword map is retained, exported and clearly marked as research only:
   it records which scheme a trade would be asked to evidence a number for.
   It is never returned and never published.
3. FAQ answers describe the **industry**, never the business — the same
   discipline that already keeps prices as "typical UK ranges, not a quote".
   The three offending answers were rewritten to state the rule and tell the
   reader how to check, which is better content anyway.

**Enforcement** is `tests/core/accreditation-law.test.ts`: no trade in the
taxonomy, and no free-text trade outside it, may produce an accreditation;
no protected mark may leak through `trustSignals` (which spreads
`...accreditations` into itself, a second route to the same page); and the
rendered public markup of five archetype shapes is scanned for 21 UK marks.

The mark list is a deliberately **blunt string ban** rather than an attempt to
distinguish assertion from education. Naming a scheme while telling a
homeowner to ask for a registration number is lawful — Which? and trading
standards do it constantly — but "is this sentence an assertion?" is not a
property a test can check reliably, and this generator writes pages nobody
reads first. An absolute rule is worth more than an accurate one here.

## Consequences

### Positive
- The largest legal exposure in the audit is closed, in about an hour.
- The rule generalises: reviews already obeyed it (ADR-053's database
  constraint makes the attestation all-or-nothing), and now accreditations do.
  Prices and portfolio imagery are the remaining two.
- The rewritten FAQ answers are more useful than what they replaced. "Ask
  which scheme they belong to and check the register" is advice a homeowner
  can act on; "we are registered" was a claim they had to take on trust.

### Negative / Trade-offs
- Sites launch with a thinner credential band. That is a sales conversation:
  the badges come back the moment a customer supplies a number.
- One existing test asserted the old behaviour as correct — *"real
  accreditations from the taxonomy (MCS for solar)"*. It has been inverted.
  Worth noting that a passing test suite encoded the defect for months.

### Neutral
- The verified-accreditation field on the business record is not built here.
  Until it is, no site shows a badge. That is the correct default.
