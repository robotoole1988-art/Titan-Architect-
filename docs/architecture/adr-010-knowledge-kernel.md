# ADR-010: The TITAN Knowledge Kernel

- **Status:** Accepted
- **Date:** 2026-07-01
- **Deciders:** Robert O'Toole
- **Tags:** architecture, core, knowledge, foundation
- **Supersedes:** —
- **Superseded by:** —

## Context

TITAN Architect is an enterprise AI operating system. Its long-term value comes
from accumulating durable, structured knowledge about the world it operates in —
trades, locations, brands, customers, competitors, and marketing — and making
that knowledge available to every feature and, eventually, to the Brain.

Without a central knowledge layer, each feature would model and store this
knowledge in its own way. That fragments the data, duplicates effort, and makes
cross-feature intelligence (the entire point of the platform) impossible. We
need one place that owns the shape of knowledge and the contract for accessing
it — defined **before** any feature starts persisting domain data.

This ADR also formally introduces the **`core/` (kernel) layer** described in the
Architecture Charter, which until now existed only on paper.

## Decision

We introduce a new core module, **`src/core/knowledge-kernel`**, as the central
knowledge layer. For this iteration it is **interfaces only** — no
implementation, no AI APIs, no database, no business logic. It defines:

1. **Six DNA record contracts**, each extending a common `DnaRecord` base
   (system metadata: id, kind, label, revision, timestamps, provenance,
   confidence):
   `TradeDna`, `LocationDna`, `BrandDna`, `CustomerDna`, `CompetitorDna`,
   `MarketingDna`.

2. **A type-safe kind map** (`DnaByKind`, `DnaOf<K>`) tying each `DnaKind` to its
   record type, kept in lockstep with the `DnaKind` union.

3. **A clean public interface**, `KnowledgeKernel`, composed of a `KnowledgeReader`
   (`get`, `query`) and a `KnowledgeWriter` (`put`, `update`, `remove`), plus a
   `collection(kind)` handle for ergonomic per-kind access.

4. **A provider seam**, `KnowledgeKernelProvider`, through which features resolve
   the active kernel — they never import a concrete implementation.

Key design choices, made now so later additions are non-breaking:

- **Async-ready:** every operation returns a `Promise`, so a future local,
  database, or AI-backed implementation needs no contract change.
- **Pagination-ready:** queries return `{ records, total, nextCursor }`.
- **Provenance & confidence** fields are reserved on every record for future AI
  enrichment, but are inert data today.

Features depend on the kernel's public interface only (`@/core/knowledge-kernel`),
which the architecture boundary rules (ADR-008) already enforce for the `core`
layer.

## Consequences

### Positive
- One authoritative contract for platform knowledge; no per-feature divergence.
- Features can be written against a stable interface before any storage or
  intelligence exists.
- The async/pagination/provenance shape means storage and AI are additive later.
- Establishes the `core/` layer cleanly, with the kernel as its first citizen.

### Negative / Trade-offs
- Interfaces without an implementation cannot yet be exercised at runtime; their
  fit is validated by type-checking and by the first consumer, not by tests.
- The DNA field shapes are an early best guess and will evolve as real features
  use them. Evolving a published contract requires care (and, for breaking
  changes, a new ADR).

### Neutral
- A concrete kernel implementation, its storage strategy, and how the Brain
  consumes it are explicitly **out of scope** here and will each get their own ADR.

## Alternatives Considered

- **Let each feature own its knowledge** — fastest short-term, but fragments data
  and blocks cross-feature intelligence. Rejected; it defeats the platform's
  purpose.
- **Design storage/DB schema first** — premature; it couples the contract to a
  persistence choice we have not made. Rejected: interface first, storage later.
- **A single generic `Record`/untyped store** — simple but throws away type
  safety and domain meaning. Rejected in favour of typed, per-kind contracts.

## References

- `src/core/knowledge-kernel/` (the interfaces) and its `README.md`.
- `docs/architecture/architecture-charter.md` §1 (the `core/` layer) and §6
  (module homes).
- ADR-008 (boundary enforcement that governs the `core` layer).
