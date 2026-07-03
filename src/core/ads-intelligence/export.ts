/**
 * Google Ads Editor CSV exports (ADR-031). Column headers are PINNED by
 * tests — a format change is a deliberate version bump, not drift. The plan
 * imports in minutes instead of being retyped.
 */

import { RSA_LIMITS, type CampaignPlan } from "./model";

export interface CampaignCsvs {
  campaigns: string;
  adGroups: string;
  keywords: string;
  ads: string;
}

function cell(value: string | number | undefined): string {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function rows(lines: ReadonlyArray<ReadonlyArray<string | number | undefined>>): string {
  return lines.map((line) => line.map(cell).join(",")).join("\n") + "\n";
}

const MATCH_TYPE_LABEL = { phrase: "Phrase", exact: "Exact" } as const;

export function buildCampaignCsvs(plan: CampaignPlan): CampaignCsvs {
  const campaigns = rows([
    ["Campaign", "Campaign Type", "Budget", "Budget type", "Status", "Location"],
    ...plan.campaigns.map((campaign) => [
      campaign.name,
      "Search",
      plan.budget.daily,
      "Daily",
      "Paused",
      plan.locationTargeting.join("; "),
    ]),
  ]);

  const adGroups = rows([
    ["Campaign", "Ad Group", "Status"],
    ...plan.campaigns.flatMap((campaign) =>
      campaign.adGroups.map((group) => [campaign.name, group.name, "Enabled"]),
    ),
  ]);

  const keywords = rows([
    ["Campaign", "Ad Group", "Keyword", "Criterion Type", "Status"],
    ...plan.campaigns.flatMap((campaign) =>
      campaign.adGroups.flatMap((group) =>
        group.keywords.map((keyword) => [
          campaign.name,
          group.name,
          keyword.text,
          MATCH_TYPE_LABEL[keyword.matchType],
          "Enabled",
        ]),
      ),
    ),
  ]);

  const headlineColumns = Array.from(
    { length: RSA_LIMITS.maxHeadlines },
    (_, index) => `Headline ${index + 1}`,
  );
  const descriptionColumns = Array.from(
    { length: RSA_LIMITS.maxDescriptions },
    (_, index) => `Description ${index + 1}`,
  );
  const ads = rows([
    [
      "Campaign",
      "Ad Group",
      "Ad Type",
      ...headlineColumns,
      ...descriptionColumns,
      "Path 1",
      "Path 2",
      "Final URL",
    ],
    ...plan.campaigns.flatMap((campaign) =>
      campaign.adGroups.flatMap((group) =>
        group.ads.map((ad) => [
          campaign.name,
          group.name,
          "Responsive search ad",
          ...Array.from({ length: RSA_LIMITS.maxHeadlines }, (_, index) =>
            ad.headlines[index]?.text ?? "",
          ),
          ...Array.from({ length: RSA_LIMITS.maxDescriptions }, (_, index) =>
            ad.descriptions[index] ?? "",
          ),
          ad.path1 ?? "",
          ad.path2 ?? "",
          group.finalUrl,
        ]),
      ),
    ),
  ]);

  return { campaigns, adGroups, keywords, ads };
}
