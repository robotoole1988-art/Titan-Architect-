import { describe, expect, it } from "vitest";
import {
  PRICING_CATALOGUE,
  getPricedService,
  type PricedServiceId,
} from "@/core/pricing";
import { BUILD_ITEM_KINDS, isManualBuildKind } from "@/core/business";

/**
 * THE PRICE LIST TELLS THE TRUTH (ADR-065).
 *
 * Four services — GBP, Local Services Ads, Meta ads and AI-search
 * visibility — were sold at £295 to £495 setup and £125 to £295 a month,
 * and were included in the £945 TITAN bundle. Behind each one there was a
 * build-queue row, a label, and a price. No code. The catalogue described
 * them the way it described the website engine, so a customer reading it
 * could not tell which of the two they were buying.
 *
 * That is the misrepresentation TITAN's own honesty law was written to stop
 * on a customer's website (ADR-059), one level up: a claim in a contract
 * rather than a claim on a page. It is a worse version of the same thing.
 *
 * These tests pin what is delivered by code and what is delivered by a
 * person, so the two can never quietly swap places — and so that the day
 * GBP genuinely becomes automated, flipping the field is a deliberate
 * change with a failing test behind it rather than a description edit.
 */

/** What TITAN's code actually produces today. Nothing else qualifies. */
const PLATFORM_BUILT: ReadonlyArray<PricedServiceId> = [
  "website_build",
  "lead_generation",
];

/** Real work, done by a person. No pipeline runs for any of these. */
const HAND_DELIVERED: ReadonlyArray<PricedServiceId> = [
  "seo_management",
  "gbp_management",
  "lsa_management",
  "meta_ads_management",
  "ai_search_optimisation",
];

describe("every service declares how it is delivered", () => {
  it("covers the whole catalogue", () => {
    for (const service of PRICING_CATALOGUE) {
      expect(service.delivery, service.id).toMatch(/^(platform|hand)$/);
    }
  });

  it("only the website engine and the ads plan claim to be platform-built", () => {
    for (const id of PLATFORM_BUILT) {
      expect(getPricedService(id)?.delivery, id).toBe("platform");
    }
    for (const id of HAND_DELIVERED) {
      expect(getPricedService(id)?.delivery, id).toBe("hand");
    }
  });

  it("a hand-delivered service says so in words a customer will read", () => {
    // The field is for the code; the customer only ever sees the sentence.
    // If they disagree, the sentence is the one that gets someone sued.
    for (const id of HAND_DELIVERED) {
      const service = getPricedService(id);
      expect(
        /by hand|personally|hands-on|managed for you|worked by hand/i.test(
          service?.description ?? "",
        ),
        `${id}: "${service?.description}" does not tell the customer a person does this`,
      ).toBe(true);
    }
  });

  it("no service description implies automation it does not have", () => {
    // The words that made the old catalogue read like a product spec.
    const AUTOMATION = /\b(automated|automatic|autonomous|AI-(?:powered|driven)|self-optimising|continuously optimised)\b/i;
    // Negations are stripped first, because "done by hand, not automated" is
    // the sentence we WANT and a bare word-match would ban it. Same trap the
    // company-site honesty test hit on "no testimonials": test the claim,
    // never the vocabulary.
    const claimed = (text: string) => text.replace(/\b(?:not|never|no|without)\s+\w+/gi, " ");
    for (const service of PRICING_CATALOGUE) {
      if (service.delivery === "platform") continue;
      expect(
        AUTOMATION.test(claimed(service.description)),
        `${service.id} implies automation: "${service.description}"`,
      ).toBe(false);
    }
  });
});

describe("the price list and the build queue cannot disagree", () => {
  // Two files describe the same seven deliverables in two id spaces. They
  // drifted once already — pricing sold four channels the build queue was
  // simultaneously stamping "manual".
  const BUILD_KIND_TO_SERVICE: Record<string, PricedServiceId | null> = {
    website: "website_build",
    google_ads: "lead_generation",
    seo: "seo_management",
    gbp: "gbp_management",
    lsa: "lsa_management",
    meta_ads: "meta_ads_management",
    ai_search: "ai_search_optimisation",
  };

  it("maps every build item to a priced service", () => {
    for (const kind of BUILD_ITEM_KINDS) {
      const id = BUILD_KIND_TO_SERVICE[kind];
      expect(id, `build kind "${kind}" has no priced service`).toBeTruthy();
      expect(getPricedService(id as PricedServiceId), kind).toBeDefined();
    }
  });

  it("agrees on which items a person delivers", () => {
    for (const kind of BUILD_ITEM_KINDS) {
      const service = getPricedService(BUILD_KIND_TO_SERVICE[kind] as PricedServiceId);
      // google_ads is the one honest split: the plan is generated, the
      // launch is manual. The build queue calls it manual because a person
      // presses go; pricing calls it platform because TITAN builds the
      // campaign. Both are true, and the description carries the nuance.
      if (kind === "google_ads") continue;
      expect(
        service?.delivery === "hand",
        `${kind}: build queue says manual=${isManualBuildKind(kind)}, pricing says ${service?.delivery}`,
      ).toBe(isManualBuildKind(kind));
    }
  });
});

describe("the bundles do not hide what is in them", () => {
  it("the TITAN bundle says which parts are delivered by hand", () => {
    // £945/month for seven services, five of which a person does. A buyer
    // reading only the bundle line would otherwise never learn that.
    const bundle = getPricedService("titan_bundle");
    expect(bundle?.description).toMatch(/by hand|delivered by hand/i);
  });

  it("every bundle's parts exist in the catalogue", () => {
    for (const service of PRICING_CATALOGUE.filter((s) => s.bundle)) {
      for (const part of service.includedServices ?? []) {
        expect(getPricedService(part), `${service.id} includes unknown ${part}`).toBeDefined();
      }
    }
  });
});
