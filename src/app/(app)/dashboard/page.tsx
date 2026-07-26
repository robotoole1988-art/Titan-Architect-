import { MissionControlPage } from "@/features/mission-control";

export const metadata = { title: "Mission Control · Daily briefing" };

/**
 * The platform opens on Mission Control (ADR-042) — the Brain's first surface,
 * a live daily briefing from real CRM + first-party measurement data. Reads
 * live state on every load, so it is always dynamic.
 */
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  // The Brain speaks first and the founder speaks back — both live
  // inside Mission Control now (ADR-056, Law §1).
  return <MissionControlPage />;
}
