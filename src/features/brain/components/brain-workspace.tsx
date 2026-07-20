import { BrainCommandBar } from "./brain-command-bar";
import { BrainLeftPanel } from "./brain-left-panel";
import { BrainCenterPanel } from "./brain-center-panel";
import { CommandCentre } from "./command-centre";
import { Recommendations } from "./recommendations";
import { HealthPanel } from "./health-panel";
import { BrainRightPanel } from "./brain-right-panel";

/**
 * TITAN Brain Workspace — the top-level layout.
 *
 * A three-panel command deck (left / centre / right) beneath the workspace's
 * own command bar, over an ambient gradient backdrop. Panels reveal with a
 * staggered entrance. Everything is a placeholder — no AI, no business logic.
 */
export function BrainWorkspace() {
  return (
    <div className="relative flex min-h-[calc(100svh-8rem)] flex-1 flex-col gap-4">
      {/* ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 size-[520px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[130px]" />
        <div className="absolute -right-24 top-24 size-[320px] rounded-full bg-violet-500/10 blur-[110px]" />
        <div className="absolute -left-16 bottom-0 size-[300px] rounded-full bg-cyan-500/[0.07] blur-[110px]" />
      </div>

      <div
        className="animate-in fade-in-0 slide-in-from-top-2 duration-500"
        style={{ animationFillMode: "backwards" }}
      >
        <BrainCommandBar />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <div
          className="order-2 animate-in fade-in-0 slide-in-from-left-2 duration-700 xl:order-1"
          style={{ animationDelay: "120ms", animationFillMode: "backwards" }}
        >
          <BrainLeftPanel />
        </div>
        <div
          className="order-1 animate-in fade-in-0 zoom-in-95 duration-700 xl:order-2"
          style={{ animationDelay: "60ms", animationFillMode: "backwards" }}
        >
          <div className="flex flex-col gap-4">
            {/* The Decision Engine's home (ADR-050). */}
            <Recommendations />
            {/* Command Mode: the founder approval gate (ADR-052). */}
            <CommandCentre />
            {/* Department health drill-down (ADR-051). */}
            <HealthPanel />
            <BrainCenterPanel />
          </div>
        </div>
        <div
          className="order-3 animate-in fade-in-0 slide-in-from-right-2 duration-700"
          style={{ animationDelay: "180ms", animationFillMode: "backwards" }}
        >
          <BrainRightPanel />
        </div>
      </div>
    </div>
  );
}
