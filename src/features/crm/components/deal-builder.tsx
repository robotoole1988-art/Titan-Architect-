"use client";

/**
 * Deal Builder (ADR-026). Pre-fills from the pricing catalogue (every figure
 * overridable), computes the phone-quote maths live, and saves as a
 * VERSIONED deal artifact — regeneration never overwrites, activity logged.
 * Two presentations: the founder's internal breakdown (ex/inc VAT lines) and
 * the customer summary (two clean numbers, ready to read down the phone).
 */

import { useState } from "react";
import { FileText, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PRICING_CATALOGUE,
  computeDeal,
  defaultDealForPackage,
  getPricedService,
  type Deal,
  type PricedServiceId,
} from "@/core/pricing";
import { saveDeal } from "../api/actions";

function pounds(value: number): string {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  });
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
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
        step="0.01"
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export function DealBuilder({
  businessId,
  existingDeal,
  existingVersion,
}: {
  businessId: string;
  existingDeal: Deal | null;
  existingVersion: number | null;
}) {
  const [deal, setDeal] = useState<Deal>(
    existingDeal ?? defaultDealForPackage("lead_generation"),
  );
  const [view, setView] = useState<"internal" | "customer">("internal");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const computed = computeDeal(deal);
  const valid =
    [deal.setupFee, deal.monthlyManagementFee, deal.monthlyAdSpend].every(
      (value) => Number.isFinite(value) && value >= 0,
    );

  function set<K extends keyof Deal>(key: K, value: Deal[K]) {
    setDeal((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  return (
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
                : "no deal yet — pre-filled from the pricing catalogue (placeholders)"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/40 p-0.5 text-xs">
          {(["internal", "customer"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-full px-3 py-1 capitalize transition-colors ${
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
                value={deal.packageType}
                onChange={(event) => {
                  const packageType = event.target.value as PricedServiceId;
                  // Changing package re-prefills from the catalogue.
                  setDeal(defaultDealForPackage(packageType));
                  setSaved(false);
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
            <NumberField
              id="deal-setup"
              label="Setup fee (ex VAT)"
              value={deal.setupFee}
              onChange={(value) => set("setupFee", value)}
            />
            <NumberField
              id="deal-mmf"
              label="Monthly management fee (ex VAT)"
              value={deal.monthlyManagementFee}
              onChange={(value) => set("monthlyManagementFee", value)}
            />
            <NumberField
              id="deal-adspend"
              label="Monthly ad spend"
              value={deal.monthlyAdSpend}
              onChange={(value) => set("monthlyAdSpend", value)}
            />
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
                    checked={deal.includedServices.includes(service.id)}
                    onChange={() =>
                      set(
                        "includedServices",
                        deal.includedServices.includes(service.id)
                          ? deal.includedServices.filter((id) => id !== service.id)
                          : [...deal.includedServices, service.id],
                      )
                    }
                    className="size-3.5 accent-emerald-400"
                  />
                  {service.label}
                </label>
              ))}
            </div>
          </div>

          <Textarea
            aria-label="Deal notes"
            value={deal.notes ?? ""}
            onChange={(event) => set("notes", event.target.value)}
            rows={2}
            placeholder="Deal notes (optional)…"
          />

          {/* Internal breakdown — every line, ex/inc VAT */}
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/40">
                <tr>
                  <td className="px-4 py-2 text-muted-foreground">Setup fee</td>
                  <td className="px-4 py-2 text-right">{pounds(deal.setupFee)}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">
                    {pounds(deal.setupFee * (1 + deal.vatRate))} inc VAT
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-muted-foreground">Management fee /mo</td>
                  <td className="px-4 py-2 text-right">
                    {pounds(deal.monthlyManagementFee)}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground">
                    {pounds(deal.monthlyManagementFee * (1 + deal.vatRate))} inc VAT
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-muted-foreground">Ad spend /mo</td>
                  <td className="px-4 py-2 text-right">{pounds(deal.monthlyAdSpend)}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">
                    {pounds(deal.monthlyAdSpend * (1 + deal.vatRate))} inc VAT
                  </td>
                </tr>
                <tr className="bg-emerald-400/[0.05] font-medium">
                  <td className="px-4 py-2">First payment</td>
                  <td className="px-4 py-2 text-right">
                    {pounds(computed.firstPaymentExVat)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {pounds(computed.firstPaymentIncVat)} inc VAT
                  </td>
                </tr>
                <tr className="bg-emerald-400/[0.05] font-medium">
                  <td className="px-4 py-2">Ongoing monthly</td>
                  <td className="px-4 py-2 text-right">
                    {pounds(computed.ongoingMonthlyExVat)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {pounds(computed.ongoingMonthlyIncVat)} inc VAT
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Customer summary — two clean numbers, no breakdown */
        <div
          className="flex flex-col gap-4 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.05] p-6"
          data-customer-summary
        >
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-emerald-300/80">
            <PhoneCall className="size-3.5" />
            Read down the phone
          </p>
          <p className="text-lg leading-relaxed">
            “{getPricedService(deal.packageType)?.label} — your first payment is{" "}
            <strong className="text-emerald-200">
              {pounds(computed.firstPaymentIncVat)}
            </strong>
            , then it&apos;s{" "}
            <strong className="text-emerald-200">
              {pounds(computed.ongoingMonthlyIncVat)}
            </strong>{" "}
            a month.”
          </p>
          <p className="text-[11px] text-muted-foreground">
            Figures include VAT at {(deal.vatRate * 100).toFixed(0)}%. No line
            breakdown in this view — that&apos;s the point.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Catalogue prices are founder-editable placeholders (ADR-026).
        </span>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-emerald-300">Saved ✓</span>}
          <Button
            size="sm"
            disabled={!valid || saving}
            onClick={async () => {
              setSaving(true);
              try {
                await saveDeal(businessId, deal);
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
  );
}
