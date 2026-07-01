/**
 * Brain Orchestrator — dependency inversion (interfaces only).
 *
 * The Brain depends on **abstractions, never concrete implementations.** This
 * file declares the ports the Brain is wired with; a runtime injects real ones
 * later. The Brain coordinates the existing Core modules through these
 * abstractions — it never imports or constructs concrete implementations, and
 * it never invokes execution engines directly (a CEO does not operate the tools).
 */

import type { KnowledgeReader } from "@/core/knowledge-kernel";
import type { ExperienceEngine } from "@/core/experience-engine";
import type { ExperiencePipeline } from "@/core/experience-pipeline";
import type { ExperienceStrategyGenerator } from "@/core/experience-strategy";
import type { BrainExtensions, BrainMemoryReference } from "./common";
import type { BrainDepartmentRegistry } from "./department";

/** An entry the Brain records to memory (Learn). */
export interface BrainMemoryEntry {
  /** e.g. "decision" | "outcome" | "learning". */
  kind: string;
  summary: string;
  data?: Readonly<Record<string, unknown>>;
  extensions?: BrainExtensions;
}

/**
 * The Brain's memory port. Where the Brain records what it learns. The Brain
 * owns this abstraction; a concrete store is injected later. No database here —
 * it returns references, never raw storage.
 */
export interface BrainMemory {
  record(entry: BrainMemoryEntry): Promise<BrainMemoryReference>;
  reference(id: string): Promise<BrainMemoryReference | null>;
}

/**
 * Abstractions of the existing Core engines the platform's **departments** build
 * on. They are provided to departments — **the Brain never calls them directly.**
 * Listed here (as interfaces, never implementations) to make the platform's
 * current capability surface explicit and injected via dependency inversion.
 * New capabilities arrive as new departments, so this never blocks scale.
 */
export interface BrainCapabilityProviders {
  readonly experienceEngine?: ExperienceEngine;
  readonly experiencePipeline?: ExperiencePipeline;
  readonly experienceStrategy?: ExperienceStrategyGenerator;
}

/**
 * The abstractions the Brain is wired with. The Brain depends on these
 * interfaces, never on concrete implementations. Departments are added through
 * the registry, so the Brain scales to hundreds of departments unchanged.
 */
export interface BrainDependencies {
  /** Read access to platform knowledge — the Knowledge Kernel abstraction. */
  readonly knowledge: KnowledgeReader;
  /** The departments the Brain delegates to. */
  readonly departments: BrainDepartmentRegistry;
  /** Where the Brain records what it learns. */
  readonly memory: BrainMemory;
  /** Current foundational capability providers (consumed via departments). */
  readonly capabilities?: BrainCapabilityProviders;
}
