import { AskBrain } from "@/features/brain";
import { MissionControlPage } from "@/features/mission-control";

export const metadata = { title: "Mission Control · Daily briefing" };

/**
 * The platform opens on Mission Control (ADR-042) — the Brain's first surface,
 * a live daily briefing from real CRM + first-party measurement data. Reads
 * live state on every load, so it is always dynamic.
 */
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Ask the Brain (ADR-048) — the briefing's conversational sibling. */}
      <AskBrain />
      <MissionControlPage />
    </div>
  );
}
