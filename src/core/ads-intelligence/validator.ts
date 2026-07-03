/**
 * Campaign plan validator (ADR-031). What passes here is legal to import:
 * RSA character limits, keyword hygiene, and landing URLs that actually
 * exist on the live publication. Returns EVERY violation, not the first.
 */

import { RSA_LIMITS, type CampaignPlan } from "./model";

export interface CampaignPlanValidation {
  valid: boolean;
  errors: string[];
}

export function validateCampaignPlan(
  plan: CampaignPlan,
  options: { validUrls: ReadonlyArray<string> },
): CampaignPlanValidation {
  const errors: string[] = [];
  const urls = new Set(options.validUrls);

  for (const campaign of plan.campaigns) {
    if (campaign.adGroups.length === 0) {
      errors.push(`campaign "${campaign.name}": no ad groups`);
    }
    for (const group of campaign.adGroups) {
      const where = `ad group "${group.name}"`;

      if (group.keywords.length === 0) errors.push(`${where}: no keywords`);
      const seen = new Set<string>();
      for (const keyword of group.keywords) {
        const key = `${keyword.matchType}:${keyword.text}`;
        if (seen.has(key)) errors.push(`${where}: duplicate keyword ${key}`);
        seen.add(key);
        if (!keyword.text.trim()) errors.push(`${where}: empty keyword`);
      }

      if (!urls.has(group.finalUrl)) {
        errors.push(`${where}: final URL ${group.finalUrl} is not a live page`);
      }

      if (group.ads.length === 0) errors.push(`${where}: no ads`);
      for (const ad of group.ads) {
        if (ad.headlines.length < RSA_LIMITS.minHeadlines) {
          errors.push(`${where}: RSA needs ≥${RSA_LIMITS.minHeadlines} headlines`);
        }
        if (ad.headlines.length > RSA_LIMITS.maxHeadlines) {
          errors.push(`${where}: RSA allows ≤${RSA_LIMITS.maxHeadlines} headlines`);
        }
        if (ad.descriptions.length < RSA_LIMITS.minDescriptions) {
          errors.push(`${where}: RSA needs ≥${RSA_LIMITS.minDescriptions} descriptions`);
        }
        if (ad.descriptions.length > RSA_LIMITS.maxDescriptions) {
          errors.push(`${where}: RSA allows ≤${RSA_LIMITS.maxDescriptions} descriptions`);
        }
        for (const headline of ad.headlines) {
          if (headline.text.length > RSA_LIMITS.headlineChars) {
            errors.push(
              `${where}: headline over ${RSA_LIMITS.headlineChars} chars: "${headline.text}"`,
            );
          }
        }
        for (const description of ad.descriptions) {
          if (description.length > RSA_LIMITS.descriptionChars) {
            errors.push(
              `${where}: description over ${RSA_LIMITS.descriptionChars} chars`,
            );
          }
        }
      }
    }
  }

  const negativeSet = new Set(plan.negatives);
  if (negativeSet.size !== plan.negatives.length) {
    errors.push("negative keyword list contains duplicates");
  }

  return { valid: errors.length === 0, errors };
}
