import { Bell, Command, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GlassPanel, StatusDot } from "./brain-ui";

/**
 * The Brain workspace's own command bar: search, a command-palette placeholder,
 * the current project, and notifications. All controls are non-functional
 * placeholders — nothing here is wired up yet.
 */
export function BrainCommandBar() {
  return (
    <GlassPanel className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* identity + status */}
        <div className="flex items-center gap-2.5">
          <StatusDot tone="idle" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">
              TITAN Brain
            </span>
            <span className="mt-0.5 text-[11px] text-muted-foreground">
              Idle · awaiting activation
            </span>
          </div>
        </div>

        {/* search */}
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search the workspace…"
            className="border-border/60 bg-background/40 pl-9"
            disabled
            aria-label="Search"
          />
        </div>

        {/* command palette placeholder */}
        <button
          type="button"
          disabled
          className="hidden items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-2.5 py-1.5 text-xs text-muted-foreground sm:flex"
        >
          <Command className="size-3.5" />
          <span>Command palette</span>
          <kbd className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>

        {/* current project */}
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-2.5 py-1.5 text-xs">
          <span className="text-muted-foreground">Project</span>
          <span className="font-medium">TITAN Architect</span>
        </div>

        {/* notifications */}
        <button
          type="button"
          disabled
          className="relative flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-sky-400" />
        </button>
      </div>
    </GlassPanel>
  );
}
