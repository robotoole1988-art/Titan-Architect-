/**
 * The room's server-rendered sections (ADR-057): pulse strip, health chips,
 * revenue story, decisions row, timeline. Every figure comes from the facts
 * snapshot; crafted absence renders wherever measurement does not exist yet.
 * Reveal choreography is CSS (`cc-reveal` + inline delay) so reduced-motion
 * collapses to instant visibility with no JS involved.
 */

import Link from "next/link";
import { ProvenanceInfo } from "@/components/ui/provenance-info";
import type { HealthChip } from "../model/chips";
import type { DecisionCard } from "../model/decisions";
import { EMPTY_DECISIONS_LINE } from "../model/decisions";
import type { TimelineEntry } from "../model/timeline";
import { EMPTY_TIMELINE_LINE } from "../model/timeline";
import type { CommandCentreFacts } from "../model/facts";
import {
  acceptOpportunity,
  approveDecision,
  declineDecision,
  dismissOpportunity,
} from "../api/actions";

function reveal(delayMs: number): { className: string; style: React.CSSProperties } {
  return {
    className: "cc-reveal",
    style: { animationDelay: `${delayMs}ms` },
  };
}

/* ---------------------------------------------------------------- pulse */

export function PulseStrip({ facts }: { facts: CommandCentreFacts }) {
  const items: Array<[string, string]> = [
    ["Businesses", String(facts.bookSize)],
    ["Live sites", String(facts.liveSites)],
    ["Visits · 7d", String(facts.measuredVisitsWeek)],
    ["Enquiries", String(facts.enquiriesAllTime)],
    ["Decisions", String(facts.pendingDecisions.length)],
  ];
  return (
    <div
      data-pulse-strip
      className="cc-reveal fixed left-1/2 top-[58px] z-10 flex -translate-x-1/2 gap-12 whitespace-nowrap text-center"
      style={{ animationDelay: "600ms" }}
    >
      {items.map(([label, value]) => (
        <div key={label}>
          <div
            className="text-[28px] font-semibold leading-none tracking-tight tabular-nums text-[#e9edf4]"
            style={{ textShadow: "0 0 24px rgba(90,150,255,0.45)" }}
          >
            {value}
          </div>
          <div className="mt-1.5 text-[9.5px] uppercase tracking-[0.26em] text-[#5d7396]">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- chips */

export function HealthChips({
  chips,
  delayMs,
}: {
  chips: ReadonlyArray<HealthChip>;
  delayMs: number;
}) {
  const { className, style } = reveal(delayMs);
  return (
    <div
      data-health-chips
      className={`${className} mt-3 flex flex-wrap justify-center gap-2`}
      style={style}
    >
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={chip.href}
          data-chip={chip.key}
          data-empty={chip.empty || undefined}
          className="group rounded-lg border border-[rgba(100,125,180,0.2)] bg-[rgba(9,13,22,0.55)] px-3 py-1.5 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-px hover:border-[rgba(140,175,255,0.5)] motion-reduce:transition-none"
        >
          <span className="flex items-center gap-1">
            <span className="block text-[8.5px] uppercase tracking-[0.18em] text-[#5d7396]">
              {chip.label}
            </span>
            <ProvenanceInfo label={`${chip.label} — provenance`} lines={chip.provenance} />
          </span>
          <span
            className={`text-[13px] font-semibold ${
              chip.gold ? "text-[#d8b26a]" : chip.empty ? "text-[#7d8ea0]" : "text-white"
            }`}
          >
            {chip.value}
          </span>
          <span className="ml-1.5 text-[10px] text-[#7fa8b8]">{chip.sub}</span>
        </Link>
      ))}
    </div>
  );
}

/* --------------------------------------------------------- revenue story */

export function RevenueStory({
  facts,
  delayMs,
}: {
  facts: CommandCentreFacts;
  delayMs: number;
}) {
  const { className, style } = reveal(delayMs);
  if (facts.revenue === null) {
    return (
      <div
        data-revenue-story
        data-empty
        className={`${className} mx-auto mt-3 max-w-lg text-center`}
        style={style}
      >
        <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-[rgba(140,175,255,0.35)] to-transparent" />
        <p className="mt-2 text-[11.5px] leading-relaxed text-[#7d8ea0]">
          Measurement begins with your first live campaign.
        </p>
        {facts.measuredVisitsAllTime > 0 && (
          <p className="mt-0.5 text-[10.5px] text-[#5d7396]">
            {facts.measuredVisitsAllTime} page views measured to date across the
            published sites — every one first-party.
          </p>
        )}
      </div>
    );
  }
  // The measured branch: the line draws itself the day revenue exists.
  return (
    <div data-revenue-story className={`${className} mx-auto mt-4 max-w-md text-center`} style={style}>
      <p className="text-[12px] text-[#7d8ea0]">
        Revenue — today{" "}
        <b className="font-medium text-[#c9d4e6]">£{facts.revenue.today}</b> · week{" "}
        <b className="font-medium text-[#c9d4e6]">£{facts.revenue.week}</b> · month{" "}
        <b className="font-medium text-[#c9d4e6]">£{facts.revenue.month}</b>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------- decisions */

export function DecisionsRow({
  cards,
  delayMs,
}: {
  cards: ReadonlyArray<DecisionCard>;
  delayMs: number;
}) {
  const { className, style } = reveal(delayMs);
  if (cards.length === 0) {
    return (
      <p
        data-decisions-row
        data-empty
        className={`${className} mx-auto mt-4 text-[12px] tracking-wide text-[#5d7396]`}
        style={style}
      >
        {EMPTY_DECISIONS_LINE}
      </p>
    );
  }
  return (
    <div
      data-decisions-row
      className={`${className} mx-auto mt-4 flex max-w-[94vw] flex-wrap justify-center gap-2.5`}
      style={style}
    >
      {cards.map((card) => (
        <article
          key={card.key}
          data-decision-card
          className={`w-[220px] shrink-0 rounded-xl border bg-[rgba(9,13,22,0.6)] p-3 text-left backdrop-blur-md ${
            card.tone === "gold"
              ? "border-[rgba(216,178,106,0.4)]"
              : "border-[rgba(240,160,90,0.4)]"
          }`}
        >
          <p
            className={`text-[8.5px] uppercase tracking-[0.2em] ${
              card.tone === "gold" ? "text-[#d8b26a]" : "text-[#f0a05a]"
            }`}
          >
            {card.eyebrow}
          </p>
          <p className="mt-1 text-[11.5px] leading-snug text-[#c2cddd]">{card.text}</p>
          {card.detail.length > 0 && (
            <p className="mt-1 text-[10px] leading-relaxed text-[#7d8ea0]">
              {card.detail.join(" · ")}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            {card.requestId && (
              <>
                <form action={approveDecision.bind(null, card.requestId)}>
                  <button className="rounded-md border border-[rgba(216,178,106,0.5)] px-2 py-0.5 text-[10px] text-[#d8b26a] transition-colors hover:bg-[rgba(216,178,106,0.12)]">
                    Approve
                  </button>
                </form>
                <form action={declineDecision.bind(null, card.requestId)}>
                  <button className="rounded-md px-2 py-0.5 text-[10px] text-[#7d8ea0] transition-colors hover:text-[#c2cddd]">
                    Decline
                  </button>
                </form>
              </>
            )}
            {card.recommendationId && (
              <>
                <form action={acceptOpportunity.bind(null, card.recommendationId, card.text)}>
                  <button className="rounded-md border border-[rgba(216,178,106,0.5)] px-2 py-0.5 text-[10px] text-[#d8b26a] transition-colors hover:bg-[rgba(216,178,106,0.12)]">
                    Accept
                  </button>
                </form>
                <form action={dismissOpportunity.bind(null, card.recommendationId, card.text)}>
                  <button className="rounded-md px-2 py-0.5 text-[10px] text-[#7d8ea0] transition-colors hover:text-[#c2cddd]">
                    Dismiss
                  </button>
                </form>
              </>
            )}
            <Link
              href={card.href}
              className="ml-auto text-[10px] text-[#7fa8ff] hover:underline"
            >
              open
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- timeline */

export function TimelineFeed({
  entries,
  delayMs,
}: {
  entries: ReadonlyArray<TimelineEntry>;
  delayMs: number;
}) {
  const { className, style } = reveal(delayMs);
  return (
    <div
      data-timeline
      className={`${className} fixed inset-x-0 bottom-0 flex h-12 items-center gap-0 overflow-x-auto whitespace-nowrap bg-gradient-to-t from-[rgba(2,4,9,0.92)] to-transparent px-8 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]`}
      style={style}
    >
      {entries.length === 0 ? (
        <span className="mx-auto text-[11.5px] tracking-wide text-[#5d7396]">
          {EMPTY_TIMELINE_LINE}
        </span>
      ) : (
        entries.map((entry) => (
          <span
            key={entry.id}
            className="mr-6 inline-flex items-baseline gap-2 border-r border-[rgba(110,130,170,0.14)] pr-6 text-[12px] text-[#94a2ba]"
          >
            <time
              dateTime={entry.occurredAt}
              className="text-[11px] tabular-nums text-[#4f5e7a]"
            >
              {new Date(entry.occurredAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/London",
              })}
            </time>
            <span className="text-[10px] uppercase tracking-[0.12em] text-[#7fa8ff]">
              {entry.tag}
            </span>
            <span>{entry.text}</span>
          </span>
        ))
      )}
    </div>
  );
}
