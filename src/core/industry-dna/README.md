# Industry DNA (`core/industry-dna`)

The **TITAN Industry DNA v1.0** specification: the complete, structured "genome"
of a UK trade business. It is the shared model every product engine and the
Brain read from, so intelligence is composable rather than fragmented.

> **Status: v1.0 — interfaces only.** No implementation, no data, no AI, no
> database, no UI. This module defines the schema; population and consumption
> come later, behind their own ADRs.

## The twelve sections

1. **Business Identity DNA** — trade, industry, business type, emergency/planned, residential/commercial, service area, average job value, CLV, sales cycle.
2. **Services DNA** — service categories, individual services, upsells, cross-sells, emergency services, premium services.
3. **Customer Psychology DNA** — motivations, pain points, buying triggers, fears, objections, trust factors, decision makers, urgency level.
4. **Website DNA** — site structure, landing pages, conversion strategy, CTAs, forms, images, video, animations, trust signals.
5. **Search & SEO DNA** — primary keywords, local SEO, Google Business Profile, content strategy, internal linking, schema, FAQ strategy, location pages.
6. **Paid Advertising DNA** — Google Ads, Local Services Ads, Meta Ads, audiences, offers, creatives, budget guidance, seasonal campaigns.
7. **Brand DNA** — personality, tone of voice, colour palette, typography, photography style, cinematic video style, 3D style, logo rules.
8. **Sales DNA** — lead qualification, phone scripts, appointment booking, follow-up, objection handling, closing strategy, review requests, referral strategy.
9. **Market Intelligence DNA** — competitors, pricing position, local demand, weather impact, seasonal trends, economic factors, housing trends, industry trends.
10. **Operations DNA** — job workflow, scheduling, team structure, vehicles, equipment, certifications, health & safety, service guarantees.
11. **Business Intelligence DNA** — KPIs, revenue metrics, conversion metrics, lead quality, customer retention, lifetime value, ROI metrics, AI recommendations.
12. **AI Behaviour DNA** — AI personality, decision rules, automation rules, confidence scoring, escalation rules, learning strategy, memory strategy, collaboration rules.

## Public interface

Import only from the package root (`@/core/industry-dna`):

```ts
import type { IndustryDna, ServicesDna } from "@/core/industry-dna";
```

`IndustryDna` composes all twelve section interfaces.

## Extensibility (required by design)

Every section supports future expansion, three ways:

- **`extensions?: DnaExtensions`** — an open bag on every section, list entry,
  and the root, for attributes not yet modelled.
- **`DnaList` entries** (`DnaEntry`) carry `label`, optional `value` /
  `description`, and their own `extensions`.
- **Interfaces**, not type aliases — sections can be widened via `extends` or
  declaration merging without a breaking change.

All fields are optional so a profile can be populated incrementally.

## Structure

```
industry-dna/
├── index.ts          # public API (type-only exports + spec version)
├── common.ts         # DnaEntry, DnaList, DnaSection, MonetaryAmount, enums
├── sections.ts       # the twelve section interfaces
└── industry-dna.ts   # the composed IndustryDna root + INDUSTRY_DNA_VERSION
```

## Relationship to the Knowledge Kernel

The Knowledge Kernel (`core/knowledge-kernel`, ADR-010) is the *access contract*
for knowledge. Industry DNA is the *rich domain schema* for a trade business.
Whether an `IndustryDna` is later stored and retrieved through the Kernel is
deferred to a future ADR.
