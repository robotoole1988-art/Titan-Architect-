import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import {
  buildPageJsonLd,
  buildWebsiteBlueprint,
  type VerifiedReviewInput,
} from "@/core/website-blueprint";

/**
 * ADR-053 §JSON-LD: Review/AggregateRating emit ONLY from ingested verified
 * reviews — content-gated exactly like FAQPage (ADR-047). No reviews →
 * byte-identical output to before this feature existed.
 */

const blueprint = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Summit Roofing Rescue",
    trade: "Emergency Roofing & Drainage",
    location: "Leeds",
  }),
});
const pageId = blueprint.pages.pages[0].id;
const BASE = { baseUrl: "https://summit.example" };

const REVIEWS: VerifiedReviewInput[] = [
  { customerName: "Priya Patel", rating: 5, text: "Same-day fix.", reviewedAt: "2026-07-01" },
  { customerName: "James Whitfield", rating: 4, text: "Quick and tidy.", reviewedAt: "2026-06-14" },
];

function localBusiness(items: ReturnType<typeof buildPageJsonLd>) {
  return items.find((item) => item["@type"] === "LocalBusiness") as Record<string, unknown>;
}

describe("review JSON-LD gating (ADR-053)", () => {
  it("emits NOTHING review-shaped without verified reviews — byte-identical output", () => {
    const withoutOption = buildPageJsonLd(blueprint, pageId, BASE);
    const emptyOption = buildPageJsonLd(blueprint, pageId, { ...BASE, reviews: [] });
    expect(JSON.stringify(withoutOption)).toBe(JSON.stringify(emptyOption));
    const business = localBusiness(withoutOption);
    expect(business.aggregateRating).toBeUndefined();
    expect(business.review).toBeUndefined();
  });

  it("attaches AggregateRating + Review to LocalBusiness from verified reviews", () => {
    const items = buildPageJsonLd(blueprint, pageId, { ...BASE, reviews: REVIEWS });
    const business = localBusiness(items);
    expect(business.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 2,
      bestRating: 5,
      worstRating: 1,
    });
    const reviews = business.review as Array<Record<string, unknown>>;
    expect(reviews).toHaveLength(2);
    expect(reviews[0]).toEqual({
      "@type": "Review",
      author: { "@type": "Person", name: "Priya Patel" },
      reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5, worstRating: 1 },
      reviewBody: "Same-day fix.",
      datePublished: "2026-07-01",
    });
  });

  it("filters malformed input defensively — never a broken Rating", () => {
    const items = buildPageJsonLd(blueprint, pageId, {
      ...BASE,
      reviews: [
        { customerName: "", rating: 5, text: "no name", reviewedAt: "2026-07-01" },
        { customerName: "Bad Rating", rating: 7, text: "x", reviewedAt: "2026-07-01" },
        { customerName: "Fractional", rating: 4.5, text: "x", reviewedAt: "2026-07-01" },
        { customerName: "Blank", rating: 5, text: "   ", reviewedAt: "2026-07-01" },
      ],
    });
    const business = localBusiness(items);
    expect(business.aggregateRating).toBeUndefined();
    expect(business.review).toBeUndefined();
  });
});
