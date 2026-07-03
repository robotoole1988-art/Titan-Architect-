# ADR-025: Market Intelligence — CPL economics behind a provider seam

- **Status:** Accepted
- **Date:** 2026-07-04
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, market-data, economics, provenance
- **Supersedes:** —
- **Superseded by:** —

## Context

Pitching and planning need lead economics: what does a lead cost for this
trade, in this place, and what does a monthly budget buy? No API answers that
directly — CPL must be modelled from CPC data and conversion assumptions. The
founder compiled a benchmark workbook (TITAN-CPL-Benchmarks-v1, 2 July 2026:
20 trades × CPC ranges × conversion assumptions × job values, a 15-row
location multiplier table, confidence flags, and source citations). TITAN
needs this in-product today, upgradeable to live data tomorrow, without ever
presenting a modelled number as a measured one.

## Decision

### A provider seam, the storage-adapter pattern again

New kernel module **`src/core/market-intelligence`** with a
`MarketDataProvider` interface (`getBenchmark(trade)`,
`getLocationFactor(location)`) and two adapters:

- **Seeded (default, zero setup):** the workbook as a typed in-repo dataset —
  values verbatim, source notes kept as citations, deterministic keyword
  matching for trades and locations, honest fallbacks (unknown trade → a
  modelled general-home-services benchmark; unknown location → England
  national, flagged unmatched).
- **DataForSEO (opt-in):** activated ONLY by the server-side
  `DATAFORSEO_API_KEY`; `server-only` guarded; transport injectable so the
  contract suite runs against a mock — the live API is never called in CI or
  by default. v1 combines live CPC with the seeded conversion/job-value
  assumptions and says so in its sources; confidence is the WEAKEST input's.

One contract test suite runs against both adapters.

### The provenance rule

Every benchmark and estimate carries `provider`, `confidence`
(`sourced`/`partial`/`estimated`, mirroring the workbook's flags — the spec's
sourced/modelled two-level reading maps onto this: partial+estimated render as
"modelled" tones), `asOf`, and `sources[]`. **No UI renders a number without
its confidence label and provenance footer.** This is the workbook's honesty
notes made structural.

### The estimate model

`estimateCpl` implements the workbook formula — CPL = CPC ÷ conversion rate,
scaled by the location multiplier — producing the CPL range and mid, job-value
context, monthly-budget scenarios (£500/£1,000/£2,000 → floored lead ranges),
and cost per £ of job value. Pure, deterministic, and pinned against the
workbook's own derived "CPL by Location" sheet as fixtures (e.g. Roofing
London mid = £45). **Nothing computed is persisted** — estimates are cheap and
the dataset is the single source of truth; historical snapshots are engine v2,
after real data exists.

### Surfaces

`/market` explorer (trade × location → estimate card) and a CPL block in the
CRM lead detail's pitch panel — the founder pitches with the lead's own
economics on screen.

## Consequences

### Positive
- The acceptance demo works offline, deterministically, with cited numbers.
- Swapping in live data is an adapter, not a rewrite — proven by the mocked
  DataForSEO contract run.
- Provenance-by-construction prevents the classic agency sin: presenting
  guesses as measurements.

### Negative / Trade-offs
- Seeded numbers age; the as-of date is surfaced everywhere so staleness is
  visible, and refreshing the workbook data is a data-file edit.
- The DataForSEO live path is minimally implemented (UK-national CPC per
  trade; location competition still from the seeded table, cited) — deliberate
  v1 scope.
- Fallback benchmarks for unknown trades are coarse; they say so
  (`estimated`, modelled-from-averages citation).

## Alternatives Considered

- **Hardcode the CPL-by-location sheet** — simple but freezes derived data and
  loses the model; the sheet is instead used as test fixtures. Rejected.
- **Live DataForSEO as the default** — costs money per view, breaks offline
  demos, and CI would need secrets. Rejected; env-gated opt-in.
- **Persist computed estimates** — invites stale copies of cheap derivations.
  Rejected until real campaign snapshots exist (engine v2).

## References

- ADR-023 (the adapter/seam pattern this follows), ADR-024 (pitch panel host),
  ADR-020 (keyword-matching precedent).
- Workbook: `TITAN-CPL-Benchmarks-v1.xlsx` (founder, 2 July 2026) — imported
  into `src/core/market-intelligence/seed-data.ts` with citations.
- `tests/core/market-intelligence/`.
