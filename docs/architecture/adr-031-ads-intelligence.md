# ADR-031: Ads Intelligence — deterministic Google Ads campaign build sheets

- **Status:** Accepted
- **Date:** 2026-07-10
- **Deciders:** Robert O'Toole
- **Tags:** core, ads, crm, artifacts
- **Supersedes:** —
- **Superseded by:** —

## Context

Ads execution stays manual until Google Ads API access matures — but campaign
DESIGN is deterministic assembly of intelligence TITAN already holds:
taxonomy services, coverage areas, published landing pages, CPL estimates,
the deal's lead target, and strategy copy. Designing campaigns by hand
retypes what the platform already knows.

## Decision

### `core/ads-intelligence` — the campaign plan generator

`generateCampaignPlan(input)` → a **versioned `campaign_plan` artifact**
(ArtifactKind widened; same never-overwrite lifecycle as strategies,
blueprints, and deals). Deterministic, no AI calls. Search campaigns v1:

- **Structure:** one campaign per goal (lead generation), ad groups per
  service × area (homepage group when no areas).
- **Keywords:** taxonomy service × area × per-archetype intent modifiers
  (emergency trades get urgency terms; project/premium get cost/quote/ideas
  terms), phrase + exact, de-duplicated. **Negative lists** seeded richly
  per trade (jobs/careers/DIY/courses/free + trade-specific).
- **RSA copy** derived from strategy thesis + service + area, **validated
  hard** against Google limits (30-char headlines, 90-char descriptions,
  ≤15/≤4) with sensible pinning suggestions. Truncation is never silent —
  a candidate that cannot fit is dropped, and the validator proves what
  ships is legal.
- **Landing mapping:** every ad group's final URL is validated against the
  live publication's actual pages — an ad can never point at a page that
  doesn't exist.
- **Budget maths FROM THE DEAL:** lead target × CPL → monthly → daily
  (÷30.4), displayed with its working. The plan reads the deal's own
  numbers — the shared-CPL rule (ADR-026 addendum) means plan and deal can
  never disagree.
- **Bid strategy as guidance:** start Maximise Clicks with a CPC ceiling;
  switch to tCPA at ~30 conversions. Stated as recommendation, not magic.
- **Conversion checklist wired to reality:** the Lead Flow v1 enquiry form
  submit IS the conversion event; the checklist (harvested from TradeFlow
  v6's launch checklist where sane) reflects the real stack.

### Founder gate

The `google_ads` build item gains "Generate campaign plan": the plan lands
the item in **review**, through the standard Approve / Send back gate. The
item keeps its MANUAL execution label — approving the plan approves the
design; a human still builds it in Google Ads.

### Outputs

(a) A plan viewer (blueprint-viewer style): structure tree, keyword tables,
SERP-style ad previews, budget box with working, negatives, launch
checklist. (b) **Google Ads Editor-compatible CSVs** (campaigns / ad groups
/ keywords / ads) so a plan imports in minutes. (c) A printable summary
(print stylesheet on the viewer).

## Consequences

### Positive
- Campaign design drops from hours to a click, using numbers that already
  passed the deal gate.
- The CSV path means manual execution without retyping — the error surface
  shrinks to Google's own import validation.

### Negative / Trade-offs
- Deterministic copy is serviceable, not inspired — AI-assisted copy is a
  later, gated enhancement.
- CSV column formats track Google Ads Editor; a format change needs a
  version bump here (columns are pinned in tests).

### Neutral
- Migration widens the artifact-kind check to include `campaign_plan`.
- Out of scope, recorded: Ads API calls, Meta/LSA plans (same pattern
  later), automated bidding, performance import, AI copy.

## Alternatives Considered

- **Wait for API access and build live campaign management** — months of
  standing still while every campaign is designed by hand. Rejected.
- **Free-text plan documents** — unverifiable, unexportable, drift from the
  deal's numbers. The typed artifact + validators are the point. Rejected.

## References

- ADR-025/026 (CPL + deal maths shared), ADR-027/030 (published pages +
  conversion event), ADR-024 (the gate).
- `src/core/ads-intelligence/`, TradeFlow v6 launch checklist (harvested).
