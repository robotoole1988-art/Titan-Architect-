/**
 * Ask the Brain v1 (ADR-048) — public API.
 *
 * Deterministic-first universal search over the memory spine: a named intent
 * catalog, a pattern parser, and an ask engine with the LLM behind a seam.
 * Read-only by construction — answers and evidence, never actions.
 */

export type {
  AskContext,
  BrainAnswer,
  BrainConfidence,
  BrainReasoner,
  EvidenceRecord,
  IntentDefinition,
  IntentResult,
  ParseOutcome,
} from "./model";

export { INTENT_CATALOG, runIntent } from "./intents";
export {
  parseQuestion,
  resolveBusinessByName,
  type BusinessResolution,
} from "./parse";
export { askBrain, deterministicReasoner } from "./ask";
export { brainReasonerBackend, resolveBrainReasoner } from "./provider";
