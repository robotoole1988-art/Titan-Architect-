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
];
