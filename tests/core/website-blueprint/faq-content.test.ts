import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import {
  buildPageJsonLd,
  buildWebsiteBlueprint,
  resolveFaqBank,
  type WebsiteBlueprint,
} from "@/core/website-blueprint";
import { renderPage } from "@/features/website-renderer";

/**
 * ADR-047: the trade FAQ content bank. Crafted, researched Q&A (typical UK
 * industry ranges with provenance wording) rides the existing `qa:` channel —
 * lighting up the FAQ primitive (ADR-022) and the content-gated FAQPage
 * JSON-LD (ADR-028) that ADR-034's honesty rule kept collapsed. Trades
 * without a bank keep the honest collapse: wrong answers are worse than none.
 */

function demo(businessName: string, trade: string, location: string): WebsiteBlueprint {
  return buildWebsiteBlueprint({
    strategy: generateExperienceStrategy({ businessName, trade, location }),
  });
}

const summit = demo("Summit Roofing Rescue", "Emergency Roofing & Drainage", "Leeds");
const kerbside = demo("Kerbside Kings", "Driveways & Paving", "Manchester");
const bright = demo("Bright Smile Dental", "Dentistry", "Harrogate");
const voltway = demo("Voltway Renewables", "Solar & Battery Installation", "Leeds");
const unbanked = demo("Northern Signs", "Signwriting", "Bradford");

function qaRequirements(blueprint: WebsiteBlueprint): string[] {
  return blueprint.pages.pages[0].sections
    .filter((section) => section.identifier === "faq.reassurance-accordion")
    .flatMap((section) => section.contentRequirements ?? [])
    .filter((requirement) => requirement.startsWith("qa:"));
}

describe("resolveFaqBank — conservative trade matching", () => {
  it("matches the four researched trades", () => {
    expect(resolveFaqBank({ trade: "Emergency Roofing & Drainage" })?.id).toBe("roofing-emergency");
    expect(resolveFaqBank({ trade: "Driveways & Paving" })?.id).toBe("driveways-paving");
    expect(resolveFaqBank({ trade: "Dentistry" })?.id).toBe("dentistry");
    expect(resolveFaqBank({ trade: "Dental Practice" })?.id).toBe("dentistry");
    expect(resolveFaqBank({ trade: "Solar & Battery Installation" })?.id).toBe("electrical-solar");
    expect(resolveFaqBank({ trade: "Electrician" })?.id).toBe("electrical-solar");
  });

  it("returns null for everything else — never borrows another trade's answers", () => {
    for (const trade of ["Signwriting", "Window Cleaning", "Bathroom Fitter", "Wedding Photography", "Emergency Plumber"]) {
      expect(resolveFaqBank({ trade }), trade).toBeNull();
    }
  });

  it("each bank carries 5–6 well-formed Q&As with a research date", () => {
    for (const trade of ["Emergency Roofing & Drainage", "Driveways & Paving", "Dentistry", "Solar & Battery Installation"]) {
      const bank = resolveFaqBank({ trade })!;
      expect(bank.researchedAt).toMatch(/^2026-/);
      expect(bank.qas.length).toBeGreaterThanOrEqual(5);
      expect(bank.qas.length).toBeLessThanOrEqual(6);
      for (const qa of bank.qas) {
        expect(qa.question.length).toBeGreaterThan(10);
        expect(qa.answer.length).toBeGreaterThan(40);
        // The pipe is the qa-slot separator — it must never appear in copy.
        expect(qa.question).not.toContain("|");
        expect(qa.answer).not.toContain("|");
      }
    }
  });

  it("PROVENANCE: every figure is a typical range, never the business's price", () => {
    for (const trade of ["Emergency Roofing & Drainage", "Driveways & Paving", "Dentistry", "Solar & Battery Installation"]) {
      const bank = resolveFaqBank({ trade })!;
      const withFigures = bank.qas.filter((qa) => qa.answer.includes("£"));
      expect(withFigures.length).toBeGreaterThan(0);
      for (const qa of withFigures) {
        expect(qa.answer, `${bank.id}: "${qa.question}"`).toMatch(/typical|industry range/i);
      }
      // Somewhere the bank says plainly these are ranges, not a quote —
      // and points at getting the real figure in writing.
      expect(
        bank.qas.some((qa) => /not a quote|in writing|written/i.test(qa.answer)),
      ).toBe(true);
    }
  });
});

