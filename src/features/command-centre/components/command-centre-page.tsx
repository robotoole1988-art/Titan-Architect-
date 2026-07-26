/**
 * The Command Centre (ADR-057) — the founder's landing room.
 *
 * Layer 1 of the two-layer model: a dark room, the particle Brain, a typed
 * briefing, health chips, the revenue story, the decisions row, the
 * constellation and the timeline — staged top to bottom exactly like the
 * approved v5 prototype. Every figure is measured; every absence is crafted.
 * Layer 2 (the Operations pages) is one action away at all times: the ⌘K
 * palette, the summonable rail, and the constellation all derive from the
 * one navigation registry.
 */

import { loadCommandCentreFacts } from "../api/load";
import { composeBriefing } from "../model/compose-briefing";
import { buildHealthChips } from "../model/chips";
import { buildDecisionCards } from "../model/decisions";
import { buildTimeline } from "../model/timeline";
import {
  constellationPoints,
  numberShortcuts,
  railItems,
} from "../model/navigation";
import { typingDurationMs } from "../model/typing";
import { BrainCanvas } from "./brain-canvas";
import { TypedBriefing } from "./typed-briefing";
import { NavRail } from "./nav-rail";
import { Constellation } from "./constellation";
import { PulseRefresh } from "./pulse-refresh";
import {
  DecisionsRow,
  HealthChips,
  PulseStrip,
  RevenueStory,
  TimelineFeed,
} from "./room-sections";
import { ProvenanceInfo } from "@/components/ui/provenance-info";

export async function CommandCentrePage({ founderName }: { founderName: string }) {
  const facts = await loadCommandCentreFacts({ founderName });
  const briefing = composeBriefing(facts);
  const chips = buildHealthChips(facts);
  const cards = buildDecisionCards(facts);
  const timeline = buildTimeline(facts.timeline);
  const alert = facts.departments.some((d) => d.band === "red");

  // Staged reveal: sections follow the typing, v5 choreography. The delays
  // are server-computed and applied as CSS animation delays; reduced-motion
  // shows everything at once (globals.css guard).
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
        <p className="fixed left-1/2 top-[22px] -translate-x-1/2 text-[10px] uppercase tracking-[0.55em] text-[#4a5674]">
          T I T A N
        </p>

        <PulseStrip facts={facts} />
        <PulseRefresh />

        <section className="fixed left-1/2 top-[42%] w-[min(700px,92vw)] -translate-x-1/2 text-center">
          <p className="cc-reveal text-[11px] uppercase tracking-[0.4em] text-[#5d7396]" style={{ animationDelay: "400ms" }}>
            {briefing.greeting}
          </p>
          <div className="mt-3 flex items-start justify-center gap-1">
            <TypedBriefing lines={briefing.lines} />
            <ProvenanceInfo label="Briefing — provenance" lines={briefing.facts} />
          </div>
          <HealthChips chips={chips} delayMs={typed} />
          <RevenueStory facts={facts} delayMs={typed + 450} />
        </section>

        <DecisionsRow cards={cards} delayMs={typed + 900} />
        <Constellation points={constellationPoints()} bands={bands} />
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
