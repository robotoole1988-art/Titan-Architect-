import { Bot, Database, Dna, ListTodo } from "lucide-react";
import {
  EmptyBox,
  GhostRow,
  GlassPanel,
  PanelSection,
  PlaceholderNote,
  PlannedChip,
} from "./brain-ui";

const DNA_SOURCES = [
  "Trade DNA",
  "Location DNA",
  "Brand DNA",
  "Customer DNA",
  "Competitor DNA",
  "Marketing DNA",
];

/** Left panel: AI Employees, Active Tasks, Knowledge Sources — all placeholders. */
export function BrainLeftPanel() {
  return (
    <GlassPanel className="flex h-full flex-col gap-6 p-5">
      <PanelSection icon={Bot} title="AI Employees" chip={<PlannedChip />}>
        <PlaceholderNote>
          The Brain&apos;s autonomous workforce will appear here — each with its
          role, status, and current task.
        </PlaceholderNote>
        <div className="flex flex-col gap-2">
          <GhostRow
            icon={Bot}
            label="Awaiting activation"
            sub="No employees deployed yet"
          />
          <GhostRow
            icon={Bot}
            label="Awaiting activation"
            sub="No employees deployed yet"
          />
        </div>
      </PanelSection>

      <PanelSection icon={ListTodo} title="Active Tasks" chip={<PlannedChip />}>
        <PlaceholderNote>
          Live tasks the Brain is coordinating will stream here in real time.
        </PlaceholderNote>
        <EmptyBox>No active tasks</EmptyBox>
      </PanelSection>

      <PanelSection
        icon={Database}
        title="Knowledge Sources"
        chip={<PlannedChip />}
      >
        <PlaceholderNote>
          Backed by the Knowledge Kernel — the six DNA types will surface here as
          live sources.
        </PlaceholderNote>
        <div className="flex flex-wrap gap-1.5">
          {DNA_SOURCES.map((source) => (
            <span
              key={source}
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border/60 bg-muted/20 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              <Dna className="size-3" />
              {source}
            </span>
          ))}
        </div>
      </PanelSection>
    </GlassPanel>
  );
}
