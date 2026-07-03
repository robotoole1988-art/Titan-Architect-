import Link from "next/link";
import type { ReactNode } from "react";
import {
  isLostStage,
  stageLabel,
  type ActivityEntry,
  type LifecycleStage,
} from "@/core/business";

/**
 * Shared CRM presentation: the three-level tab chrome, stage badges, and the
 * activity log. Visual language follows the existing app (dark, glass cards,
 * one accent per feature — CRM uses sky/blue).
 */

const TABS = [
  { title: "Pipeline", href: "/crm" },
  { title: "Build Queue", href: "/crm/build-queue" },
  { title: "Accounts", href: "/crm/accounts" },
] as const;

export function CrmChrome({
  active,
  children,
}: {
  active: (typeof TABS)[number]["title"];
  children: ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col gap-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 size-[420px] -translate-x-1/2 rounded-full bg-sky-500/[0.07] blur-[130px]" />
        <div className="absolute right-0 top-32 size-[280px] rounded-full bg-blue-500/[0.05] blur-[120px]" />
      </div>

      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-sky-400/80">
            CRM · Command Centre
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {active}
          </h1>
        </div>
        <nav
          aria-label="CRM levels"
          className="flex w-fit items-center gap-1 rounded-full border border-border/60 bg-card/40 p-1"
        >
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={tab.title === active ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                tab.title === active
                  ? "bg-sky-400/15 font-medium text-sky-200"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.title}
            </Link>
          ))}
        </nav>
      </header>

      {children}
    </div>
  );
}

export function StageBadge({ stage }: { stage: LifecycleStage }) {
  const lost = isLostStage(stage);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] capitalize ${
        lost
          ? "border-rose-400/25 bg-rose-400/10 text-rose-300/90"
          : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300/90"
      }`}
    >
      {stageLabel(stage)}
    </span>
  );
}

const ACTIVITY_LABELS: Record<ActivityEntry["kind"], string> = {
  note: "Note",
  stage_change: "Stage",
  artifact_generated: "Artifact",
  build_created: "Build",
  build_item_update: "Build item",
};

export function ActivityLog({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
        No activity yet — notes, stage changes, and generation events land here.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-2.5">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start gap-3 text-sm">
          <span className="mt-0.5 w-20 shrink-0 rounded-md border border-border/60 bg-muted/20 px-1.5 py-0.5 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
            {ACTIVITY_LABELS[entry.kind]}
          </span>
          <div className="min-w-0">
            <p className="text-foreground/90">{entry.message}</p>
            <p className="text-[11px] text-muted-foreground">
              {new Date(entry.createdAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
