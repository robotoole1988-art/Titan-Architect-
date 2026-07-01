import { Activity, GitBranch, Layers, Sparkles } from "lucide-react";
import {
  EmptyBox,
  GlassPanel,
  PanelSection,
  PlaceholderNote,
  PlannedChip,
  StatusDot,
  type StatusTone,
} from "./brain-ui";

const SYSTEM_STATUS: { label: string; value: string; tone: StatusTone }[] = [
  { label: "Reasoning engine", value: "Offline", tone: "offline" },
  { label: "Knowledge Kernel", value: "Interfaces ready", tone: "ready" },
  { label: "AI providers", value: "Not connected", tone: "offline" },
  { label: "Memory graph", value: "Planned", tone: "idle" },
];

/** Right panel: Decisions, Context, Suggested Actions, System Status. */
export function BrainRightPanel() {
  return (
    <GlassPanel className="flex h-full flex-col gap-6 p-5">
      <PanelSection icon={GitBranch} title="Decisions" chip={<PlannedChip />}>
        <PlaceholderNote>
          Decisions the Brain makes — and the reasoning behind them — will be
          logged here.
        </PlaceholderNote>
        <EmptyBox>No decisions yet</EmptyBox>
      </PanelSection>

      <PanelSection icon={Layers} title="Context" chip={<PlannedChip />}>
        <PlaceholderNote>
          The Brain&apos;s active context window will be visualised here.
        </PlaceholderNote>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
          <div className="h-full w-0 rounded-full bg-sky-400/60" />
        </div>
        <span className="text-[11px] text-muted-foreground">
          0% — context not yet populated
        </span>
      </PanelSection>

      <PanelSection
        icon={Sparkles}
        title="Suggested Actions"
        chip={<PlannedChip />}
      >
        <PlaceholderNote>
          Recommended next actions will appear here once reasoning is active.
        </PlaceholderNote>
        <div className="flex flex-col gap-2">
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            Suggested action placeholder
          </div>
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
            Suggested action placeholder
          </div>
        </div>
      </PanelSection>

      <PanelSection icon={Activity} title="System Status">
        <div className="flex flex-col gap-2">
          {SYSTEM_STATUS.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="flex items-center gap-1.5 font-medium">
                <StatusDot tone={row.tone} />
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </PanelSection>
    </GlassPanel>
  );
}
