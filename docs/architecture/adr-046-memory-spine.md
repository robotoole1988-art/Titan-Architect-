# ADR-046 — Memory Spine v1: the knowledge-graph substrate

- **Status:** Accepted
- **Date:** 2026-07-08
- **Implements:** ADR-010 (Knowledge Kernel — until now, interfaces only)
- **Builds on:** ADR-023 (Business Spine), ADR-024/026 (CRM), ADR-025 (Market
  Intelligence), ADR-027 (Publishing), ADR-030 (Measurement), ADR-033 (Media),
  ADR-042 (Mission Control)

## Context

The state audit was blunt: the memory spine did not exist. The Business Spine
(ADR-023) persists records and artifacts; the Knowledge Kernel (ADR-010) was a
contract with no implementation. Yet every Brain function on the roadmap — Ask
the Brain, the Decision Engine, the Health Engine, Future Mode, Time Machine,
Command Mode — and every coordinated AI department needs the same two things:

1. a **knowledge graph** over the business entities we already hold, with the
   relationships between them modelled explicitly enough for multi-hop
   traversal, and
2. a **learning feed** — an append-only log of observations, decisions, and
   outcomes that intelligence can write back to and later learn from.

This is the substrate the entire AI phase builds on. v1 is deliberately a
foundation: structured graph + traversal + feed, no LLM reasoning, no
embeddings, no predictions, no new external service.

## Decision

### One new core module: `core/memory-spine`

**The graph is DERIVED, never duplicated.** `loadMemorySnapshot(repos)` reads
the existing Business Spine repositories (businesses, enquiries, deals and
campaign plans from artifacts, builds, publications, metrics, media, activity)
into a plain snapshot; `buildKnowledgeGraph(snapshot)` is a **pure,
deterministic** function that turns it into typed nodes and edges. There is no
second store of entity data and therefore no synchronisation problem: the
Business Spine remains the single source of truth, and the graph is a view of
it. This honours the Shared Intelligence Law — one shared layer; every
consumer sees the same graph.

**Nodes** (`kind:id` refs, each carrying its full source record):
`business`, `enquiry`, `deal`, `build`, `site` (publication), `campaign`,
`metric-day`, `media-asset`, `activity`, `market` (CPL estimate).

**Edges** — one per REAL foreign key, nothing else:

| Edge | Derived from |
| --- | --- |
| business —`has_enquiry`→ enquiry | `enquiry.businessId` |
| enquiry —`captured_by`→ site | `enquiry.publicationId` |
| business —`has_deal`→ deal | deal artifact `businessId` |
| business —`has_campaign`→ campaign | campaign_plan artifact `businessId` |
| business —`has_build`→ build | `build.businessId` |
| business —`published`→ site | `publication.businessId` |
| business —`measured`→ metric-day | `siteMetric.businessId` |
| business —`has_media`→ media-asset | `media.businessId` |
| business —`logged`→ activity | `activity.businessId` |
| business —`in_market`→ market | trade + location via a MarketDataProvider (optional, provider named in provenance) |

**Honesty rules.** No fabricated relationships: an edge exists only when both
endpoints exist in the snapshot (a dangling foreign key produces no edge and is
reported in the graph's integrity notes, never invented around). Every node and
edge carries provenance — the source table/artifact and record id. Notably
there is **no** enquiry→deal edge: the data model does not link them, so the
graph does not pretend to; "enquiries → deals for business X" resolves through
the business hub, which is the truthful shape of the data. Metrics attach to
the business (their true key); "measurement for site Y" is the multi-hop
site→business→metric-day traversal.

**Query API.** `getNode`, `neighbors` (direction + edge-kind filter), and
`traverse` (multi-hop along an edge-kind path), plus named, rule-based
resolvers built on them: `leadsNotContacted({days, now})`,
`enquiriesAndDealsFor(businessId)`, `measurementForSite(slug)`,
`promisesFor(businessId, observations)`. Deterministic given the same graph
and clock.

**Learning feed.** An append-only `Observation` log: what happened, the
decision taken, the outcome — with kind, optional business/subject refs,
structured payload, and source. The interface exposes `append` and `list`
only; there is no update or delete, by design. "Promises" are structured
observations (`kind: "promise"`), which is what makes the promise query
resolvable without any free-text interpretation. Backings: in-memory (tests)
and Supabase (`observations` table), resolved through the same
environment-selected provider pattern as the Business Spine.

### The Knowledge Kernel (ADR-010) becomes real

`createKnowledgeKernel(store)` implements the full ADR-010 contract —
type-safe per-kind collections, CRUD, revision increments, metadata and
provenance management, and query (label search, shallow field filters, limit +
cursor pagination) — over a store seam with in-memory and Supabase
(`knowledge_records` table) backings. The kernel is where distilled knowledge
(trade/location/brand/customer/competitor/marketing DNA) lives; the memory
spine's graph is where operational entities and their relationships live; the
learning feed is how experience accumulates. Together they are the memory
substrate the Brain and the AI departments build on.

### Mission Control is the first real consumer

`resolve-briefing.ts` was written (ADR-042) as the seam to re-point, and this
milestone re-points it: snapshot → graph → `projectMissionControlData(graph)`
→ the unchanged pure briefing engine. The projection is proven equal to the
old direct reads by a regression test, so the briefing surface behaves
identically — the point is that the Brain's first surface now reads through
the spine, exactly like every future surface will.

## Consequences

**Positive** — the Brain has a substrate: multi-hop questions over real
relationships resolve today, deterministically; the learning feed gives every
future department a place to record what it did and what happened; one shared
layer, no private copies; no new dependency, no new external service.

**Negative / watch-list** — the graph is rebuilt per read (founder-scale data;
fine now, revisit caching when node counts demand it); v1 is structured-only —
free-text questions ("mentioned expanding") need the deferred embedding
provider decision (v2); the kernel starts empty — nothing populates DNA
records yet (that is Ask the Brain / departments, later milestones).

## Out of scope (explicitly deferred)

LLM reasoning (Ask the Brain), semantic/embedding retrieval, predictions,
specialist departments, any new external service or key.

## Verification

- Graph construction, traversal, named queries, feed append/list, and kernel
  CRUD/query covered by deterministic tests (memory backings).
- The named example queries resolve via the spine in tests.
- Mission Control re-pointed and regression-proven (projection === direct
  reads; briefing unchanged), verified live in the browser on a restarted dev
  server.
- Migration applied via the new CLI workflow (`supabase link` +
  `supabase db push`, token-auth, no SQL-editor hand-pasting — see
  [docs/MIGRATIONS.md](../MIGRATIONS.md)); the push also reconciled
  `20260710_media_v1`'s missing bookkeeping row (idempotent no-op re-run).
- Live probe against the real project: one observation appended to the live
  feed (the milestone's own record — the feed's first entry) and one knowledge
  record round-tripped (put → get → query → remove) on `knowledge_records`.
- Gates + CI green.
