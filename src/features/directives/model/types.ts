/**
 * Domain types for the Directives module.
 *
 * The source of truth for a directive's shape, plus the closed sets of
 * statuses, priorities, and products. These live in the feature's model layer.
 */

export const DIRECTIVE_STATUSES = [
  "Draft",
  "Approved",
  "In Progress",
  "Completed",
  "Deprecated",
] as const;

export type DirectiveStatus = (typeof DIRECTIVE_STATUSES)[number];

export const DIRECTIVE_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export type DirectivePriority = (typeof DIRECTIVE_PRIORITIES)[number];

export const DIRECTIVE_PRODUCTS = [
  "TITAN Architect",
  "TITAN Brain",
  "TITAN Command Centre",
  "TITAN Client App",
  "TITAN Website Engine",
  "TITAN Ads Engine",
  "TITAN SEO Engine",
] as const;

export type DirectiveProduct = (typeof DIRECTIVE_PRODUCTS)[number];

export interface Directive {
  id: string;
  title: string;
  /** Human directive number, e.g. "DIRECTIVE-001". */
  number: string;
  status: DirectiveStatus;
  priority: DirectivePriority;
  product: DirectiveProduct;
  /** What this directive sets out to achieve. */
  objective: string;
  /** What must be built (free text / multi-line for v0.1). */
  requirements: string;
  /** How we know it is done (free text / multi-line for v0.1). */
  acceptanceCriteria: string;
  /** ISO-8601 timestamps. System-managed. */
  createdAt: string;
  updatedAt: string;
}

/**
 * The editable fields of a directive — everything except system-managed
 * `id`, `createdAt`, and `updatedAt`.
 */
export type DirectiveDraft = Omit<Directive, "id" | "createdAt" | "updatedAt">;
