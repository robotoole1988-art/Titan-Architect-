import type { Directive } from "./types";

/**
 * Seed data for the Directives module (v0.1).
 *
 * Mock/local content only — no database. The store seeds itself from this list
 * on first load and then persists changes to localStorage.
 */
export const MOCK_DIRECTIVES: Directive[] = [
  {
    id: "directive-001",
    title: "Enterprise Foundation",
    number: "DIRECTIVE-001",
    status: "Completed",
    priority: "Critical",
    product: "TITAN Architect",
    objective:
      "Build an enterprise-grade foundation that all future development sits on.",
    requirements:
      "Modern React framework (Next.js) with TypeScript, clean layered architecture, dark theme by default, left navigation and top command bar, authentication-ready seam, placeholder pages.",
    acceptanceCriteria:
      "App builds and runs; the shell renders on every protected page; no business logic in the routing layer; architecture documented.",
    createdAt: "2026-06-30T09:00:00.000Z",
    updatedAt: "2026-06-30T13:45:00.000Z",
  },
  {
    id: "directive-002",
    title: "Architecture Governance",
    number: "DIRECTIVE-002",
    status: "Completed",
    priority: "High",
    product: "TITAN Architect",
    objective:
      "Protect the architecture with documented decisions and automated guardrails.",
    requirements:
      "An ADR system and Architecture Charter; ESLint boundary enforcement; a CI quality gate on every push and pull request; branch protection on main.",
    acceptanceCriteria:
      "Boundary violations fail lint; CI runs lint, type-check and build on every PR; main cannot be merged with a failing check.",
    createdAt: "2026-06-30T12:00:00.000Z",
    updatedAt: "2026-07-01T08:30:00.000Z",
  },
  {
    id: "directive-003",
    title: "Codex Module v0.1",
    number: "DIRECTIVE-003",
    status: "Completed",
    priority: "Medium",
    product: "TITAN Architect",
    objective:
      "Ship the first real feature: capture company knowledge as versioned Codex entries.",
    requirements:
      "List, detail and create/edit UI; local data only (no database); categories and statuses; respect architecture boundaries.",
    acceptanceCriteria:
      "All screens work with local data; entries persist across refresh; feature code stays inside src/features/codex.",
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-01T09:15:00.000Z",
  },
  {
    id: "directive-004",
    title: "Knowledge Kernel Architecture",
    number: "DIRECTIVE-004",
    status: "In Progress",
    priority: "High",
    product: "TITAN Brain",
    objective:
      "Define the central knowledge layer every future feature queries through.",
    requirements:
      "A core/knowledge-kernel module, interfaces only, covering the six DNA types. No AI, no database, no business logic yet.",
    acceptanceCriteria:
      "A clean public interface exists; type-safe access by kind; documented in an ADR.",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:45:00.000Z",
  },
  {
    id: "directive-005",
    title: "Command Centre Shell",
    number: "DIRECTIVE-005",
    status: "Draft",
    priority: "Low",
    product: "TITAN Command Centre",
    objective:
      "Plan the operational control surface for running the TITAN ecosystem.",
    requirements:
      "To be defined — high-level scope only at this stage.",
    acceptanceCriteria:
      "A first specification is drafted and reviewed.",
    createdAt: "2026-07-01T11:00:00.000Z",
    updatedAt: "2026-07-01T11:00:00.000Z",
  },
];
