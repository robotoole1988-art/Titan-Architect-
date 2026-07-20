import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage } from "@/features/website-renderer";
import type { ResolvedReview } from "@/features/website-renderer";

/**
 * ADR-053: the review wall renders VERIFIED reviews — and only those.
 * Without them the public wall collapses (enforced in public-render.test);
 * with them, real names, real dates, filled stars, a source label — and
 * never a scaffolding marker.
 */

const summit = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Summit Roofing Rescue",
    trade: "Emergency Roofing & Drainage",
    location: "Leeds",
  }),
  coverageAreas: ["Headingley"],
});

const REVIEWS: ResolvedReview[] = [
  {
    customerName: "Priya Patel",
    rating: 5,
    text: "Roof fixed the same day we called — brilliant.",
    reviewedAt: "2026-07-01",
    source: "direct",
  },
  {
    customerName: "James Whitfield",
    rating: 4,
    text: "Storm damage sorted quickly and tidily.",
    reviewedAt: "2026-06-14",
    source: "google",
  },
];

function renderPublic(reviews?: ResolvedReview[]): string {
  return renderToStaticMarkup(
    renderPage(summit, { mode: "public", onUnmapped: "skip", ...(reviews ? { reviews } : {}) }),
  );
}

describe("trust.review-wall with verified reviews (ADR-053)", () => {
  it("renders real reviews on the public page", () => {
    const html = renderPublic(REVIEWS);
    expect(html).toContain("Priya Patel");
    expect(html).toContain("Roof fixed the same day");
    expect(html).toContain("James Whitfield");
    expect(html).toContain("Verified customer");
    expect(html).toContain("Google review");
    expect(html).toContain("July 2026");
    expect(html).toContain("Rated 5 out of 5");
    expect(html).toContain("Rated 4 out of 5");
  });

  it("carries no scaffolding even with reviews present", () => {
    const html = renderPublic(REVIEWS);
    expect(html).not.toMatch(/verified review slot/i);
    expect(html).not.toMatch(/review themes/i);
    expect(html).not.toMatch(/curate reviews/i);
  });

  it("still collapses entirely on public pages without verified reviews", () => {
    const html = renderPublic();
    expect(html).not.toContain("What customers say");
    expect(html).not.toContain("Rated ");
  });

  it("preview mode shows real reviews too when they exist", () => {
    const html = renderToStaticMarkup(
      renderPage(summit, { mode: "preview", onUnmapped: "skip", reviews: REVIEWS }),
    );
    expect(html).toContain("Priya Patel");
    expect(html).not.toMatch(/verified review slot/i);
  });
});
