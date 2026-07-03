import { BadgeInfo, Coins } from "lucide-react";
import {
  confidenceLabel,
  type CplEstimate,
} from "@/core/market-intelligence";

/**
 * The estimate presentation shared by the /market explorer and the CRM pitch
 * panel (ADR-025). THE PROVENANCE RULE: this card never renders a number
 * without its confidence label and provenance footer — both are part of the
 * component, not optional extras.
 */

export function poundsRange(low: number, high: number): string {
  return `£${Math.round(low)} – £${Math.round(high)}`;
}

function ConfidenceChip({ estimate }: { estimate: CplEstimate }) {
  const level = estimate.provenance.confidence;
  const styles =
    level === "sourced"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300/90"
      : level === "partial"
        ? "border-amber-400/25 bg-amber-400/10 text-amber-300/90"
        : "border-border/60 bg-muted/25 text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] ${styles}`}
      title={
        level === "sourced"
          ? "Built from published UK benchmark studies"
          : level === "partial"
            ? "Built from proxy/adjacent data, adjusted"
            : "Modelled from adjacent trades — no direct published study"
      }
    >
      {confidenceLabel(level)}
    </span>
  );
}

export function ProvenanceFooter({ estimate }: { estimate: CplEstimate }) {
  const { provenance } = estimate;
  return (
    <footer className="flex flex-col gap-1.5 border-t border-border/40 pt-3 text-[11px] leading-relaxed text-muted-foreground">
      <p className="flex items-center gap-1.5">
        <BadgeInfo className="size-3 shrink-0" />
        {provenance.provider === "seeded-benchmarks"
          ? "TITAN seeded benchmarks (founder workbook v1)"
          : "DataForSEO live data"}{" "}
        · {confidenceLabel(provenance.confidence).toLowerCase()} · as of{" "}
        {provenance.asOf} · {provenance.locationLabel} ×
        {provenance.locationMultiplier}
        {provenance.locationMatched ? "" : " (location unrecognised — national baseline)"}
      </p>
      <ul className="flex flex-col gap-0.5 pl-4">
        {provenance.sources.map((source) => (
          <li key={source} className="list-disc">
            {source}
          </li>
        ))}
      </ul>
      <p className="italic">
        Estimates, not measurements — CPL = CPC ÷ conversion assumptions.
        Real campaign data replaces these the moment TITAN runs one.
      </p>
    </footer>
  );
}

export function EstimateCard({
  estimate,
  compact = false,
}: {
  estimate: CplEstimate;
  compact?: boolean;
}) {
  const { cpl, jobValue, budgetScenarios, provenance } = estimate;
  const perThousand = budgetScenarios.find((s) => s.monthlyBudget === 1000);

  return (
    <section
      aria-label={`Lead economics — ${provenance.tradeLabel}, ${provenance.locationLabel}`}
      className="flex flex-col gap-5 rounded-2xl border border-sky-400/20 bg-card/40 p-5"
      data-estimate={`${provenance.tradeKey}:${provenance.locationLabel}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300">
            <Coins className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">
              {provenance.tradeLabel} · {provenance.locationLabel}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Cost-per-lead estimate
            </p>
          </div>
        </div>
        <ConfidenceChip estimate={estimate} />
      </header>

      {/* The headline numbers */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-background/40 p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Estimated CPL
          </p>
          <p className="mt-1 text-2xl font-semibold text-sky-200">
            £{Math.round(estimate.cpl.mid)}
          </p>
          <p className="text-xs text-muted-foreground">
            range {poundsRange(cpl.low, cpl.high)}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Typical job value
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {poundsRange(jobValue.low, jobValue.high)}
          </p>
          <p className="text-xs text-muted-foreground">
            ~{(estimate.costPerPoundOfJobValue * 100).toFixed(1)}p of lead cost
            per £ of job value
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Leads per £1,000/mo
          </p>
          <p className="mt-1 text-2xl font-semibold">
            {perThousand ? `${perThousand.leads.low}–${perThousand.leads.high}` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">at the estimated CPL range</p>
        </div>
      </div>

      {/* Budget scenarios */}
      {!compact && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Monthly budget scenarios
          </h3>
          <ul className="grid gap-2 sm:grid-cols-3">
            {budgetScenarios.map((scenario) => (
              <li
                key={scenario.monthlyBudget}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground">
                  £{scenario.monthlyBudget.toLocaleString("en-GB")}/mo
                </span>
                <span className="font-medium">
                  {scenario.leads.low}–{scenario.leads.high} leads
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ProvenanceFooter estimate={estimate} />
    </section>
  );
}
