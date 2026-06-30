/**
 * Domain types for the Codex module.
 *
 * These are the canonical contracts for a Codex entry. They live in the
 * feature's model layer and are the source of truth for categories, statuses,
 * and the shape of an entry across the whole feature.
 */

export const CODEX_CATEGORIES = [
  "Vision",
  "Architecture",
  "AI Organisation",
  "Brain",
  "Directives",
  "PRDs",
  "Roadmap",
  "Decisions",
] as const;

export type CodexCategory = (typeof CODEX_CATEGORIES)[number];

export const CODEX_STATUSES = ["Draft", "Approved", "Deprecated"] as const;

export type CodexStatus = (typeof CODEX_STATUSES)[number];

export interface CodexEntry {
  id: string;
  title: string;
  category: CodexCategory;
  status: CodexStatus;
  /** Semantic-ish version string, e.g. "1.0.0". Free text for now. */
  version: string;
  /** ISO-8601 timestamp of the last update. System-managed. */
  updatedAt: string;
  content: string;
}

/**
 * The editable fields of an entry — everything except the system-managed
 * `id` and `updatedAt`. This is what create/update operations accept.
 */
export type CodexDraft = Omit<CodexEntry, "id" | "updatedAt">;
