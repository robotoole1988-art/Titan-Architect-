import { describe, expect, it } from "vitest";
import {
  buildCampaignCsvs,
  generateCampaignPlan,
  validateCampaignPlan,
  type CampaignPlanInput,
} from "@/core/ads-intelligence";

/** Ads Intelligence v1 (ADR-031): deterministic Search campaign build sheets. */

const INPUT: CampaignPlanInput = {
  business: {
    name: "Kerbside Kings",
    trade: "Driveways & Paving",
    tradeId: "driveways-paving",
    location: "Manchester",
    coverageAreas: ["Sale", "Stockport"],
  },
  deal: {
    leadTargetPerMonth: 50,
    cplUsed: 40,
    cplSource: "founder input",
    monthlyAdSpend: 2000,
  },
  site: {
    baseUrl: "https://kerbside-kings.example",
    pages: [
      { path: "/", name: "Home" },
      { path: "/sale", name: "Sale" },
      { path: "/stockport", name: "Stockport" },
    ],
  },
};

const plan = generateCampaignPlan(INPUT);

describe("generateCampaignPlan", () => {
  it("is deterministic", () => {
    expect(JSON.stringify(generateCampaignPlan(INPUT))).toBe(
      JSON.stringify(plan),
    );
  });

  it("structures ad groups per service × area", () => {
    const campaign = plan.campaigns[0];
    expect(campaign.goal).toBe("lead_generation");
    // Ad groups cover the areas (plus the homepage/core group).
    const areas = campaign.adGroups.map((group) => group.area ?? "core");
    expect(areas).toContain("Sale");
    expect(areas).toContain("Stockport");
    expect(campaign.adGroups.length).toBeGreaterThanOrEqual(4);
    for (const group of campaign.adGroups) {
      expect(group.keywords.length, `${group.name} has no keywords`).toBeGreaterThan(0);
      expect(group.ads.length, `${group.name} has no ads`).toBeGreaterThan(0);
    }
  });

  it("builds keywords from service × area × archetype intent, phrase + exact, no dupes", () => {
    const saleGroups = plan.campaigns[0].adGroups.filter((g) => g.area === "Sale");
    const texts = saleGroups.flatMap((g) => g.keywords.map((k) => `${k.matchType}:${k.text}`));
    // Area-localised service terms exist.
    expect(texts.some((t) => t.includes("sale"))).toBe(true);
    // Project archetype → cost/quote intent, NOT emergency urgency.
    expect(texts.some((t) => /cost|quote|price/.test(t))).toBe(true);
    expect(texts.some((t) => /emergency|24 hour/.test(t))).toBe(false);
    // Both match types, no duplicates within any group.
    for (const group of plan.campaigns[0].adGroups) {
      const kws = group.keywords.map((k) => `${k.matchType}:${k.text}`);
      expect(new Set(kws).size).toBe(kws.length);
      expect(group.keywords.some((k) => k.matchType === "phrase")).toBe(true);
      expect(group.keywords.some((k) => k.matchType === "exact")).toBe(true);
    }
  });

  it("seeds rich per-trade negatives", () => {
    expect(plan.negatives).toEqual(expect.arrayContaining(["jobs", "careers", "diy", "free", "courses"]));
    expect(plan.negatives.length).toBeGreaterThanOrEqual(12);
    expect(new Set(plan.negatives).size).toBe(plan.negatives.length);
  });

  it("respects RSA limits with pinning suggestions", () => {
    for (const group of plan.campaigns[0].adGroups) {
      for (const ad of group.ads) {
        expect(ad.headlines.length).toBeGreaterThanOrEqual(3);
        expect(ad.headlines.length).toBeLessThanOrEqual(15);
        expect(ad.descriptions.length).toBeGreaterThanOrEqual(2);
        expect(ad.descriptions.length).toBeLessThanOrEqual(4);
        for (const headline of ad.headlines) {
          expect(headline.text.length, `headline too long: "${headline.text}"`).toBeLessThanOrEqual(30);
        }
        for (const description of ad.descriptions) {
          expect(description.length, `description too long`).toBeLessThanOrEqual(90);
        }
        expect(ad.headlines.some((h) => h.pin === 1)).toBe(true);
      }
    }
  });

  it("maps every ad group to a REAL published page", () => {
    const validPaths = new Set(INPUT.site.pages.map((p) => `${INPUT.site.baseUrl}${p.path === "/" ? "" : p.path}`));
    for (const group of plan.campaigns[0].adGroups) {
      expect(validPaths.has(group.finalUrl), `${group.name} → ${group.finalUrl} not a live page`).toBe(true);
      if (group.area === "Sale") expect(group.finalUrl).toContain("/sale");
    }
  });

  it("derives budget from the deal with its working: 50 × £40 → £2,000/mo → £65.79/day", () => {
    expect(plan.budget.leadTargetPerMonth).toBe(50);
    expect(plan.budget.cplUsed).toBe(40);
    expect(plan.budget.monthly).toBe(2000);
    expect(plan.budget.daily).toBe(65.79);
    expect(plan.budget.working).toContain("50");
    expect(plan.budget.working).toContain("£40");
    expect(plan.budget.working).toContain("£2,000");
    expect(plan.budget.working).toContain("£65.79");
    expect(plan.budget.cplSource).toBe("founder input");
  });

  it("targets the coverage areas + base location", () => {
    expect(plan.locationTargeting).toEqual(["Manchester", "Sale", "Stockport"]);
  });

  it("recommends the staged bid strategy and wires conversions to the enquiry form", () => {
    expect(plan.bidStrategy.initial.toLowerCase()).toContain("maximise clicks");
    expect(plan.bidStrategy.switchAt.toLowerCase()).toContain("30 conversions");
    const checklist = plan.launchChecklist.join("\n").toLowerCase();
    expect(checklist).toContain("conversion tracking");
    expect(checklist).toContain("negative keyword");
    expect(plan.conversionEvent.toLowerCase()).toContain("enquiry form");
  });
});

