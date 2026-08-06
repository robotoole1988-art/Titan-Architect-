/**
 * The Command Centre (ADR-057) — the founder's landing room, in the design
 * he approved on 2026-08-06: the anatomical Brain in the centre of the
 * dark room, the nine department orbs on its flanks, the stats band across
 * the top, the typed briefing beneath the mass, decisions and the timeline
 * along the floor.
 *
 * Every figure is measured; every absence is crafted. Layer 2 (the
 * Operations pages) is one action away at all times: the ⌘K palette, the
 * summonable rail, and each living orb's own door.
 */

import { loadCommandCentreFacts } from "../api/load";
import { composeBriefing } from "../model/compose-briefing";
import { buildDecisionCards } from "../model/decisions";
import { buildTimeline } from "../model/timeline";
import { numberShortcuts, railItems } from "../model/navigation";
import { typingDurationMs } from "../model/typing";
import { BrainCanvas } from "./brain-canvas";
import { TypedBriefing } from "./typed-briefing";
import { NavRail } from "./nav-rail";
import { DepartmentOrbs } from "./department-orbs";
import { PulseRefresh } from "./pulse-refresh";
import {
  DecisionsRow,
  PulseStrip,
  RevenueStory,
  TimelineFeed,
} from "./room-sections";
import { ProvenanceInfo } from "@/components/ui/provenance-info";

/** "Wed 6 Aug, 21:44" — the moment the room's facts were measured. */
function factsClock(nowIso: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  }).formatToParts(new Date(nowIso));
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}, ${get("hour")}:${get("minute")}`;
}

export async function CommandCentrePage({ founderName }: { founderName: string }) {
  const facts = await loadCommandCentreFacts({ founderName });
  const briefing = composeBriefing(facts);
  const cards = buildDecisionCards(facts);
  const timeline = buildTimeline(facts.timeline);
  const alert = facts.departments.some((d) => d.band === "red");

  // Staged reveal: sections follow the typing, room choreography. The
  // delays are server-computed and applied as CSS animation delays;
  // reduced-motion shows everything at once (globals.css guard).
  const typed = Math.min(typingDurationMs(briefing.lines) + 700, 7000);

  const bands = Object.fromEntries(
    facts.departments.map((d) => [d.id, d.band]),
  ) as Record<string, "green" | "amber" | "red" | null>;

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#020307] text-[#e9edf4]">
      <BrainCanvas alert={alert} />
      {/* vignette */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(130%_95%_at_50%_40%,transparent_42%,rgba(0,0,0,0.6)_100%)]" />

      <div className="cc-room">
        <div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between px-7 py-[18px]">
          <p className="text-[13px] font-semibold tracking-[0.42em]">
            T I T A <span className="text-[#7fa8ff]">N</span>
          </p>
          <p className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.22em] text-[#5d7396]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5ee0a8] shadow-[0_0_10px_2px_rgba(94,224,168,0.7)]" />
            Live system · {factsClock(facts.now)}
          </p>
        </div>

        <PulseStrip facts={facts} />
        <PulseRefresh />
        <DepartmentOrbs bands={bands} />

        <section className="fixed left-1/2 top-[60%] w-[min(880px,86vw)] -translate-x-1/2 text-center [@media(max-height:880px)]:top-[57.5%]">
          <p
            className="cc-reveal text-[11px] uppercase tracking-[0.4em] text-[#5d7396]"
            style={{ animationDelay: "400ms" }}
          >
            {briefing.greeting}
          </p>
          <div className="mt-2.5 flex items-start justify-center gap-1">
            <TypedBriefing lines={briefing.lines} />
            <ProvenanceInfo label="Briefing — provenance" lines={briefing.facts} />
          </div>
          <RevenueStory facts={facts} delayMs={typed + 450} />
          <DecisionsRow cards={cards} delayMs={typed + 900} />
        </section>

        <TimelineFeed entries={timeline} delayMs={typed + 1400} />
        {/* icon components are not serialisable across the server/client
            boundary — the rail receives plain data only */}
        <NavRail
          items={railItems().map(({ title, href, description }) => ({
            title,
            href,
            description,
          }))}
          shortcuts={numberShortcuts()}
        />
      </div>
    </main>
  );
}
