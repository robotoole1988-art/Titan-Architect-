/**
 * TITAN Brain Orchestrator — public API.
 *
 * Interfaces only. No implementation, no AI, no LLM, no database, no network,
 * no UI, no business logic, no execution engine. The Brain is the CEO of the
 * platform: it Observes, Decides, Delegates, and Learns — it never performs the
 * work. Departments execute; the Brain coordinates.
 *
 * See docs/architecture/adr-015-brain-orchestrator.md and
 * docs/prd/prd-003-brain-orchestrator.md.
 *
 * This is the ONLY surface other modules may import from.
 */

export type {
  BrainExtensions,
  BrainId,
  Iso8601,
  Priority,
  WorkStatus,
  HealthLevel,
  BrainHealth,
  BrainMemoryReference,
  BrainEvent,
  BrainNotification,
} from "./common";

export type {
  DepartmentCapability,
  DepartmentIdentity,
  TaskContract,
  SupportedTask,
  DepartmentDependency,
  ExecutionMetadata,
  BrainDepartmentStatus,
  BrainDepartment,
  BrainDepartmentRegistry,
} from "./department";
export { WELL_KNOWN_CAPABILITIES } from "./department";

export type {
  BrainContext,
  BrainObservationInput,
  BrainObservation,
  BrainTask,
  BrainExecutionPlan,
  BrainDecision,
  BrainResult,
} from "./decision";

export type { BrainWorkflowStep, BrainWorkflow } from "./workflow";

export type {
  BrainMemoryEntry,
  BrainMemory,
  BrainCapabilityProviders,
  BrainDependencies,
} from "./dependencies";

export type {
  BrainStatus,
  BrainOrchestrator,
  BrainDepartmentRef,
  BrainOrchestratorFactory,
  BrainOrchestratorProvider,
} from "./orchestrator";
export { BRAIN_ORCHESTRATOR_VERSION } from "./orchestrator";

// ADR-050: the Decision Engine — ADR-015's contracts, implemented for real.
export {
  generateRecommendations,
  narrateRecommendation,
} from "./decision-engine";
export type {
  DecisionEngineInput,
  Recommendation,
  RecommendationConfidence,
  RecommendationRisk,
  RecommendationRuleId,
  RecommendationUrgency,
} from "./decision-engine";
