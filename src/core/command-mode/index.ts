/**
 * Command Mode v1 (ADR-052) — public API.
 *
 * Approval-gated execution with guardrail tiers as core architecture: a
 * policy-as-data catalogue of internal, reversible actions; an event-sourced
 * approval queue over the learning feed; a deterministic executor with
 * verify + full trace; and natural-command parsing that always lands as a
 * pending approval, never direct execution.
 */

export type {
  CommandActionDefinition,
  CommandActionId,
  CommandHistoryEntry,
  CommandOrigin,
  CommandOutcome,
  CommandOutcomeStatus,
  CommandPreview,
  CommandRequestRecord,
  CommandTrace,
  CommandTraceStep,
  GuardrailTier,
  PendingCommand,
  RejectedCommand,
} from "./model";
export { canBrainInitiate, requiresApproval } from "./model";

export {
  COMMAND_CATALOGUE,
  getCommandAction,
  isCommandActionId,
  latestEnquiryFor,
} from "./catalogue";

export { TIER_PROMOTED_KIND, effectiveTier } from "./tiers";

export {
  COMMAND_OUTCOME_KINDS,
  COMMAND_REJECTED_KIND,
  COMMAND_REQUESTED_KIND,
  deriveCommandHistory,
  derivePendingCommands,
  deriveRejectedCommands,
  findRequest,
} from "./queue";

export {
  executeCommand,
  type CommandExecutionDeps,
  type EmailDraftPayload,
} from "./executor";

export {
  parseCommand,
  validateParsedCommand,
  type CommandParseOutcome,
} from "./parse";
