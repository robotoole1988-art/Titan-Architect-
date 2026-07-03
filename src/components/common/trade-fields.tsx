"use client";

/**
 * Canonical trade + services inputs (ADR-026), shared by Business Intake and
 * the CRM quick-add. Trade is a select over the taxonomy — no free typing in
 * the main flows; "Other…" stays possible and the record is flagged
 * unclassified. Services multi-select follows the chosen trade's vocabulary.
 */

import { Input } from "@/components/ui/input";
import {
  TRADE_TAXONOMY,
  tradeServices,
} from "@/core/trade-taxonomy";

export const OTHER_TRADE_VALUE = "__other__";

export interface TradeSelection {
  /** Taxonomy id, or undefined when "Other…" is chosen. */
  tradeId?: string;
  /** Display label (canonical, or the free text for Other). */
  label: string;
}

export function TradeSelect({
  id,
  value,
  otherText,
  onChange,
  onOtherTextChange,
}: {
  id: string;
  /** Taxonomy id or OTHER_TRADE_VALUE. */
  value: string;
  otherText: string;
  onChange: (value: string) => void;
  onOtherTextChange: (text: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-border/60 bg-background px-2 text-sm"
      >
        {TRADE_TAXONOMY.map((trade) => (
          <option key={trade.id} value={trade.id}>
            {trade.label}
          </option>
        ))}
        <option value={OTHER_TRADE_VALUE}>Other…</option>
      </select>
      {value === OTHER_TRADE_VALUE && (
        <div className="flex flex-col gap-1">
          <Input
            aria-label="Other trade"
            value={otherText}
            onChange={(event) => onOtherTextChange(event.target.value)}
            placeholder="Describe the trade…"
          />
          <span className="text-[11px] text-amber-300/90">
            Unclassified — benchmarks and pitch fall back to modelled defaults.
          </span>
        </div>
      )}
    </div>
  );
}

export function ServicesMultiSelect({
  tradeId,
  selected,
  onToggle,
}: {
  tradeId: string;
  selected: ReadonlyArray<string>;
  onToggle: (service: string) => void;
}) {
  const services = tradeServices(tradeId);
  if (services.length === 0) return null;
  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {services.map((service) => (
        <label
          key={service}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm transition-colors has-[:checked]:border-emerald-400/40 has-[:checked]:bg-emerald-400/[0.06]"
        >
          <input
            type="checkbox"
            checked={selected.includes(service)}
            onChange={() => onToggle(service)}
            className="size-3.5 accent-emerald-400"
          />
          {service}
        </label>
      ))}
    </div>
  );
}