describe("validateCampaignPlan", () => {
  it("passes the generated plan", () => {
    const result = validateCampaignPlan(plan, {
      validUrls: INPUT.site.pages.map(
        (p) => `${INPUT.site.baseUrl}${p.path === "/" ? "" : p.path}`,
      ),
    });
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it("catches long headlines, empty groups, dupes, and dead URLs", () => {
    const broken = structuredClone(plan) as typeof plan;
    const group = broken.campaigns[0].adGroups[0];
    group.ads[0].headlines[0].text = "This headline is far too long for Google Ads";
    group.keywords.push({ ...group.keywords[0] });
    broken.campaigns[0].adGroups[1].keywords = [];
    broken.campaigns[0].adGroups[2].finalUrl = "https://kerbside-kings.example/nope";
    const result = validateCampaignPlan(broken, {
      validUrls: INPUT.site.pages.map(
        (p) => `${INPUT.site.baseUrl}${p.path === "/" ? "" : p.path}`,
      ),
    });
    expect(result.valid).toBe(false);
    const all = result.errors.join("\n");
    expect(all).toMatch(/30/);
    expect(all).toMatch(/duplicate/i);
    expect(all).toMatch(/no keywords/i);
    expect(all).toMatch(/not a live page|unknown page|not.*live/i);
  });
});

describe("buildCampaignCsvs", () => {
  const csvs = buildCampaignCsvs(plan);

  it("emits the four Google Ads Editor files with pinned headers", () => {
    expect(csvs.campaigns.split("\n")[0]).toBe(
      "Campaign,Campaign Type,Budget,Budget type,Status,Location",
    );
    expect(csvs.adGroups.split("\n")[0]).toBe("Campaign,Ad Group,Status");
    expect(csvs.keywords.split("\n")[0]).toBe(
      "Campaign,Ad Group,Keyword,Criterion Type,Status",
    );
    expect(csvs.ads.split("\n")[0]).toContain("Headline 1");
    expect(csvs.ads.split("\n")[0]).toContain("Description 1");
    expect(csvs.ads.split("\n")[0]).toContain("Final URL");
  });

  it("row counts match the plan", () => {
    const keywordRows = csvs.keywords.trim().split("\n").length - 1;
    const planKeywords = plan.campaigns[0].adGroups.reduce(
      (sum, group) => sum + group.keywords.length,
      0,
    );
    expect(keywordRows).toBe(planKeywords);
    const adRows = csvs.ads.trim().split("\n").length - 1;
    const planAds = plan.campaigns[0].adGroups.reduce(
      (sum, group) => sum + group.ads.length,
      0,
    );
    expect(adRows).toBe(planAds);
  });

  it("escapes commas and quotes safely", () => {
    const doctored = structuredClone(plan) as typeof plan;
    doctored.campaigns[0].adGroups[0].ads[0].descriptions[0] =
      'Says "best value", honestly';
    const out = buildCampaignCsvs(doctored).ads;
    expect(out).toContain('"Says ""best value"", honestly"');
  });
});
