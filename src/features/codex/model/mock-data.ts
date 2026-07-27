import type { CodexEntry } from "./types";

/**
 * Seed data for the Codex (v0.1).
 *
 * This is mock/local content only — there is no database yet. The store seeds
 * itself from this list on first load and then persists changes to
 * localStorage. Replacing this with a real data source later is a change to the
 * store/api layer alone; the rest of the feature is unaffected.
 */
export const MOCK_CODEX_ENTRIES: CodexEntry[] = [
  {
    id: "codex-vision",
    title: "TITAN Vision",
    category: "Vision",
    status: "Approved",
    version: "1.0.0",
    updatedAt: "2026-06-30T09:00:00.000Z",
    content:
      "TITAN Architect is the internal operating system used to design, manage and evolve every product within the TITAN ecosystem.\n\nIt is not a website builder. It is not a CRM. It is the software responsible for planning, documenting and coordinating the development of TITAN.",
  },
  {
    id: "codex-architecture-charter",
    title: "Architecture Charter",
    category: "Architecture",
    status: "Approved",
    version: "1.0.0",
    updatedAt: "2026-06-30T12:00:00.000Z",
    content:
      "The binding rules of the codebase: a layered model with downward-only dependencies, feature isolation via public entry points, and fixed homes for future modules. Changes to these rules require an ADR.",
  },
  {
    id: "codex-ai-organisation",
    title: "AI Organisation Model",
    category: "AI Organisation",
    status: "Draft",
    version: "0.2.0",
    updatedAt: "2026-06-29T15:30:00.000Z",
    content:
      "How the autonomous workforce is structured: roles, responsibilities, and how AI Employees collaborate to build and maintain TITAN.",
  },
  {
    id: "codex-brain",
    title: "The Brain — Central Intelligence Layer",
    category: "Brain",
    status: "Draft",
    version: "0.1.0",
    updatedAt: "2026-06-28T10:15:00.000Z",
    content:
      "The Brain is the central intelligence layer: orchestration, agent runtime, planning and shared memory. It lives in core/brain and is built on top of the core/ai engine. Features call into the Brain through its public API.",
  },
  {
    id: "codex-directive-001",
    title: "DIRECTIVE-001 — Enterprise Foundation",
    category: "Directives",
    status: "Approved",
    version: "1.0.0",
    updatedAt: "2026-06-30T13:45:00.000Z",
    content:
      "Build an enterprise-grade foundation that future development sits on. Optimise for scalability, maintainability, modularity and long-term growth. Prefer clean architecture over rapid implementation. No shortcuts.",
  },
  {
    id: "codex-prd-codex",
    title: "PRD — Codex Module v0.1",
    category: "PRDs",
    status: "Draft",
    version: "0.1.0",
    updatedAt: "2026-07-01T08:00:00.000Z",
    content:
      "The first real feature of TITAN Architect: a Codex to capture company knowledge. v0.1 covers list, detail and create/edit UI with local data only — no database yet.",
  },
  {
    id: "codex-roadmap",
    title: "Platform Roadmap",
    category: "Roadmap",
    status: "Draft",
    version: "0.3.0",
    updatedAt: "2026-06-27T16:20:00.000Z",
    content:
      "What TITAN is building next, in priority order. The roadmap is a living document and is reviewed as directives are completed.",
  },
  {
    id: "codex-decision-base-ui",
    title: "Decision — Base UI Composition",
    category: "Decisions",
    status: "Deprecated",
    version: "0.9.0",
    updatedAt: "2026-06-26T11:00:00.000Z",
    content:
      "Superseded note retained for history: the component stack composes with Base UI's render prop rather than Radix's asChild. See ADR-007 for the authoritative record.",
  },
  {
    id: "codex-directive-performance-law",
    title: "DIRECTIVE — Published Sites Performance Law",
    category: "Directives",
    status: "Approved",
    version: "1.0.0",
    updatedAt: "2026-07-27T08:00:00.000Z",
    content:
      "Every site TITAN publishes scores ≥95 mobile Lighthouse performance (target 100), median of three throttled runs, before it may go live — and stays there for life. Enforced, not intended: byte budgets (JS ≤130KB gz, initial transfer ≤700KB), the JS law (client components on leaves only, framer-motion banned from the renderer, motion is CSS), the media law (Ken Burns AVIF hero by default, film ≤2.5MB AV1 as the premium exception, poster is always the LCP), static serving of published snapshots, Lighthouse CI on every renderer PR, a publish gate that rejects failing builds, and a nightly fleet sampler. Full text: docs/experience/PUBLISHED-SITES-PERFORMANCE-LAW.md.",
  },
  {
    id: "codex-research-vol1-site-excellence",
    title: "Research Vol 1 — Site Excellence",
    category: "Brain",
    status: "Approved",
    version: "1.0.0",
    updatedAt: "2026-07-26T21:00:00.000Z",
    content:
      "Top-1% front-end engineering and trade-site conversion research. Headlines: the video law (≤2.5MB AV1 loops, poster-first LCP, Ken Burns default); universal front-end laws (JS ≤130KB gz, CSS motion, AVIF-first images, immutable cache headers); universal conversion laws (single dominant CTA, sticky call bar, 3–5 field forms, real reviews with name+town+date, guide-from pricing with finance framing, speed-to-lead automation); compliance MUSTs for dental (GDC/CQC/ASA) and solar (MCS/RECC); enforcement via Lighthouse CI and publish gates. Full text: docs/research/2026-07-26-site-excellence-dossier.md.",
  },
  {
    id: "codex-research-vol2-trade-playbooks",
    title: "Research Vol 2 — Trade Playbooks (all trades)",
    category: "Brain",
    status: "Approved",
    version: "1.0.0",
    updatedAt: "2026-07-26T21:18:00.000Z",
    content:
      "Per-trade playbooks for every trade in the intake dropdown (~35): design voice, proof elements that convert, per-trade legal and certification MUSTs, and the platform layer that applies across all of them. The blueprint builder should reference these laws by section so every generated strategy obeys them. Full text: docs/research/2026-07-26-trade-playbooks-vol2.md.",
  },
  {
    id: "codex-research-vol3-design-acquisition",
    title: "Research Vol 3 — Design Craft & Customer Acquisition",
    category: "Brain",
    status: "Approved",
    version: "1.0.0",
    updatedAt: "2026-07-26T22:03:00.000Z",
    content:
      "Design craft: prototypicality law (refine the familiar, ≤1 signature element per page), OKLCH one-hex-in/accessible-theme-out token pipeline, Utopia fluid type, the imagery triad with three-tier photo treatment, wordmark identity generation, WCAG 2.2 AA baked in. Acquisition: Google LSAs (emergency trades first, ~£10–30/lead), Search ads discipline (one campaign per service line, CPL ≤10–15% of job value, PMax default-no), SEO/GEO (AI visibility = rankings + reviews + branded mentions; no separate GEO product), reviews law (DMCC Act: gating illegal in the UK; velocity beats bursts), Meta hierarchy (visual-transformation trades primary, emergency skip, 6+ creatives monthly, sub-60s speed-to-lead). Full text: docs/research/2026-07-26-design-and-acquisition-dossier-vol3.md.",
  },
];
