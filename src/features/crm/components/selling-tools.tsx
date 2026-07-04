"use client";

/**
 * The selling tools (ADR-026 + v1.1 addendum): the ROI calculator and the
 * Deal Builder as ONE stateful unit. Lead target and CPL are SHARED — the
 * two surfaces cannot disagree by construction:
 *
 *   customers ÷ close rate ⇄ lead target  (editable from either side)
 *   ad spend = lead target × CPL          (derived, LOCKED, working shown)
 *
 * Setup fee and MMF stay free founder inputs (catalogue pre-filled). The
 * customer summary stays two clean numbers. Maths in core; state here.
 */

import { useState } from "react";
import { Calculator, FileText, Lock, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { computeRoi, type RoiResult } from "@/core/market-intelligence";
import {
  PRICING_CATALOGUE,
  computeDeal,
  deriveAdSpend,
  getPricedService,
  type Deal,
  type PricedServiceId,
} from "@/core/pricing";
import { saveDeal } from "../api/actions";

export interface SellingToolsPrefill {
  closeRate: number;
  customersPerMonth: number;
  cpl: number;
  averageJobValue: number;
  cplSource: string;
  jobValueSource: string;
  closeRateSource: string;
}

function pounds(value: number, dp?: number): string {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: dp ?? (Number.isInteger(value) ? 0 : 2),
    maximumFractionDigits: dp ?? 2,
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

function Field({
  id,
  label,
  value,
  step,
  chip,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  step: string;
  chip?: { touched: boolean; source: string };
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
      {chip && <SourceChip touched={chip.touched} source={chip.source} />}
    </div>
  );
}

function Stat({
  label,
  value,
  note,
  accent = false,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        accent
          ? "border-sky-400/25 bg-sky-400/[0.06]"
          : "border-border/60 bg-background/40"
      }`}
    >
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`text-xl font-semibold ${accent ? "text-sky-200" : ""}`}>{value}</p>
      {note && <p className="text-[10px] text-muted-foreground">{note}</p>}
    </div>
  );
}

export function SellingTools({
  businessId,
  prefill,
  existingDeal,
  existingVersion,
}: {
  businessId: string;
  prefill: SellingToolsPrefill;
  existingDeal: Deal | null;
  existingVersion: number | null;
}) {
  // ---- shared economics state (one source of truth) ----
  const [closeRate, setCloseRate] = useState(prefill.closeRate);
  const [cpl, setCpl] = useState(
    existingDeal ? existingDeal.cplUsed : Math.round(prefill.cpl),
  );
  const [cplTouched, setCplTouched] = useState(
    existingDeal?.cplSource === "founder",
  );
  const [customers, setCustomers] = useState(() =>
    existingDeal && existingDeal.leadTargetPerMonth > 0
      ? Math.round(existingDeal.leadTargetPerMonth * prefill.closeRate * 10) / 10
      : prefill.customersPerMonth,
  );
  const [jobValue, setJobValue] = useState(Math.round(prefill.averageJobValue));
  const [touched, setTouched] = useState({ customers: false, closeRate: false, jobValue: false });

  // ---- deal state (fees free; spend derived) ----
  const [packageType, setPackageType] = useState<PricedServiceId>(
    existingDeal?.packageType ?? "lead_generation",
  );
  const [includedServices, setIncludedServices] = useState<PricedServiceId[]>(
    existingDeal?.includedServices ?? ["lead_generation"],
  );
  const [setupFee, setSetupFee] = useState(
    existingDeal?.setupFee ?? getPricedService("lead_generation")!.recommendedSetupFee,
  );
  const [mmf, setMmf] = useState(
    existingDeal?.monthlyManagementFee ??
      getPricedService("lead_generation")!.recommendedMonthlyFee,
  );
  const [notes, setNotes] = useState(existingDeal?.notes ?? "");
  const [discountReason, setDiscountReason] = useState(
    existingDeal?.discounts?.[0]?.reason ?? "",
  );
  const [view, setView] = useState<"internal" | "customer">("internal");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ---- the shared derivations ----
  const leadTarget =
    closeRate > 0 && customers > 0
      ? Math.ceil(customers / closeRate - 1e-9)
      : 0;
  const adSpend = deriveAdSpend(leadTarget, cpl);

  let roi: RoiResult | null = null;
  let problem: string | null = null;
  try {
    roi = computeRoi({
      closeRate,
      customersPerMonth: customers,
      cpl,
      averageJobValue: jobValue,
      monthlyManagementFee: mmf,
    });
  } catch (error) {
    problem = error instanceof Error ? error.message : "Invalid inputs";
  }

  // Soft floors (recommendations): raising is free; lowering needs a reason.
  const activeService = getPricedService(packageType)!;
  const setupVsRec = setupFee - activeService.recommendedSetupFee;
  const mmfVsRec = mmf - activeService.recommendedMonthlyFee;
  const discounted = setupVsRec < 0 || mmfVsRec < 0;
  const discountReasonMissing = discounted && discountReason.trim() === "";

  const dealForDisplay: Deal = {
    packageType,
    includedServices,
    setupFee: Number.isFinite(setupFee) ? setupFee : 0,
    monthlyManagementFee: Number.isFinite(mmf) ? mmf : 0,
    leadTargetPerMonth: leadTarget,
    cplUsed: cpl,
    cplSource: cplTouched ? "founder" : "estimate",
    monthlyAdSpend: adSpend,
    vatRate: 0.2,
  };
  const computed = computeDeal(dealForDisplay);
  const dealValid =
    !discountReasonMissing &&
    [setupFee, mmf].every((v) => Number.isFinite(v) && v >= 0) &&
    cpl > 0 &&
    leadTarget >= 0;

  function markSaved(dirty = true) {
    if (dirty) setSaved(false);
  }

  return (
    <div className="flex flex-col gap-6" data-selling-tools>
      {/* ══════════ ROI ══════════ */}
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
          <Field
            id="roi-customers"
            label="Customers needed /month"
            value={customers}
            step="0.5"
            chip={{ touched: touched.customers, source: "founder target" }}
            onChange={(value) => {
              setCustomers(value);
              setTouched((c) => ({ ...c, customers: true }));
              markSaved();
            }}
          />
          <Field
            id="roi-close"
            label="Close rate (lead → customer)"
            value={closeRate}
            step="0.05"
            chip={{ touched: touched.closeRate, source: prefill.closeRateSource }}
            onChange={(value) => {
              setCloseRate(value);
              setTouched((c) => ({ ...c, closeRate: true }));
              markSaved();
            }}
          />
          <Field
            id="roi-cpl"
            label="Cost per lead (£) — shared with the deal"
            value={cpl}
            step="1"
            chip={{ touched: cplTouched, source: prefill.cplSource }}
            onChange={(value) => {
              setCpl(value);
              setCplTouched(true);
              markSaved();
            }}
          />
          <Field
            id="roi-jobvalue"
            label="Average job value (£)"
            value={jobValue}
            step="50"
            chip={{ touched: touched.jobValue, source: prefill.jobValueSource }}
            onChange={(value) => {
              setJobValue(value);
              setTouched((c) => ({ ...c, jobValue: true }));
              markSaved();
            }}
          />
        </div>

        {problem ? (
          <p className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
            Enter positive figures to compute — {problem}.
          </p>
        ) : roi ? (
          <>
            <div className="grid gap-2 sm:grid-cols-3" data-roi-results>
              <Stat label="Leads needed /mo" value={String(roi.leadsNeededPerMonth)} note="= the deal's lead target" />
              <Stat label="Required ad spend" value={pounds(roi.requiredAdSpend)} />
              <Stat
                label="Total monthly cost"
                value={pounds(roi.totalMonthlyCost)}
                note="incl. the deal's MMF below"
              />
              <Stat label="Expected revenue /mo" value={pounds(roi.expectedMonthlyRevenue)} />
              <Stat label="ROI multiple" value={`${roi.roiMultiple.toFixed(1)}×`} accent />
              <Stat label="Cost per customer" value={pounds(roi.costPerCustomer)} />
            </div>
            <p className="text-[11px] italic text-muted-foreground">
              Estimates, not measurements — assumptions are labelled, overrides
              are yours, and real campaign data replaces both.
            </p>
          </>
        ) : null}
      </section>

      {/* ══════════ Deal ══════════ */}
      <section
        aria-label="Deal builder"
        className="flex flex-col gap-4 rounded-2xl border border-emerald-400/20 bg-card/40 p-5"
        data-deal-builder
      >
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
              <FileText className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Deal</h2>
              <p className="text-[11px] text-muted-foreground">
                {existingVersion !== null
                  ? `deal v${existingVersion} stored — saving creates v${existingVersion + 1}`
                  : "no deal yet — fees pre-filled from the catalogue (placeholders)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/40 p-0.5 text-xs">
            {(["internal", "customer"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setView(mode)}
                className={`rounded-full px-3 py-1 transition-colors ${
                  view === mode
                    ? "bg-emerald-400/15 font-medium text-emerald-200"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "customer" ? "Customer summary" : "Internal"}
              </button>
            ))}
          </div>
        </header>

        {view === "internal" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="deal-package"
                  className="text-[11px] uppercase tracking-wide text-muted-foreground"
                >
                  Package
                </label>
                <select
                  id="deal-package"
                  value={packageType}
                  onChange={(event) => {
                    const next = event.target.value as PricedServiceId;
                    const service = getPricedService(next)!;
                    setPackageType(next);
                    setSetupFee(service.recommendedSetupFee);
                    setMmf(service.recommendedMonthlyFee);
                    // Bundles pre-fill their parts; single services include
                    // themselves. (Bundle ids themselves aren't line items.)
                    setIncludedServices(
                      service.includedServices ?? [service.id],
                    );
                    markSaved();
                  }}
                  className="h-9 rounded-lg border border-border/60 bg-background px-2 text-sm"
                >
                  {PRICING_CATALOGUE.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.label}
                      {service.flagship ? " (flagship)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                id="deal-leadtarget"
                label="Lead target /month"
                value={leadTarget}
                step="1"
                chip={{ touched: false, source: "shared with the ROI above" }}
                onChange={(value) => {
                  // Back-solve customers so ROI and deal stay one model.
                  setCustomers(Math.round(value * closeRate * 10) / 10);
                  setTouched((c) => ({ ...c, customers: true }));
                  markSaved();
                }}
              />
              <Field
                id="deal-setup"
                label={`Setup fee (ex VAT) — recommended ${pounds(activeService.recommendedSetupFee)}`}
                value={setupFee}
                step="0.01"
                onChange={(value) => {
                  setSetupFee(value);
                  markSaved();
                }}
              />
              <Field
                id="deal-mmf"
                label={`Monthly management (ex VAT) — recommended ${pounds(activeService.recommendedMonthlyFee)}`}
                value={mmf}
                step="0.01"
                onChange={(value) => {
                  setMmf(value);
                  markSaved();
                }}
              />
            </div>

            {/* Soft-floor status: raise freely; cuts need a reason (internal only) */}
            <div className="flex flex-wrap items-center gap-2" data-floor-status>
              {setupVsRec > 0 && (
                <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[11px] text-sky-300">
                  setup above recommended (+{pounds(setupVsRec)})
                </span>
              )}
              {mmfVsRec > 0 && (
                <span className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[11px] text-sky-300">
                  monthly above recommended (+{pounds(mmfVsRec)})
                </span>
              )}
              {discounted && discountReason.trim() !== "" && (
                <span
                  className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-300"
                  data-discount-chip
                >
                  discounted — {discountReason.trim()}
                </span>
              )}
            </div>
            {discounted && (
              <div className="flex flex-col gap-1.5" data-discount-reason>
                <label
                  htmlFor="deal-discount-reason"
                  className="text-xs text-amber-300"
                >
                  Below the recommended price — a discount reason is required
                  before saving (logged to the account, never shown to the
                  customer).
                </label>
                <Input
                  id="deal-discount-reason"
                  value={discountReason}
                  onChange={(event) => {
                    setDiscountReason(event.target.value);
                    markSaved();
                  }}
                  placeholder="e.g. Launch client — first 3 in the area"
                />
              </div>
            )}

            {/* Ad spend: DERIVED and LOCKED — the working is the interface */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.05] px-4 py-3"
              data-derived-adspend
            >
              <div className="flex items-center gap-2.5">
                <Lock className="size-4 text-emerald-300" aria-hidden />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Monthly ad spend — derived
                  </p>
                  <p className="text-sm text-foreground/90">
                    {leadTarget} leads × {pounds(cpl)} CPL ={" "}
                    <strong>{pounds(adSpend)}/mo</strong>
                  </p>
                </div>
              </div>
              <p className="max-w-56 text-[11px] text-muted-foreground">
                Change it by changing the lead target or the CPL override —
                never by typing over it.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Included services
              </span>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {PRICING_CATALOGUE.map((service) => (
                  <label
                    key={service.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm has-[:checked]:border-emerald-400/40 has-[:checked]:bg-emerald-400/[0.06]"
                  >
                    <input
                      type="checkbox"
                      checked={includedServices.includes(service.id)}
                      onChange={() => {
                        setIncludedServices((current) =>
                          current.includes(service.id)
                            ? current.filter((id) => id !== service.id)
                            : [...current, service.id],
                        );
                        markSaved();
                      }}
                      className="size-3.5 accent-emerald-400"
                    />
                    {service.label}
                  </label>
                ))}
              </div>
            </div>

            <Textarea
              aria-label="Deal notes"
              value={notes}
              onChange={(event) => {
                setNotes(event.target.value);
                markSaved();
              }}
              rows={2}
              placeholder="Deal notes (optional)…"
            />

            <div className="overflow-hidden rounded-xl border border-border/60">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border/40">
                  <tr>
                    <td className="px-4 py-2 text-muted-foreground">Setup fee</td>
                    <td className="px-4 py-2 text-right">{pounds(setupFee, 2)}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {pounds(setupFee * 1.2, 2)} inc VAT
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-muted-foreground">Management fee /mo</td>
                    <td className="px-4 py-2 text-right">{pounds(mmf, 2)}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {pounds(mmf * 1.2, 2)} inc VAT
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-muted-foreground">
                      Ad spend /mo (derived)
                    </td>
                    <td className="px-4 py-2 text-right">{pounds(adSpend, 2)}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {pounds(adSpend * 1.2, 2)} inc VAT
                    </td>
                  </tr>
                  <tr className="bg-emerald-400/[0.05] font-medium">
                    <td className="px-4 py-2">First payment</td>
                    <td className="px-4 py-2 text-right">
                      {pounds(computed.firstPaymentExVat, 2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {pounds(computed.firstPaymentIncVat, 2)} inc VAT
                    </td>
                  </tr>
                  <tr className="bg-emerald-400/[0.05] font-medium">
                    <td className="px-4 py-2">Ongoing monthly</td>
                    <td className="px-4 py-2 text-right">
                      {pounds(computed.ongoingMonthlyExVat, 2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {pounds(computed.ongoingMonthlyIncVat, 2)} inc VAT
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div
            className="flex flex-col gap-4 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.05] p-6"
            data-customer-summary
          >
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-300/80">
              <PhoneCall className="size-3.5" />
              Read down the phone
            </p>
            <p className="text-lg leading-relaxed">
              “{getPricedService(packageType)?.label} — your first payment is{" "}
              <strong className="text-emerald-200">
                {pounds(computed.firstPaymentIncVat, 2)}
              </strong>
              , then it&apos;s{" "}
              <strong className="text-emerald-200">
                {pounds(computed.ongoingMonthlyIncVat, 2)}
              </strong>{" "}
              a month.”
            </p>
            <p className="text-[11px] text-muted-foreground">
              Figures include VAT at 20%. No line breakdown in this view —
              that&apos;s the point.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Prices pre-fill from catalogue recommendations (soft floors — cuts need a reason); ad spend is lead target × CPL (ADR-026).
          </span>
          <div className="flex items-center gap-2">
            {saved && <span className="text-xs text-emerald-300">Saved ✓</span>}
            <Button
              size="sm"
              disabled={!dealValid || saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await saveDeal(businessId, {
                    packageType,
                    includedServices,
                    setupFee,
                    monthlyManagementFee: mmf,
                    leadTargetPerMonth: leadTarget,
                    cplUsed: cpl,
                    cplSource: cplTouched ? "founder" : "estimate",
                    notes,
                    discountReason: discountReason.trim() || undefined,
                  });
                  setSaved(true);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving
                ? "Saving…"
                : existingVersion !== null
                  ? "Save as new version"
                  : "Save deal"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
