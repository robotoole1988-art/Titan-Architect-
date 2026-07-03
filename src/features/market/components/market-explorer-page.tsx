import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TRADE_BENCHMARKS,
  resolveCplEstimate,
  resolveMarketDataBackend,
  resolveMarketDataProvider,
} from "@/core/market-intelligence";
import { EstimateCard } from "./estimate-card";

/**
 * /market — the CPL explorer (ADR-025). Pick a trade and a location (GET
 * params — shareable, refresh-safe, no writes) and see the lead economics
 * with confidence and provenance. Read-only by design.
 */
interface MarketExplorerPageProps {
  trade?: string;
  location?: string;
}

export async function MarketExplorerPage({
  trade,
  location,
}: MarketExplorerPageProps) {
  const tradeValue = trade?.trim() || "Roofing";
  const locationValue = location?.trim() || "England";
  const provider = await resolveMarketDataProvider();
  const estimate = await resolveCplEstimate(provider, tradeValue, locationValue);
  const backend = resolveMarketDataBackend();

  return (
    <div className="relative flex flex-1 flex-col gap-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 size-[420px] -translate-x-1/2 rounded-full bg-sky-500/[0.07] blur-[130px]" />
        <div className="absolute right-0 top-32 size-[280px] rounded-full bg-indigo-500/[0.05] blur-[120px]" />
      </div>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-sky-400/80">
            Market Intelligence
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Lead economics explorer
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            What a lead costs, what a budget buys, and what the job is worth —
            per trade, per location. Every number carries its confidence and
            sources.
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground">
          data: {backend === "dataforseo" ? "DataForSEO (live)" : "seeded benchmarks v1"}
        </span>
      </header>

      {/* GET form — the URL is the state (shareable estimates) */}
      <form
        method="GET"
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-border/60 bg-card/40 p-4"
      >
        <div className="flex min-w-56 flex-1 flex-col gap-1.5">
          <Label htmlFor="market-trade">Trade</Label>
          <Input
            id="market-trade"
            name="trade"
            defaultValue={tradeValue}
            list="market-trades"
            placeholder="e.g. Roofing, Solar PV, Driveways…"
          />
          <datalist id="market-trades">
            {TRADE_BENCHMARKS.map((benchmark) => (
              <option key={benchmark.tradeKey} value={benchmark.tradeLabel} />
            ))}
          </datalist>
        </div>
        <div className="flex min-w-44 flex-1 flex-col gap-1.5">
          <Label htmlFor="market-location">Location</Label>
          <Input
            id="market-location"
            name="location"
            defaultValue={locationValue}
            placeholder="e.g. London, Glasgow, rural Wales…"
          />
        </div>
        <Button type="submit" className="gap-1.5">
          <Search className="size-4" />
          Estimate
        </Button>
      </form>

      <EstimateCard estimate={estimate} />

      <p className="text-xs text-muted-foreground">
        Covers the {TRADE_BENCHMARKS.length} benchmark trades from the founder
        workbook; any other trade falls back to a clearly-labelled modelled
        estimate. Location multipliers cover UK nations, major cities, and
        Ireland (GBP-equivalent).
      </p>
    </div>
  );
}
