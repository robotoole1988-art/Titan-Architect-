# ADR-067 — Knowledge is sourced or it is silent

- **Status:** Accepted
- **Date:** 2026-08-02
- **Prompted by:** queue item 2 — the trade industry knowledge base
- **Builds on:** ADR-011 (Industry DNA schema), ADR-026 (trade taxonomy), ADR-059 (verifiable facts only), ADR-066 (a trade is looked up, never guessed)

## Context

ADR-011 defined the Industry DNA: twelve sections describing everything TITAN
knows about a trade business. It shipped as interfaces only and held zero data
for months, while `docs/research/` accumulated three dossiers covering the
conversion patterns, market benchmarks and UK legal MUSTs of effectively every
trade in the taxonomy — ~50 primary sources' worth — that nothing read.

Meanwhile the founder pitched with 7 of 35 trades' pitch packs, the FAQ bank
covered 6, and the long-term vision (the brain: always learning, department
agents, prediction) has exactly one honest foundation possible: a knowledge
store whose every claim can be traced to where it was learned. A brain that
cannot cite its sources is a liar at scale, and TITAN's whole market position
is being the one that does not lie.

## Decision

The knowledge base lives in `core/industry-dna` as typed data plus a resolver,
under three laws, each machine-enforced:

1. **Sourced or silent.** Every populated section carries
   `extensions.sources` naming the research document (and section) behind it,
   pointing into `docs/research/`. The provenance gate
   (`tests/core/industry-dna/provenance.test.ts`) fails CI on any populated
   section without sources — and on any EMPTY section that cites them.
   Sections with no research behind them (business intelligence, per-trade AI
   behaviour) stay empty until research exists. New knowledge therefore
   arrives as a PR that adds or extends a research doc AND the records citing
   it — never as facts typed straight into data files.

2. **Looked up, never guessed** (ADR-066, one level up). Records are keyed by
   canonical taxonomy id. The resolver accepts an exact id or delegates free
   text to `matchTradeId` — the taxonomy's single blessed matcher — and
   contains no string heuristics of its own. An unmatched trade resolves to
   the platform layer alone with `matched: null`; the CRM surface says "no
   trade-specific record matched" rather than borrowing a neighbour's facts.

3. **No silent gaps.** `industryDnaGapTradeIds()` names every taxonomy id
   without a trade record, and a test pins that list — currently empty, all
   35 covered. A trade added to the taxonomy without knowledge turns CI red
   instead of quietly falling back.

Structure: `data/platform.ts` holds cross-trade truths; `data/track-a.ts`
through `track-f.ts` hold per-trade records grouped as the research grouped
them. The resolver merges platform + trade field-by-field (trade wins, no
list concatenation), unioning sources. The CRM's `KnowledgePanel` renders the
result beside the pitch panel — legal MUSTs first, coverage counted honestly,
sources one fold away.

## Consequences

- The founder sells with the trade's legal MUSTs, funnel laws, price
  benchmarks and named competitors on screen, for all 35 trades.
- Every engine (website FAQs, ads keywords/negatives, GEO, the brain) now has
  one citable store to read instead of scattered per-module string tables.
  Migrating `pitch-intelligence` and `faq-content` to read from DNA is future
  work, deliberately not done here.
- Vol 3 (paid acquisition, GEO, reviews, GBP) is mined in a follow-up — the
  `paidAdvertising` platform section is empty until then, and the provenance
  law is why it is empty rather than plausible.
- Updating knowledge has a paper trail by construction: the diff shows the
  research change and the records that cite it, together.
