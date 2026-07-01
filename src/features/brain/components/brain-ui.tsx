import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared presentational atoms for the Brain workspace. Purely visual — no
 * state, no AI. Everything here is a clearly-labelled placeholder surface.
 */

/** A frosted-glass surface with a subtle top highlight. */
export function GlassPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-xl shadow-black/20 backdrop-blur-xl",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.14),transparent)]" />
      {children}
    </div>
  );
}

/** Small "Planned" tag that marks a surface as a future capability. */
export function PlannedChip({ label = "Planned" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  );
}

/** A titled section within a panel. */
export function PanelSection({
  icon: Icon,
  title,
  chip,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  chip?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium tracking-tight">{title}</h3>
        </div>
        {chip}
      </header>
      {children}
    </section>
  );
}

/** Muted explanatory text describing what a section will become. */
export function PlaceholderNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
  );
}

/** A dashed "ghost" row standing in for a future item. */
export function GhostRow({
  icon: Icon,
  label,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-2.5">
      <div className="flex size-8 items-center justify-center rounded-lg border border-border/60 bg-background/40 text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm text-foreground/80">{label}</span>
        {sub && (
          <span className="truncate text-[11px] text-muted-foreground">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

/** A centered dashed placeholder box with a short message. */
export function EmptyBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
      {children}
    </div>
  );
}

export type StatusTone = "ready" | "idle" | "offline";

/** A small pulsing status indicator. */
export function StatusDot({ tone }: { tone: StatusTone }) {
  const color =
    tone === "ready"
      ? "bg-emerald-400"
      : tone === "idle"
        ? "bg-amber-400"
        : "bg-zinc-500";
  return (
    <span className="relative flex size-2">
      {tone !== "offline" && (
        <span
          className={cn(
            "absolute inline-flex size-full animate-ping rounded-full opacity-60",
            color,
          )}
        />
      )}
      <span className={cn("relative inline-flex size-2 rounded-full", color)} />
    </span>
  );
}
