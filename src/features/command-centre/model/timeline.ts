/**
 * Command Centre — timeline mapper (ADR-057).
 *
 * The cinematic feed renders REAL events only, and only the kinds a founder
 * would call activity. The learning feed is dominated by machine bookkeeping
 * (health_snapshot, recommendation_issued); those never reach the room —
 * they'd read as robot noise and drown the few human-scale moments.
 */

import type { TimelineFact } from "./facts";

/** Founder-scale event kinds, allowlisted on purpose (never inverted). */
const TIMELINE_KINDS: ReadonlySet<string> = new Set([
  "milestone",
  "decision",
  "promise",
  "question",
  "command_requested",
  "command_executed",
  "command_rejected",
  "demo_before_capture",
]);

export interface TimelineEntry {
  id: string;
  /** "15:42" — the founder's local clock rendering happens in the component. */
  occurredAt: string;
  /** Small-caps origin tag: BRAIN, COMMAND, MILESTONE… */
  tag: string;
  text: string;
}

const KIND_TAGS: Record<string, string> = {
  milestone: "Milestone",
  decision: "Decision",
  promise: "Promise",
  question: "Brain",
  command_requested: "Command",
  command_executed: "Command",
  command_rejected: "Command",
  demo_before_capture: "Reveal",
};

export function buildTimeline(
  observations: readonly TimelineFact[],
  limit = 12,
): TimelineEntry[] {
  return observations
    .filter((observation) => TIMELINE_KINDS.has(observation.kind))
    .slice(0, limit)
    .map((observation) => ({
      id: observation.id,
      occurredAt: observation.occurredAt,
      tag: KIND_TAGS[observation.kind] ?? "Activity",
      text: observation.summary,
    }));
}

/** The crafted absence when no founder-scale events exist yet. */
export const EMPTY_TIMELINE_LINE =
  "The feed begins with your first live activity.";
