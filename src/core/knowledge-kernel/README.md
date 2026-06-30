# Knowledge Kernel (`core/knowledge-kernel`)

The TITAN Knowledge Kernel is the central knowledge layer of the platform. It is
the single, clean interface through which **every future feature stores and
retrieves knowledge** about the world TITAN operates in.

> **Status: v0 — interfaces only.** No implementation, no AI, no database, no
> business logic. This module defines the contract; intelligence and storage are
> layered on later, behind their own ADRs, without changing this surface.

## What it models — the six DNA types

| DNA | Contract | Captures |
| --- | --- | --- |
| Trade DNA | `TradeDna` | A trade / vertical: services, vocabulary, seasonality, compliance. |
| Location DNA | `LocationDna` | A geographic market: area, demographics, market notes. |
| Brand DNA | `BrandDna` | A brand's positioning, voice, values, visual identity. |
| Customer DNA | `CustomerDna` | A segment/persona: needs, pain points, channels. |
| Competitor DNA | `CompetitorDna` | A competitor's positioning, strengths, weaknesses. |
| Marketing DNA | `MarketingDna` | Channels, messaging themes, observed patterns. |

## Public interface

Import only from the package root (`@/core/knowledge-kernel`):

```ts
import type { KnowledgeKernel, TradeDna } from "@/core/knowledge-kernel";

// Every feature queries the kernel through this clean, type-safe surface.
async function example(kernel: KnowledgeKernel) {
  const trade = await kernel.get("trade", "trade_plumbing"); // TradeDna | null
  const results = await kernel.query("competitor", { search: "roofing" });
  // ergonomic per-kind handle:
  const brands = kernel.collection("brand");
}
```

- `get(kind, id)` / `query(kind, query)` — read.
- `put` / `update` / `remove` — write.
- `collection(kind)` — a type-safe handle to one DNA collection.

All methods are `Promise`-returning so a future local, database, or AI-backed
implementation can be async without changing callers.

## Structure

```
knowledge-kernel/
├── index.ts             # public API (the only import surface)
├── common.ts            # ids, kinds, metadata, query/result/draft contracts
├── dna.ts               # the six DNA record interfaces + DnaByKind map
└── knowledge-kernel.ts  # reader/writer/collection/kernel interfaces
```

## Design notes

- **Type-safe by kind.** `DnaKind` and `keyof DnaByKind` are kept in lockstep,
  so `kernel.get("trade", …)` resolves to `TradeDna`.
- **Provider seam.** Features obtain the kernel via `KnowledgeKernelProvider`;
  they never import a concrete implementation.
- **Async-ready, pagination-ready** from day one, so adding storage/AI later is
  additive, not breaking.
