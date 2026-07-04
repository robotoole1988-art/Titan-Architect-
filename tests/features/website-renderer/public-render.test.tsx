import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint, buildPageJsonLd } from "@/core/website-blueprint";
import { renderPage } from "@/features/website-renderer";

/**
 * ADR-034: the drawing and the building are different things.
 *
 * PUBLIC mode is the customer's building — zero internal scaffolding, ever.
 * PREVIEW mode is the architect's drawing — annotations stay. This suite is
 * the structural enforcement: it renders demo-shaped blueprints (project +
 * emergency archetypes, area pages included) and fails CI on any scaffolding
 * marker in public markup.
 */

// The two demo shapes: a project-archetype driveways business and an
// emergency-archetype roofing business, both with coverage areas.
const kerbside = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Kerbside Kings",
    trade: "Driveways & Paving",
    location: "Manchester",
  }),
  coverageAreas: ["Sale", "Stockport"],
});
const summit = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Summit Roofing Rescue",
    trade: "Emergency Roofing & Drainage",
    location: "Leeds",
  }),
  coverageAreas: ["Headingley", "Horsforth"],
});

const DEMOS = [
  { name: "Kerbside Kings (project)", blueprint: kerbside },
  { name: "Summit Roofing Rescue (emergency)", blueprint: summit },
];

/**
 * The denylist: every marker class of internal scaffolding found in the
 * strategy-partner review. A hit on a PUBLIC page is a build failure.
 */
