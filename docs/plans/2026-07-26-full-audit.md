# TITAN — Full State Audit

- **Date:** 2026-07-26
- **Auditor:** Strategy Partner (Fable), per trust-but-verify: everything below is from
  git history, live in-browser verification, or measured counts — not from build reports.
- **Method:** git log/branch/diff on the repo; live drive of the full customer pipeline
  on the dev server (2026-07-26); static test count; docs inventory.

---

## 1. Where we are — one paragraph

TITAN's substance is real and verified: today I drove a brand-new roofing business
(Ridgeline Roofing (test)) from Business Intake to a rendered six-page website with
localized area landing pages in roughly three minutes, through the shipped product, with
every honesty law holding in the output. The platform on `main` carries the Decision
Engine, Health Engine, Command Mode, verified-reviews/customer-imagery pipeline, and
go-live infrastructure (auth + RLS). The gap remains what the Decades-Ahead Audit said:
staging, not substance — and that is exactly what M2 (Command Centre, in flight on
`feat/jarvis-mission-control`) exists to close. The critical path outside the codebase
is unchanged: Google Ads API decision expected ~Mon 28 Jul; GBP and Meta remain blocked
on prerequisites only Robert can create (a 60-day-old verified business profile; a
registered company).

## 2. What has been done (verified)

### Code on `main` (through 430a605, synced with origin)
- Full customer pipeline: intake → strategy (versioned artifacts) → blueprint
  (validated against primitive registry) → rendered site + per-area landing pages.
  **Verified live end-to-end 2026-07-26.**
- Decision Engine v1 (ADR-050), Business Health Engine v1 (ADR-051), Command Mode
  (ADR-052), customer image upload + verified review entry (ADR-053).
- Go-live infrastructure (ADR-054): founder-only magic-link auth, RLS deny-by-default,
  ISR restored on published pages. Vault hardening items 1 & 8 marked done with evidence.
- Pre-deploy fix-pack (b957a97), area-radar centring fix (1473ac3).
- Honesty laws verified in rendered output: media slots labelled as slots (Portfolio
  Law), review wall renders "VERIFIED REVIEW SLOT" with empty stars — zero invented
  reviews, zero invented figures.
- Tests: 3,912 test cases across 388 test files (static count of it()/test()).

### Unmerged branches
- **feat/jarvis-mission-control** — M1 Mission Control restage (ADR-056: situation
  address, test-artifact hygiene, adversarial-review fixes) judged "looks the same"
  by founder; M2 Command Centre now in flight on the same branch. Latest commit
  dec38ed banks THE-FEELING.md + prototypes v1–v5. **No M2 feature code yet** —
  Code has completed codebase surveys and groundwork only.
- **feat/demo-mode** — The Reveal (ADR-055), judged "ok, not ready to deliver". Parked.
- **RISK: neither branch is pushed to origin.** All M1/ADR-056/ADR-055 work exists on
  one laptop. One-command fix for Code: push both branches.

### Design program
- THE-FEELING.md banked as protected founder text with two annotations.
- Prototypes v1–v5 committed (dec38ed); v5 is the approved direction; the v5→real-build
  known defects (missing fUp keyframes; two crash guards) are documented for the React
  implementation.
- M2 milestone prompt issued; Code building. Founder judges on screen, not on reports.

### Growth / external
- Google Ads: MCC 378-411-7933 live, developer token minted (Test Account level),
  GCP project titan-ads, **Basic Access application submitted 2026-07-21** with
  design document. Decision expected ~2026-07-28.
- Liberty Contractors (pilot): full site built through TITAN; not yet delivered;
  approach message drafted, unsent.
- API Applications Pack v2 and CUSTOMER-JOURNEY.md committed on main.
- Supabase token rotated after exposure; current token (Titan-Brain-3) expires
  **~2026-08-20**.

## 3. Defects found in today's live run (new, unfixed)

1. **Services ignore intake selection** — intake picked 4 services; the rendered site
   advertises all 10 trade services. A real customer would advertise work they don't
   do. Accuracy/honesty bug. Needs a fix milestone (small).
2. **Blueprint page dev overlay shows 2 issues** — dev-only; Code to inspect.
3. **Blueprint-viewer duplicate-key error** (found earlier while testing; fix paste
   queued behind a merge decision).
4. Minor: Eastleigh area page shows "ROOFING · WINCHESTER" eyebrow and a "Winchester"
   background watermark — verify intentional (brand-base) vs leak of base location
   into area pages.

## 4. What still needs doing — ranked

| # | Item | Owner | Gate |
|---|------|-------|------|
| 1 | M2 Command Centre build → founder judges on screen | Code → Robert | in flight |
| 2 | Push feat/jarvis-mission-control + feat/demo-mode to origin | Code | none — do immediately |
| 3 | Google Basic Access decision (~Mon 28 Jul) → if granted: OAuth consent + first real API call (brand-verification expediter) | Google → us | external |
| 4 | Companies House registration (~£50, TITAN ARCHITECT LTD candidate) — unblocks Meta; the clock only starts when filed | Robert | founder |
| 5 | Services-selection bug + blueprint dup-key + dev-overlay issues — fold into one fix-pack after M2 | Code | after M2 |
| 6 | Liberty: deliver decision — send approach message or hold | Robert | founder |
| 7 | feat/demo-mode: merge or keep parked | Robert | founder |
| 8 | Imagery commission (spend approved 25 Jul) — run through product post-gate | Fable+Robert | approved |
| 9 | Cockpit Design Law v2 + founder design-review addenda to THE-FEELING.md | Fable | docs-only |
| 10 | GBP prerequisite: create/verify TITAN's own GBP now so the 60-day clock runs | Robert | founder |
| 11 | Supabase token expiry ~20 Aug — calendar the rotation | Robert | date |
| 12 | MCC hygiene: advertiser verification + remove draft account 942-154-9284 | Robert | founder |

## 5. Honest scorecard

- Substance: strong and improving — the pipeline demo is genuinely sellable.
- Staging: still the gap; M2 is the bet, and it is correctly scoped against
  THE-FEELING.md with the honesty-at-day-one-scale requirement.
- Revenue: £0. One pilot built, none delivered, no live campaigns. Every week
  items 3/4/6/10 wait, the revenue date moves with them.
- Biggest process risk fixed this week: shipping without looking (v5 crash; M1
  "looks the same"). DoD now requires the builder to run what they built.
- Biggest current operational risk: unpushed branches on one laptop.
