"use client";

/**
 * ROI calculator (ADR-026) — answers "what does N jobs a month cost, and what
 * does it return?" live. Pre-filled inputs carry their provenance (ADR-025:
 * CPL and job value from the estimate, close rate an archetype assumption);
 * any edited figure is relabelled "founder input". Maths in core
 * (computeRoi), unit-tested; this component only holds state.
 */

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { computeRoi, type RoiResult } from "@/core/market-intelligence";

export interface RoiPrefill {
  closeRate: number;
  customersPerMonth: number;
  cpl: number;
  averageJobValue: number;
  monthlyManagementFee: number;
  /** Provenance summaries for the pre-filled values. */
  cplSource: string;
  jobValueSource: string;
  closeRateSource: string;
  mmfSource: string;
}

function pounds(value: number): string {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: value >= 100 ? 0 : 2,
  });
}

function SourceChip({ touched, source }: { touched: boolean; source: string }) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] ${
        touched
          ? "border-sky-400/30 bg-sky-400/10 text-sky-300/90"
          : "border-border/60 bg-muted/20 text-muted-foreground"
      }`}
    >
      {touched ? "founder input" : source}
    </span>
  );
}

function RoiInput({
  id,
  label,
  value,
  step,
  touched,
  source,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  step: string;
  touched: boolean;
  source: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        type="number"
        min={0}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <SourceChip touched={touched} source={source} />
    </div>
  );
}

export function RoiCalculator({ prefill }: { prefill: RoiPrefill }) {
  const [closeRate, setCloseRate] = useState(prefill.closeRate);
  const [customers, setCustomers] = useState(prefill.customersPerMonth);
  const [cpl, setCpl] = useState(Math.round(prefill.cpl));
  const [jobValue, setJobValue] = useState(Math.round(prefill.averageJobValue));
  const [touched, setTouched] = useState({
    closeRate: false,
    customers: false,
    cpl: false,
    jobValue: false,
  });

  let result: RoiResult | null = null;
  let problem: string | null = null;
  try {
    result = computeRoi({
      closeRate,
      customersPerMonth: customers,
      cpl,
      averageJobValue: jobValue,
      monthlyManagementFee: prefill.monthlyManagementFee,
    });
  } catch (error) {
    problem = error instanceof Error ? error.message : "Invalid inputs";
  }

  return (
    <section
      aria-label="ROI calculator"
      className="flex flex-col gap-4 rounded-2xl border border-sky-400/20 bg-card/40 p-5"
      data-roi-calculator
    >
      <header className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg border border-sky-400/20 bg-sky-400/10 text-sky-300">
          <Calculator className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">ROI calculator</h2>
          <p className="text-[11px] text-muted-foreground">
            “What do {customers || "N"} jobs a month cost — and return?”
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <RoiInput
          id="roi-customers"
          label="Customers needed /month"
          value={customers}
          step="1"
          touched={touched.customers}
          source="founder target"
          onChange={(value) => {
            setCustomers(value);
            setTouched((current) => ({ ...current, customers: true }));
          }}
        />
        <RoiInput
          id="roi-close"
          label="Close rate (lead → customer)"
          value={closeRate}
          step="0.05"
          touched={touched.closeRate}
          source={prefill.closeRateSource}
          onChange={(value) => {
            setCloseRate(value);
            setTouched((current) => ({ ...current, closeRate: true }));
          }}
        />
        <RoiInput
          id="roi-cpl"
          label="Cost per lead (£)"
          value={cpl}
          step="1"
          touched={touched.cpl}
          source={prefill.cplSource}
          onChange={(value) => {
            setCpl(value);
            setTouched((current) => ({ ...current, cpl: true }));
          }}
        />
        <RoiInput
          id="roi-jobvalue"
          label="Average job value (£)"
          value={jobValue}
          step="50"
          touched={touched.jobValue}
          source={prefill.jobValueSource}
          onChange={(value) => {
            setJobValue(value);
            setTouched((current) => ({ ...current, jobValue: true }));
          }}
        />
      </div>

      {problem ? (
        <p className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
          Enter positive figures to compute — {problem}.
        </p>
      ) : result ? (
        <>
          <div className="grid gap-2 sm:grid-cols-3" data-roi-results>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Leads needed /mo
              </p>
              <p className="text-xl font-semibold">{result.leadsNeededPerMonth}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Required ad spend
              </p>
              <p className="text-xl font-semibold">{pounds(result.requiredAdSpend)}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Total monthly cost
              </p>
              <p className="text-xl font-semibold">{pounds(result.totalMonthlyCost)}</p>
              <p className="text-[10px] text-muted-foreground">{prefill.mmfSource}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Expected revenue /mo
              </p>
              <p className="text-xl font-semibold">
                {pounds(result.expectedMonthlyRevenue)}
              </p>
            </div>
            <div className="rounded-xl border border-sky-400/25 bg-sky-400/[0.06] p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                ROI multiple
              </p>
              <p className="text-xl font-semibold text-sky-200">
                {result.roiMultiple.toFixed(1)}×
              </p>
            </div>
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Cost per customer
              </p>
              <p className="text-xl font-semibold">{pounds(result.costPerCustomer)}</p>
            </div>
          </div>
          <p className="text-[11px] italic text-muted-foreground">
            Estimates, not measurements — assumptions are labelled, overrides
            are yours, and real campaign data replaces both.
          </p>
        </>
      ) : null}
    </section>
  );
}
