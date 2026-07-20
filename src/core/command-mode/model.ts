/**
 * Command Mode v1 (ADR-052) — the contracts.
 *
 * The execution half of the Brain, behind the founder gate. Guardrail tiers
 * are core architecture: every executable action declares one, the catalogue
 * is policy-as-data (inspectable, testable), and every execution carries a
 * full trace. Nothing here touches an LLM; nothing executes without the
 * approval flow in `executor.ts`.
 */

import type { KnowledgeGraph } from "@/core/memory-spine";

/**
 * The guardrail tiers (the Brain constitution — see the guardrail section of
 * `core/brain-orchestrator/README.md`):
 * - `auto`: may run without a founder click. v1 policy: NO action holds this
 *   tier; promotion is a founder decision recorded in the learning feed.
 * - `recommend_first`: the Brain may propose it proactively; it runs only
 *   after founder approval.
 * - `approval_required`: only the founder initiates it, and it still
 *   requires explicit approval.
 */
export type GuardrailTier = "auto" | "recommend_first" | "approval_required";

/** The v1 catalogue — internal, reversible actions only. */
export type CommandActionId =
  | "create_next_action"
  | "append_business_note"
  | "draft_follow_up"
  | "update_build_item"
  | "delegate_recommendation";

/** Where a command request came from. */
export type CommandOrigin =
  | "ask-brain"
  | "recommendation"
  | "brain-workspace"
  | "mission-control";

/** The exact "what will happen" shown on the approval card. */
export interface CommandPreview {
  /** Concrete sentences — never a vague "do it". */
  lines: ReadonlyArray<string>;
  /** The business this concerns, when there is one. */
  businessId?: string;
}

/**
 * One catalogued action — policy as data. `validate`/`preview` read the
 * knowledge graph only (request-time honesty); the executor re-validates
 * against the spine at execution time.
 */
export interface CommandActionDefinition {
  id: CommandActionId;
  title: string;
  description: string;
  /** The declared guardrail tier (catalogue default; see effectiveTier). */
  tier: GuardrailTier;
  /** v1 constitution: every catalogued action is internal and reversible. */
  internal: true;
  reversible: true;
  /** Parameter spec, plain English (mirrors IntentDefinition.params). */
  params: Readonly<Record<string, string>>;
  examples: ReadonlyArray<string>;
  /** Problems that make the request unbuildable. Empty = valid. */
  validate(params: Record<string, unknown>, graph: KnowledgeGraph): string[];
  /** Only called on validated params. */
  preview(params: Record<string, unknown>, graph: KnowledgeGraph): CommandPreview;
}

/** A stored command request (the payload of a `command_requested` event). */
export interface CommandRequestRecord {
  requestId: string;
  actionId: CommandActionId;
  params: Record<string, unknown>;
  previewLines: ReadonlyArray<string>;
  /** Effective tier at request time — shown on the card. */
  tier: GuardrailTier;
  via: CommandOrigin;
}

/** One step of an execution, timestamped. */
export interface CommandTraceStep {
  label: string;
  at: string;
  detail?: string;
}

/**
 * The full trace every execution carries: who approved, when, what ran,
 * what changed, revert info where applicable (ADR-052).
 */
export interface CommandTrace {
  requestId: string;
  actionId: CommandActionId;
  approvedBy: string;
  approvedAt: string;
  startedAt: string;
  finishedAt: string;
  steps: ReadonlyArray<CommandTraceStep>;
  /** Plain-English record of what changed, one line per change. */
  changes: ReadonlyArray<string>;
  /** How to undo it — or an honest statement of what "undo" means here. */
  revert?: string;
}

export type CommandOutcomeStatus = "executed" | "failed" | "partial";

/** What an execution produced — appended to the learning feed verbatim. */
export interface CommandOutcome {
  status: CommandOutcomeStatus;
  trace: CommandTrace;
  /** Present on failed/partial: what failed and why. Never dressed up. */
  error?: string;
}

/** A pending approval card, derived from the feed (see queue.ts). */
export interface PendingCommand {
  requestId: string;
  actionId: CommandActionId;
  title: string;
  previewLines: ReadonlyArray<string>;
  tier: GuardrailTier;
  via: CommandOrigin;
  requestedAt: string;
  businessId?: string;
}

/** An executed/failed/partial entry in the history surface. */
export interface CommandHistoryEntry {
  requestId: string;
  actionId: CommandActionId;
  title: string;
  status: CommandOutcomeStatus;
  trace: CommandTrace;
  error?: string;
  occurredAt: string;
  previewLines: ReadonlyArray<string>;
}

/** A founder-declined request, kept in history for honesty. */
export interface RejectedCommand {
  requestId: string;
  actionId: CommandActionId;
  title: string;
  reason?: string;
  occurredAt: string;
  previewLines: ReadonlyArray<string>;
}

/** Does this tier gate execution behind an explicit founder approval? */
export function requiresApproval(tier: GuardrailTier): boolean {
  return tier !== "auto";
}

/** May the Brain create a request for this tier proactively? */
export function canBrainInitiate(tier: GuardrailTier): boolean {
  return tier === "recommend_first" || tier === "auto";
}
