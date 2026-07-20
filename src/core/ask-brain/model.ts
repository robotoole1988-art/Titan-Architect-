/**
 * Ask the Brain v1 (ADR-048) — the contracts.
 *
 * Doctrine: deterministic first, LLM second, honesty always. The intent
 * catalog answers named questions from the memory spine with real records;
 * the reasoner seam lets an LLM map free phrasing onto that catalog and
 * narrate results — never invent them.
 */

import type { EntityRef, KnowledgeGraph, Observation } from "@/core/memory-spine";

/** Everything an intent may read. Read-only by construction. */
export interface AskContext {
  graph: KnowledgeGraph;
  observations: ReadonlyArray<Observation>;
  /** Injectable clock — deterministic surfaces, deterministic tests. */
  now: string;
}

/** One record of evidence behind an answer: a real thing, linked. */
export interface EvidenceRecord {
  label: string;
  detail?: string;
  /** App link to the record (e.g. /crm/<id>, /sites/<slug>). */
  href: string;
  ref: EntityRef;
  /** Where this fact came from (spine provenance). */
  provenance: string;
}

/** What running one intent produced. */
export interface IntentResult {
  intentId: string;
  params: Record<string, unknown>;
  /** Deterministic template summary — always safe to show. */
  summary: string;
  records: EvidenceRecord[];
  /** True when the spine honestly has nothing — never dressed up. */
  isEmpty: boolean;
  /** How the result was derived (query description, thresholds). */
  derivation: string;
}

/** One named deterministic intent. */
export interface IntentDefinition {
  id: string;
  title: string;
  description: string;
  /** Parameter spec, shown to the LLM parser verbatim. */
  params: Readonly<Record<string, string>>;
  examples: ReadonlyArray<string>;
  run(context: AskContext, params: Record<string, unknown>): IntentResult;
}

/** What the deterministic parser concluded about a question. */
export type ParseOutcome =
  | { kind: "intent"; intentId: string; params: Record<string, unknown> }
  | {
      kind: "ambiguous";
      intentId: string;
      question: string;
      candidates: ReadonlyArray<{ id: string; name: string }>;
    }
  | null;

/** How sure the Brain is, honestly derived from HOW it understood you. */
export type BrainConfidence = "high" | "medium" | "low";

/** The complete answer the surface renders. */
export interface BrainAnswer {
  question: string;
  answer: string;
  confidence: BrainConfidence;
  intentId?: string;
  records: EvidenceRecord[];
  /** Plain-English account of how the answer was derived. */
  derivation: string;
  isEmpty: boolean;
}

/**
 * The LLM seam. Two jobs only: map phrasing onto the catalog, narrate
 * already-resolved results. It never sees the database and its parse output
 * is validated before anything runs.
 */
export interface BrainReasoner {
  parseIntent(
    question: string,
    catalog: ReadonlyArray<IntentDefinition>,
  ): Promise<{ intentId: string; params: Record<string, unknown> } | null>;
  composeAnswer(input: {
    question: string;
    result: IntentResult;
  }): Promise<string | null>;
}
