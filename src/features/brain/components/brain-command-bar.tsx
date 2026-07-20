import { BrainCircuit } from "lucide-react";
import { GlassPanel, StatusDot } from "./brain-ui";
import { AskBrain } from "./ask-brain";

/**
 * The Brain workspace's command bar (ADR-048): identity + the WORKING
 * Ask-the-Brain input. The placeholder search and disabled command palette
 * are gone — this asks the memory spine real questions and shows evidence.
 */
export function BrainCommandBar() {
  return (
    <GlassPanel className="px-4 py-3">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <StatusDot tone="ready" />
            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight">TITAN Brain</span>
              <span className="mt-0.5 text-[11px] text-muted-foreground">
                Ask the Brain · reading the memory spine
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-2.5 py-1.5 text-xs">
            <BrainCircuit className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Read-only</span>
            <span className="font-medium">answers + evidence</span>
          </div>
        </div>
        <AskBrain />
      </div>
    </GlassPanel>
  );
}
