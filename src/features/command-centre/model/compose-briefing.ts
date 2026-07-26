/**
 * Command Centre — the typed briefing composer (ADR-057).
 *
 * Extends M1's address discipline (ADR-056 Law §1) to the founder landing:
 * a greeting plus at most three composed sentences, every clause backed by a
 * measured fact. Where the day is thin the Brain says so with grace — it
 * never pads, never invents, never repeats a number it cannot show the
 * provenance for.
 */

import type { CommandCentreFacts } from "./facts";

export interface ComposedBriefing {
  /** "Good morning, Robert" — time-of-day from the injected clock. */
  greeting: string;
  /** The sentences the Brain types, in order. Never empty. */
  lines: readonly string[];
  /** The measured facts behind the lines, for the ⓘ affordance. */
  facts: readonly string[];
}

function timeOfDay(now: string): "morning" | "afternoon" | "evening" {
  const hour = new Date(now).getUTCHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

/** "5 leads, 1 qualified" from the pipeline's canonical stage counts. */
function stageClause(facts: CommandCentreFacts): string | null {
  const parts = facts.briefing.pipeline.byStage
    .filter((entry) => entry.count > 0)
    .map((entry) => `${entry.count} ${entry.stage}${entry.count === 1 ? "" : "s"}`);
  if (parts.length === 0) return null;
  return parts.join(", ");
}

/**
 * The state-of-the-book sentence. Composed only from counts that exist;
 * collapses honestly when the book is empty.
 */
export function composeBookLine(facts: CommandCentreFacts): string {
  if (facts.bookSize === 0) {
    return "The book is empty — your first business begins with an intake.";
  }
  const businesses = `${facts.bookSize} ${facts.bookSize === 1 ? "business" : "businesses"}`;
  const live =
    facts.liveAccounts > 0
      ? `${facts.liveAccounts} live`
      : "none live yet";
  const stages = stageClause(facts);
  const pipeline = stages ? `; in the pipeline: ${stages}` : "";
  return `The book holds ${businesses} — ${live}${pipeline}.`;
}

/**
 * The measured-activity sentence. Only earns its place when something was
 * actually measured this week; a quiet week is stated once, not padded.
 */
export function composeActivityLine(facts: CommandCentreFacts): string | null {
  if (facts.measuredVisitsWeek > 0) {
    return `Measured this week: ${facts.measuredVisitsWeek} page ${
      facts.measuredVisitsWeek === 1 ? "view" : "views"
    } across the live sites.`;
  }
  if (facts.measuredVisitsAllTime > 0) {
    return null; // history exists but the week is quiet — the chips carry it.
  }
  return null; // nothing measured yet — absence is rendered, not narrated twice.
}

export function composeBriefing(facts: CommandCentreFacts): ComposedBriefing {
  const greeting = `Good ${timeOfDay(facts.now)}, ${facts.founderName}`;

  const lines: string[] = [composeBookLine(facts)];
  const activity = composeActivityLine(facts);
  if (activity) lines.push(activity);
  // The situation address (ADR-056) closes the briefing: it already carries
  // the enquiry/health picture and the mandatory approval clause, and its
  // quiet branch is the crafted absence line.
  lines.push(facts.address.line);

  const factLines: string[] = [
    `book: businesses where internal = false (${facts.bookSize})`,
    `live: stage = live among those (${facts.liveAccounts})`,
    `visits: site_metrics beacon rows, 7 days to now (${facts.measuredVisitsWeek})`,
    ...facts.address.facts,
  ];

  return { greeting, lines, facts: factLines };
}
