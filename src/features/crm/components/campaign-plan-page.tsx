import Link from "next/link";
import {
  ArrowLeft,
  Download,
  ListChecks,
  MapPin,
  Megaphone,
  PoundSterling,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CampaignPlan } from "@/core/ads-intelligence";
import { resolveBusinessSpine } from "@/core/business";
import { PrintButton } from "./print-button";

/**
 * The campaign plan viewer (ADR-031) — blueprint-viewer style: the founder
 * reviews the DESIGN here before approving it in the Build Queue. Printable
 * (print stylesheet) and exportable (Ads Editor CSVs).
 */

function SerpPreview({
  headlines,
  descriptions,
  url,
}: {
  headlines: string[];
  descriptions: string[];
  url: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-white/95 p-4 text-left dark:bg-white/95">
      <p className="text-xs text-[#202124]">
        Sponsored · <span className="text-[#006621]">{url}</span>
      </p>
      <p className="mt-1 text-lg leading-snug text-[#1a0dab]">
        {headlines.slice(0, 3).join(" | ")}
      </p>
      <p className="mt-1 text-sm leading-snug text-[#4d5156]">
        {descriptions.slice(0, 2).join(" ")}
      </p>
    </div>
  );
}

export async function CampaignPlanPage({ businessId }: { businessId: string }) {
  const spine = await resolveBusinessSpine();
  const [business, artifact] = await Promise.all([
    spine.businesses.get(businessId),
    spine.artifacts.latest<CampaignPlan>(businessId, "campaign_plan"),
  ]);

  if (!business || !artifact) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center text-sm text-muted-foreground">
        No campaign plan yet — generate one from the Build Queue&apos;s Google
        Ads item (needs a deal and a live site).
      </div>
    );
  }

  const plan = artifact.payload;
  const campaign = plan.campaigns[0];
  const totalKeywords = campaign.adGroups.reduce(
    (sum, group) => sum + group.keywords.length,
    0,
  );
  const exportHref = (file: string) =>
    `/api/campaign-plan?businessId=${businessId}&file=${file}`;

  return (
    <div className="flex flex-col gap-6 print:text-black" data-campaign-plan>
      <style>{`@media print { aside, header.sticky, [data-no-print] { display: none !important; } }`}</style>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Google Ads · Campaign Build Sheet
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{business.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{business.trade}</span>
            <span aria-hidden>·</span>
            <span>{business.location}</span>
            <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-300/90">
              campaign plan v{artifact.version}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px]">
              <ShieldCheck className="size-3" />
              validated · manual execution
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2" data-no-print>
          <PrintButton />
          <Button
            variant="outline"
            render={<Link href="/crm/build-queue" />}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Build Queue
          </Button>
        </div>
      </header>

      {/* Budget — the deal's own numbers, working shown */}
      <section className="rounded-2xl border border-amber-400/20 bg-card/40 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <PoundSterling className="size-4 text-amber-300" />
          Budget — from the deal, shown with its working
        </h2>
        <p className="mt-2 font-mono text-lg" data-budget-working>
          {plan.budget.working}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          CPL source: {plan.budget.cplSource} — the plan reads the deal&apos;s
          shared lead target + CPL (ADR-026); they can never disagree.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Target className="size-3.5 text-muted-foreground" />
            {plan.bidStrategy.initial}
          </span>
          <span className="text-muted-foreground">{plan.bidStrategy.switchAt}</span>
        </div>
      </section>

      {/* Structure + exports */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Megaphone className="size-4 text-muted-foreground" />
            {campaign.name} — {campaign.adGroups.length} ad groups ·{" "}
            {totalKeywords} keywords
          </h2>
          <div className="flex flex-wrap gap-2" data-no-print>
            {(["campaigns", "adgroups", "keywords", "ads"] as const).map((file) => (
              <Button
                key={file}
                size="sm"
                variant="outline"
                render={<a href={exportHref(file)} download />}
                className="gap-1.5"
                data-export={file}
              >
                <Download className="size-3.5" />
                {file}.csv
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {campaign.adGroups.map((group) => (
            <details
              key={group.name}
              className="rounded-2xl border border-border/60 bg-card/40 p-5 open:pb-6"
              data-ad-group={group.name}
              open={group.area === undefined && group.service === campaign.adGroups[0].service}
            >
              <summary className="flex cursor-pointer flex-wrap items-center gap-2 text-sm font-medium">
                {group.name}
                <span className="rounded-full border border-border/60 bg-muted/20 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {group.keywords.length} keywords
                </span>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  → {group.finalUrl.replace(/^https?:\/\//, "")}
                </span>
              </summary>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    Keywords
                  </h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="pb-1 font-normal">Keyword</th>
                        <th className="pb-1 font-normal">Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.keywords.map((keyword) => (
                        <tr
                          key={`${keyword.matchType}:${keyword.text}`}
                          className="border-t border-border/40"
                        >
                          <td className="py-1 font-mono">
                            {keyword.matchType === "phrase"
                              ? `"${keyword.text}"`
                              : `[${keyword.text}]`}
                          </td>
                          <td className="py-1 capitalize text-muted-foreground">
                            {keyword.matchType}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Ad preview
                  </h3>
                  {group.ads.map((ad, index) => (
                    <SerpPreview
                      key={index}
                      headlines={ad.headlines.map((headline) => headline.text)}
                      descriptions={ad.descriptions}
                      url={group.finalUrl.replace(/^https?:\/\//, "")}
                    />
                  ))}
                  <p className="text-[10px] text-muted-foreground">
                    {group.ads[0]?.headlines.length} headlines ·{" "}
                    {group.ads[0]?.descriptions.length} descriptions · headline 1
                    pinned
                  </p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Targeting + negatives */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="size-4 text-muted-foreground" />
            Location targeting
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.locationTargeting.map((location) => (
              <span
                key={location}
                className="rounded-full border border-border/60 bg-muted/20 px-3 py-1 text-xs"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h2 className="text-sm font-semibold">
            Negative keywords ({plan.negatives.length})
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {plan.negatives.map((negative) => (
              <span
                key={negative}
                className="rounded-full border border-red-400/20 bg-red-400/5 px-2.5 py-0.5 font-mono text-[11px] text-red-300/80"
              >
                -{negative}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Launch checklist */}
      <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ListChecks className="size-4 text-muted-foreground" />
          Launch checklist
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Conversion event: {plan.conversionEvent}
        </p>
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {plan.launchChecklist.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm">
              <span
                aria-hidden
                className="mt-1 inline-block size-3 shrink-0 rounded border border-border/80"
              />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
