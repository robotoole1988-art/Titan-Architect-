/**
 * Department health surfaces (ADR-051). Server components — the drill-down
 * uses native disclosure, no client state. Every number links back to its
 * formula and evidence; gaps and not-scoreable states render as honestly as
 * the scores.
 */

import Link from "next/link";
import {
  Activity,
  ChevronDown,
  ExternalLink,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { DepartmentHealth } from "@/core/health-engine";
import { loadDepartmentHealth } from "../api/health";

const BAND_DOT: Record<string, string> = {
  green: "bg-emerald-400",
  amber: "bg-amber-400",
  red: "bg-rose-400",
};

const BAND_TEXT: Record<string, string> = {
  green: "text-emerald-300",
  amber: "text-amber-300",
  red: "text-rose-300",
};

const DEPARTMENT_LABEL: Record<string, string> = {
  enquiries: "Enquiries",
  pipeline: "Pipeline",
  delivery: "Delivery",
  experience: "Experience",
  measurement: "Measurement",
};

function Trend({ health }: { health: DepartmentHealth }) {
  if (!health.scoreable || !health.trend) {
    return (
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
        {health.scoreable ? "first reading" : ""}
      </span>
    );
  }
  const { delta, direction } = health.trend;
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const tone =
    direction === "up" ? "text-emerald-300" : direction === "down" ? "text-rose-300" : "text-muted-foreground";
  return (
    <span className={`flex items-center gap-1 text-xs ${tone}`}>
      <Icon className="size-3.5" />
      {delta > 0 ? `+${delta}` : delta}
    </span>
  );
}

/** Compact strip — Mission Control. */
export async function HealthStrip() {
  const { healths } = await loadDepartmentHealth();
  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-gradient-to-br from-card/70 to-card/30 p-4">
      <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Activity className="size-3.5 text-sky-300" />
        Department health
        <span className="ml-auto font-normal normal-case tracking-normal">
          Health Engine · deterministic · formulas in the Brain
        </span>
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {healths.map((health) => (
          <Link
            key={health.department}
            href="/brain"
            className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 transition-colors hover:border-foreground/30"
          >
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              <span
                className={`size-1.5 rounded-full ${health.scoreable ? BAND_DOT[health.band] : "bg-muted-foreground/40"}`}
              />
              {DEPARTMENT_LABEL[health.department]}
            </span>
            {health.scoreable ? (
              <span className="flex items-baseline gap-2">
                <span className={`text-lg font-semibold tabular-nums ${BAND_TEXT[health.band]}`}>
                  {Math.round(health.score)}
                </span>
                <Trend health={health} />
              </span>
            ) : (
              <span className="text-[11px] leading-tight text-muted-foreground">
                {health.reason}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Full drill-down — the Brain workspace. */
export async function HealthPanel() {
  const { healths } = await loadDepartmentHealth();
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-card/70 to-card/30 p-5">
      <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Activity className="size-3.5 text-sky-300" />
        Department health
        <span className="ml-auto font-normal normal-case tracking-normal">
          every input traceable to spine records
        </span>
      </h2>
      <div className="flex flex-col gap-2">
        {healths.map((health) => (
          <details
            key={health.department}
            className="group rounded-xl border border-border/60 bg-background/40 px-4 py-3"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
              <span
                className={`size-2 rounded-full ${health.scoreable ? BAND_DOT[health.band] : "bg-muted-foreground/40"}`}
              />
              <span className="text-sm font-medium">
                {DEPARTMENT_LABEL[health.department]}
              </span>
              {health.scoreable ? (
                <>
                  <span className={`text-sm font-semibold tabular-nums ${BAND_TEXT[health.band]}`}>
                    {Math.round(health.score)}/100
                  </span>
                  <Trend health={health} />
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {health.confidence} confidence · risk {health.riskLevel}
                  </span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">{health.reason}</span>
              )}
              <ChevronDown className="ml-auto size-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>

            {health.scoreable && (
              <div className="mt-3 flex flex-col gap-3 border-t border-border/50 pt-3">
                {health.factors.map((factor) => (
                  <div key={factor.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">{factor.label}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {factor.score}/100 · weight {Math.round(factor.weight * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{factor.detail}</p>
                    {factor.evidence.length > 0 && (
                      <ul className="flex flex-col gap-0.5">
                        {factor.evidence.slice(0, 3).map((record) => (
                          <li key={`${record.ref.kind}:${record.ref.id}:${record.label}`}>
                            <Link
                              href={record.href}
                              className="flex items-start gap-1.5 rounded px-1 py-0.5 text-xs hover:bg-muted/40"
                            >
                              <ExternalLink className="mt-0.5 size-3 shrink-0 text-muted-foreground" />
                              <span className="min-w-0">
                                <span className="block leading-tight">{record.label}</span>
                                <span className="block text-[10px] uppercase tracking-wide text-muted-foreground/70">
                                  {record.provenance}
                                </span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {health.gaps.length > 0 && (
                  <p className="rounded-lg border border-dashed border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
                    Not scored (lowers confidence): {health.gaps.join(" · ")}
                  </p>
                )}
                <p className="text-[10px] leading-relaxed text-muted-foreground/70">
                  {health.formula}
                </p>
              </div>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}