const SCAFFOLDING_MARKERS: ReadonlyArray<RegExp> = [
  /media slot/i, // "before · media slot", gallery slot chips
  /media brief/i, // hero media-brief annotations
  /backdrop direction/i, // cinematic hero annotation
  /verified review slot/i, // review wall slot cards
  /answer slot/i, // FAQ placeholder annotations
  /question set slot/i,
  /lead-capture slot/i,
  /response note/i, // location annotation chip
  /surface texture · suggestive/i,
  /border-dashed/, // dashed placeholder chips/frames
  /contact details for/i, // footer placeholder chips
  /accreditations and guarantees/i,
  /copyright notice/i, // placeholder legal chips
  /privacy policy<\/span>/i, // placeholder legal chip (not a real link)
  /Dream \(/, // arc stage names as copy
  /Doubt \(/,
  /\bDoubt\b/, // the word must never be customer-visible
  /Guide \(/,
  /Panic \(/,
  /Transformation \(/,
  /narrative arc/i, // "Map the engagement to the narrative arc — …"
  /awaiting real/i, // "awaiting real footage/reviews/answers"
  /this content pillar/i,
  /data-signature-moment/, // morph retreat (ADR-032 addendum): public never
];

function renderPublicPage(blueprint: typeof kerbside, pageId?: string): string {
  return renderToStaticMarkup(
    renderPage(blueprint, {
      mode: "public",
      pageId,
      contact: { phone: "0161 000 0000", email: "hello@example.co.uk" },
    }),
  );
}

describe("public mode — zero scaffolding on ANY page of either demo shape", () => {
  for (const demo of DEMOS) {
    for (const page of demo.blueprint.pages.pages) {
      it(`${demo.name} · page "${page.id}" is customer-grade`, () => {
        const html = renderPublicPage(demo.blueprint, page.id);
        for (const marker of SCAFFOLDING_MARKERS) {
          const hit = html.match(marker);
          expect(
            hit,
            `scaffolding "${marker}" leaked into public markup: "…${
              hit ? html.slice(Math.max(0, hit.index! - 80), hit.index! + 80) : ""
            }…"`,
          ).toBeNull();
        }
      });
    }
  }
});

describe("public mode — empty-state policy: honesty means absence", () => {
  it("collapses the review wall when no verified reviews exist (never empty stars)", () => {
    const html = renderPublicPage(kerbside);
    expect(html).not.toContain('data-primitive="trust.review-wall"');
  });

  it("collapses the FAQ when the blueprint has no complete Q&A copy", () => {
    for (const demo of DEMOS) {
      const html = renderPublicPage(demo.blueprint);
      expect(html).not.toContain('data-primitive="faq.reassurance-accordion"');
    }
  });

  it("never emits FAQPage JSON-LD without real answers", () => {
    for (const demo of DEMOS) {
      for (const page of demo.blueprint.pages.pages) {
        const jsonLd = buildPageJsonLd(demo.blueprint, page.id, {
          baseUrl: "https://example.co.uk",
        });
        expect(jsonLd.some((item) => item["@type"] === "FAQPage")).toBe(false);
        expect(JSON.stringify(jsonLd)).not.toMatch(/answer slot|content pillar/i);
      }
    }
  });

  it("footer renders REAL business data and omits what it does not have", () => {
    const withContact = renderPublicPage(kerbside);
    expect(withContact).toContain("0161 000 0000");
    expect(withContact).toContain("hello@example.co.uk");
    // Without a contact record, the fields are simply absent — no placeholder.
    const without = renderToStaticMarkup(
      renderPage(kerbside, { mode: "public" }),
    );
    expect(without).not.toMatch(/contact details/i);
    // The real copyright line replaces the "copyright notice" chip.
    expect(without).toContain("©");
    expect(without).toContain("Kerbside Kings");
  });
});

describe("public mode — arc metadata becomes customer copy", () => {
  it("renders real journey steps, never framework stage names", () => {
    const html = renderPublicPage(kerbside);
    expect(html).not.toMatch(/Dream|Doubt|→ Guide/);
    // The builder's customer journey renders as the process steps:
    const journey = kerbside.pages.pages[0].sections
      .flatMap((section) => section.contentRequirements ?? [])
      .find((requirement) => requirement.startsWith("journey-steps:"));
    expect(journey, "builder must emit a journey-steps slot").toBeDefined();
  });

  it("renders the homeowner-fear quote unattributed — it is the customer's inner voice", () => {
    const html = renderPublicPage(kerbside);
    const quote = kerbside.pages.pages[0].sections
      .flatMap((section) => section.contentRequirements ?? [])
      .find((requirement) => requirement.startsWith("objective:"))
      ?.match(/[“"]([^”"]+)[”"]/)?.[1];
    if (quote) {
      const anchor = html.indexOf("“");
      expect(anchor).toBeGreaterThan(-1);
      // The business name must not be rendered as the quote's attribution
      // (checked structurally in the primitive: no attribution element).
      expect(html).not.toContain("data-quote-attribution");
    }
  });
});

describe("public mode — the serialized element tree is ALSO clean", () => {
  // Client-component props are serialized into the page payload (RSC flight
  // data). Blueprint intent must not reach it: the redaction layer strips
  // internal slots/sections/extensions before props are handed over.
  it("no blueprint intent survives in any prop passed to primitives", () => {
    for (const demo of DEMOS) {
      const tree = JSON.stringify(
        renderPage(demo.blueprint, { mode: "public" }),
        (key, value) => (typeof value === "function" ? undefined : value),
      );
      for (const marker of [
        /narrative-arc:/,
        /\bDoubt\b/,
        /Dream \(/,
        /experienceArc/,
        /-direction:/,
        /contact details for/i,
        /copyright notice/i,
        /suggestedComponents":\[\{/,
      ]) {
        const hit = tree.match(marker);
        expect(
          hit,
          `"${marker}" leaked into serialized props: …${
            hit ? tree.slice(Math.max(0, hit.index! - 80), hit.index! + 80) : ""
          }…`,
        ).toBeNull();
      }
    }
  });
});

describe("legacy strategy artifacts (pre-ADR-034, no customerJourney)", () => {
  it("still builds and never leaks arc names", () => {
    const legacyStrategy = structuredClone(
      generateExperienceStrategy({
        businessName: "Kerbside Kings",
        trade: "Driveways & Paving",
        location: "Manchester",
      }),
    );
    delete (legacyStrategy.storytelling as { customerJourney?: unknown })
      .customerJourney;
    const legacyBlueprint = buildWebsiteBlueprint({ strategy: legacyStrategy });
    const html = renderPublicPage(legacyBlueprint);
    expect(html).not.toMatch(/\bDoubt\b|Dream \(|narrative arc/);
    expect(html).toContain("A clear, fixed quote"); // the fallback steps
  });
});

describe("preview mode — the drawing KEEPS its pencil marks", () => {
  it("annotations still render for the founder", () => {
    const html = renderToStaticMarkup(renderPage(kerbside));
    expect(html).toContain("border-dashed");
  });
});
