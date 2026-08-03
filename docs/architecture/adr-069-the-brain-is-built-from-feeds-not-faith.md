# ADR-069 — The brain is built from feeds, not faith

- **Status:** Proposed
- **Date:** 2026-08-03
- **Prompted by:** the founder's vision brief of 2026-08-02 ("all seeing, all knowing, always learning… hundreds of agents… departments") and the long-ticketed instruction to write the brain down
- **Builds on:** ADR-011 (Industry DNA), ADR-059 (verifiable facts only), ADR-067 (knowledge is sourced or silent)

## Context

The vision: TITAN as the future of marketing — a brain that knows
everything about marketing, sites, ads, SEO, GEO and every trade it serves;
department agents for marketing, sales, operations, finance, customer
relations; reports, predictions, meetings; always learning.

The danger in that sentence is not ambition, it is sequence. Agents are
cheap to declare and worthless without data; a learning system that cannot
cite what it learned becomes a liar at scale, and TITAN's entire market
position is being the one that does not lie. The brain therefore gets a
constitution before it gets headcount.

## Decision

The brain is three things, built in this order, each honest by
construction:

1. **Memory — the knowledge base (exists).** `core/industry-dna` under
   ADR-067's laws: sourced or silent, exact-id resolution, no silent gaps.
   Everything the brain "knows" lives here or in a store with the same
   provenance discipline. New knowledge arrives as research documents plus
   records citing them — never as facts typed from nowhere.

2. **Senses — the feeds.** A department may not exist until its feed does.
   The feed inventory, in build order: first-party site metrics (exists),
   enquiries and response times (exists), Lighthouse fleet results (exists),
   call events and recordings (queue item 5), Google Ads performance (blocked
   on API access), GBP data, review velocity, search visibility. Every feed
   lands as timestamped records a human can audit.

3. **Judgment — proposals, never fiats.** The brain's output is a decision
   PROPOSAL with the working shown — the same shape as the campaign plan's
   budget ("with the working shown") and the media gate (founder
   approve/reject). Autonomy is earned per decision type: a decision class
   may only become automatic after its proposals have a written track record
   the founder has reviewed. The brain inherits the honesty laws in full:
   every number in a proposal traces to a feed record; every knowledge claim
   traces to the knowledge base; predictions are labelled estimates with
   their inputs named (the CPL estimate card's provenance pattern,
   generalised).

**A department is a ledger, not a lobby.** Marketing, sales, operations,
finance and the rest become real one at a time, and each requires: (a) its
feed live, (b) its owned metrics defined, (c) its proposal types specified,
(d) its paper trail (reports the founder actually reads). "Hundreds of
agents" is a rendering detail; the constitution is feeds → metrics →
proposals → trust.

## Consequences

- The flagship site's honesty map (ALIVE vs FORMING departments) and this
  ADR describe the same object; the marketing and the architecture cannot
  drift apart without a test noticing.
- Queue order is unchanged and now justified in writing: call tracking and
  Ads API access are not features beside the brain — they are its next two
  sense organs.
- "Company meetings with agents" and prediction surfaces are downstream of
  reports-the-founder-reads; they arrive as views over the paper trail, not
  as theatre.
- The first three departments to reach ALIVE, by feed readiness: Site
  Quality (Lighthouse fleet — feed exists today), Speed-to-Lead (enquiries +
  calls once item 5 ships), Acquisition (once the Ads API unlocks). Each
  gets its own small ADR when its proposal types switch on.
