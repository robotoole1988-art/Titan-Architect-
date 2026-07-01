/**
 * Brain Orchestrator — workflow contracts (interfaces only).
 *
 * A workflow is a named, ordered *description* of how the Brain coordinates a
 * goal (e.g. onboarding a new customer). It is not an execution engine: the
 * Brain turns a workflow into an execution plan and delegates the steps to
 * departments. No execution here.
 */

import type { BrainExtensions, BrainId } from "./common";
import type { DepartmentCapability } from "./department";

/** A single step in a workflow. */
export interface BrainWorkflowStep {
  id: BrainId;
  name: string;
  /** The capability this step is delegated to, when it is work. */
  capability?: DepartmentCapability;
  /** Steps that must precede this one. */
  dependsOn?: ReadonlyArray<BrainId>;
  description?: string;
  extensions?: BrainExtensions;
}

/**
 * A workflow template. Describes the ordered coordination for a goal; the Brain
 * plans it into tasks and delegates them. Example (customer onboarding):
 * `customer.created` → load Industry DNA → load Knowledge Kernel → determine
 * objectives → create execution plan → assign Website / Experience / SEO /
 * Google Ads / Research / Business Companion → monitor → collect → complete.
 */
export interface BrainWorkflow {
  id: BrainId;
  name: string;
  description?: string;
  /** What triggers this workflow, e.g. the "customer.created" event type. */
  trigger?: string;
  steps: ReadonlyArray<BrainWorkflowStep>;
  version: string;
  extensions?: BrainExtensions;
}
