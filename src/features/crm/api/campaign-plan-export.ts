/**
 * Campaign plan CSV exports (ADR-031) — called by the /api/campaign-plan
 * route. Google Ads Editor-compatible files from the LATEST plan artifact.
 */

import { buildCampaignCsvs, type CampaignPlan } from "@/core/ads-intelligence";
import { resolveBusinessSpine } from "@/core/business";

const FILES = ["campaigns", "adgroups", "keywords", "ads"] as const;
export type CampaignCsvFile = (typeof FILES)[number];

export function isCampaignCsvFile(value: string): value is CampaignCsvFile {
  return (FILES as readonly string[]).includes(value);
}

export async function getCampaignPlanCsv(
  businessId: string,
  file: CampaignCsvFile,
): Promise<{ filename: string; csv: string } | null> {
  const spine = await resolveBusinessSpine();
  const [business, artifact] = await Promise.all([
    spine.businesses.get(businessId),
    spine.artifacts.latest<CampaignPlan>(businessId, "campaign_plan"),
  ]);
  if (!business || !artifact) return null;
  const csvs = buildCampaignCsvs(artifact.payload);
  const content = {
    campaigns: csvs.campaigns,
    adgroups: csvs.adGroups,
    keywords: csvs.keywords,
    ads: csvs.ads,
  }[file];
  const slug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    filename: `${slug}-campaign-plan-v${artifact.version}-${file}.csv`,
    csv: content,
  };
}
