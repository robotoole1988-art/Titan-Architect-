import { BrainCircuit, Network, Terminal } from "lucide-react";
import { GlassPanel, PlaceholderNote, PlannedChip } from "./brain-ui";
import { BrainCore } from "./brain-core";

/** A dimmed, non-interactive node graph standing in for the future memory graph. */
function MemoryGraphPlaceholder() {
  return (
    <div className="relative flex min-h-[150px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background/50">
      <svg viewBox="0 0 200 120" className="h-full w-full opacity-70" fill="none">
        <g className="text-border" stroke="currentColor" strokeWidth="0.6">
          <line x1="40" y1="60" x2="100" y2="30" />
          <line x1="40" y1="60" x2="88" y2="92" />
          <line x1="100" y1="30" x2="160" y2="52" />
          <line x1="88" y1="92" x2="160" y2="52" />
          <line x1="100" y1="30" x2="88" y2="92" />
        </g>
        <circle cx="40" cy="60" r="4.5" className="text-sky-400/70" fill="currentColor" />
        <circle cx="160" cy="52" r="4.5" className="text-violet-400/70" fill="currentColor" />
        <circle cx="100" cy="30" r="3" className="text-muted-foreground/60" fill="currentColor" />
        <circle cx="88" cy="92" r="3" className="text-muted-foreground/60" fill="currentColor" />
      </svg>
      <span className="absolute bottom-2 text-[11px] text-muted-foreground">
        graph not yet populated
      </span>
    </div>
  );
}

/**
 * Centre panel: the TITAN Brain identity and reasoning workspace, plus
 * placeholders for the future reasoning stream and memory graph. Decorative and
 * honest — it is not connected to any model.
 */
export function BrainCenterPanel() {
  return (
    <div className="flex h-full flex-col gap-4">
      <GlassPanel className="relative flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <BrainCircuit className="size-3.5" />
            TITAN Brain
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            The reasoning workspace
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            This is where the Brain will eventually think, reason, and coordinate
            every AI employee. It is not connected to any model yet.
          </p>
        </div>

        <BrainCore />

        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
          Idle — no reasoning session active
        </div>
      </GlassPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassPanel className="flex flex-col gap-3 p-5">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium tracking-tight">
                Reasoning stream
              </h3>
            </div>
            <PlannedChip />
          </header>
          <PlaceholderNote>
            The Brain&apos;s live chain-of-thought will stream here once reasoning
            is implemented.
          </PlaceholderNote>
          <div className="rounded-xl border border-border/60 bg-background/50 p-4 font-mono text-xs">
            <p className="text-muted-foreground/70">
              $ awaiting reasoning session…
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-muted-foreground">
              <span className="inline-block size-2 animate-pulse rounded-[1px] bg-sky-400/80" />
              <span className="opacity-60">stream idle</span>
            </p>
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-5">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium tracking-tight">Memory graph</h3>
            </div>
            <PlannedChip />
          </header>
          <PlaceholderNote>
            The Brain&apos;s memory will be visualised as an interactive graph of
            connected knowledge.
          </PlaceholderNote>
          <MemoryGraphPlaceholder />
        </GlassPanel>
      </div>
    </div>
  );
}
