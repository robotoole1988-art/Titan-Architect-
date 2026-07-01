import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Presentational atoms for the Experience Studio — a luxury "strategy room"
 * aesthetic: deep neutral surfaces, a single refined gold accent, editorial
 * numbering. Purely visual, no state.
 */

/** Small uppercase, wide-tracked gold label. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.25em] text-amber-300/80",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A neutral pill. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/30 px-2.5 py-0.5 text-xs text-foreground/80">
      {children}
    </span>
  );
}

/** A gold-accented pill, for keywords and highlights. */
export function AccentChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-0.5 text-xs text-amber-200/90">
      {children}
    </span>
  );
}

/** A wrapped row of chips (neutral or gold). */
export function ChipRow({
  items,
  accent,
}: {
  items: ReadonlyArray<string>;
  accent?: boolean;
}) {
  const Pill = accent ? AccentChip : Chip;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Pill key={item}>{item}</Pill>
      ))}
    </div>
  );
}

/** A labelled block of content. */
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="text-sm leading-relaxed text-foreground/85">{children}</div>
    </div>
  );
}

/** A gold-bulleted list. */
export function BulletList({ items }: { items: ReadonlyArray<string> }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm text-foreground/85">
          <span className="mt-[7px] size-1 shrink-0 rounded-full bg-amber-400/70" />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** A monospace list, for the AI media prompts. */
export function CodeList({ items }: { items: ReadonlyArray<string> }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <p
          key={index}
          className="rounded-lg border border-border/60 bg-background/50 px-3 py-2 font-mono text-xs leading-relaxed text-muted-foreground"
        >
          {item}
        </p>
      ))}
    </div>
  );
}

/** A numbered, editorial strategy card. */
export function StudioCard({
  index,
  icon: Icon,
  title,
  summary,
  children,
  className,
}: {
  index: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition-colors hover:border-amber-400/25",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(to_right,transparent,rgba(251,191,36,0.28),transparent)]" />
      <header className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
          <Icon className="size-4" />
        </span>
        <div className="flex flex-col">
          <span className="font-mono text-[11px] text-amber-300/70">{index}</span>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        </div>
      </header>
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
