/**
 * The learning feed (ADR-046): an APPEND-ONLY log of observations — what
 * happened, the decision taken, the outcome. Brain functions and departments
 * write back here; nothing updates or deletes. This is the substrate future
 * learning distils from.
 */

import type { EntityRef } from "./model";

/** One recorded observation. Immutable once appended. */
export interface Observation {
  id: string;
  /** Open vocabulary: "promise", "decision", "outcome", "note", ... */
  kind: string;
  /** ISO-8601 — when the observed thing happened. */
  occurredAt: string;
  /** The business this concerns, when there is one. */
  businessId?: string;
  /** A specific graph entity this concerns, when there is one. */
  subject?: EntityRef;
  /** Plain-English record of what happened / was decided / was promised. */
  summary: string;
  /** Structured detail (e.g. a promise's dueBy). */
  payload?: Record<string, unknown>;
  /** Structured result, recorded when known. */
  outcome?: Record<string, unknown>;
  /** Who wrote it: "mission-control", "founder", a department id... */
  source: string;
}

export type ObservationDraft = Omit<Observation, "id" | "occurredAt"> & {
  /** Optional explicit time (backfilling honestly); defaults to now. */
  occurredAt?: string;
};

export interface ObservationFilter {
  businessId?: string;
  kind?: string;
  limit?: number;
}

/** Append-only by contract: there is no update and no remove. */
export interface LearningFeed {
  append(draft: ObservationDraft): Promise<Observation>;
  /** Newest first (by occurredAt). */
  list(filter?: ObservationFilter): Promise<Observation[]>;
}

function clone(observation: Observation): Observation {
  return structuredClone(observation);
}

/** In-memory feed — tests and the memory persistence backend. */
export function createMemoryLearningFeed(): LearningFeed {
  const entries: Observation[] = [];
  let counter = 0;
  return {
    async append(draft) {
      counter += 1;
      const stored: Observation = {
        ...structuredClone(draft),
        id: `obs-${counter}`,
        occurredAt: draft.occurredAt ?? new Date().toISOString(),
      };
      entries.push(stored);
      return clone(stored);
    },
    async list(filter = {}) {
      let found = entries.filter(
        (entry) =>
          (filter.businessId === undefined || entry.businessId === filter.businessId) &&
          (filter.kind === undefined || entry.kind === filter.kind),
      );
      found = [...found].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
      if (filter.limit !== undefined) found = found.slice(0, filter.limit);
      return found.map(clone);
    },
  };
}