describe("builder emits qa: slots (the existing real-content channel)", () => {
  it("all four demo blueprints carry the bank's Q&A on the homepage FAQ", () => {
    for (const [blueprint, expected] of [
      [summit, "£150–£300"],
      [kerbside, "£110–£150"],
      [bright, "£1,400–£3,500"],
      [voltway, "£40–£70"],
    ] as const) {
      const qa = qaRequirements(blueprint);
      expect(qa.length).toBeGreaterThanOrEqual(5);
      expect(qa.join("\n")).toContain(expected);
      for (const requirement of qa) {
        const [question, answer] = requirement.slice("qa:".length).split("|");
        expect(question.trim().length).toBeGreaterThan(0);
        expect(answer?.trim().length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the questions-direction slot (validator + preview annotations)", () => {
    const faqSection = summit.pages.pages[0].sections.find(
      (section) => section.identifier === "faq.reassurance-accordion",
    )!;
    expect(
      faqSection.contentRequirements!.some((requirement) =>
        requirement.startsWith("questions-direction:"),
      ),
    ).toBe(true);
  });

  it("an unbanked trade gets NO qa slots — the honest collapse survives", () => {
    expect(qaRequirements(unbanked)).toEqual([]);
  });

  it("is deterministic", () => {
    const again = demo("Summit Roofing Rescue", "Emergency Roofing & Drainage", "Leeds");
    expect(JSON.stringify(qaRequirements(again))).toBe(JSON.stringify(qaRequirements(summit)));
  });
});

describe("FAQPage JSON-LD (ADR-028 gate now satisfied)", () => {
  it("emits FAQPage mirroring the qa content for banked trades", () => {
    for (const blueprint of [summit, kerbside, bright, voltway]) {
      const jsonLd = buildPageJsonLd(blueprint, "home", { baseUrl: "https://example.co.uk" });
      const faqPage = jsonLd.find((item) => item["@type"] === "FAQPage");
      expect(faqPage, blueprint.identity.businessName).toBeDefined();
      const questions = (faqPage as { mainEntity: unknown[] }).mainEntity;
      expect(questions.length).toBe(qaRequirements(blueprint).length);
      // Nothing internal leaks into what search engines read.
      expect(JSON.stringify(faqPage)).not.toMatch(/answer slot|content pillar|direction/i);
    }
  });

  it("still emits NO FAQPage for an unbanked trade", () => {
    const jsonLd = buildPageJsonLd(unbanked, "home", { baseUrl: "https://example.co.uk" });
    expect(jsonLd.some((item) => item["@type"] === "FAQPage")).toBe(false);
  });
});

describe("public render (ADR-034 policy, now with real content)", () => {
  it("the FAQ renders with real questions AND answers on a banked demo", () => {
    const html = renderToStaticMarkup(renderPage(summit, { mode: "public" }));
    expect(html).toContain('data-primitive="faq.reassurance-accordion"');
    expect(html).toContain("How much does an emergency roofer cost?");
    // First panel opens by default — its real answer is in the markup.
    expect(html).toContain("£150–£300");
    // No preview pencil-marks leak into public.
    expect(html).not.toMatch(/answer slot|question set slot/i);
  });

  it("the FAQ still collapses in public for an unbanked trade", () => {
    const html = renderToStaticMarkup(renderPage(unbanked, { mode: "public" }));
    expect(html).not.toContain('data-primitive="faq.reassurance-accordion"');
  });
});
