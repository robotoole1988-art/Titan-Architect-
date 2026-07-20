# ADR-049 — Internal-business flag: test data out of the Brain, recoverably

- **Status:** Accepted
- **Date:** 2026-07-20
- **Builds on:** ADR-023 (Business Spine), ADR-046 (memory spine), ADR-048
  (Ask the Brain, which surfaced the problem)

## Context

Ask the Brain's first live answers exposed 34 leftover "TITAN Morph Lab
(internal)" businesses — environments created by the retired morph-lab seam
(ADR-035/038, retired by ADR-041) — polluting every pipeline count and
neglected-leads answer. Hard-deleting history is not the TITAN way; inventing
per-surface filters would scatter the rule.

## Decision

One boolean on the Business record: **`internal`** (core contract change —
hence this short ADR).

- **Creation guard:** `create()` sets it automatically when the name declares
  itself internal (`isInternalBusinessName`: "(internal)"/"(test)" suffixes or
  the TITAN lab convention — conservative on purpose, bare words like
  "Internal Comfort Heating Ltd" never match), and callers may set it
  explicitly.
- **One exclusion choke point:** `loadMemorySnapshot` filters internal
  businesses by default, so every Brain surface (Mission Control, Ask the
  Brain, and whatever reads the spine next) is clean automatically;
  `includeInternal: true` exists for diagnostics. The CRM reads repositories
  directly and still shows everything — findable, recoverable.
- **The 34 lab records** are backfilled `internal = true` by exact name in the
  migration and moved to the recoverable lost stage `not_going_ahead` with an
  archive reason (stage history + activity log record the transition; nothing
  is deleted).

## Consequences

Brain surfaces report only real business; test data remains inspectable and
reversible in the CRM's lost bucket; future lab/test seams are guarded at the
front door. Watch-list: the exclusion applies at the SNAPSHOT, so a consumer
reading repositories directly must decide its own policy — by design.
