import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import {
  TRADE_TAXONOMY,
  getTradeDefinition,
  humaniseTradePhrase,
  matchTradeId,
  tradePhrase,
} from "@/core/trade-taxonomy";
import {
  SECTION_PRIMITIVE_REGISTRY,
  buildWebsiteBlueprint,
} from "@/core/website-blueprint";
import { resolveFaqBank } from "@/core/website-blueprint/faq-content";
import { renderPage } from "@/features/website-renderer";

/**
 * NOTHING INTERNAL REACHES THE CUSTOMER'S PAGE (ADR-061).
 *
 * Four measured defects, all of them visible to the first visitor:
 *
 *  1. The H1 interpolated `trade.toLowerCase()`. Live headlines read
 *     "Certified, future-proof solar pv in Leeds", "Leeds's mot & servicing,
 *     done right", "Gentle, expert dentists (private) in Leeds".
 *  2. Sections printed their REGISTRY NAME as a visible label. "Lead
 *     Capture" appeared on 100% of pages, above the enquiry form.
 *  3. The FAQ bank matched `/roof/i`, so "Damp Proofing" — p-ROOF-ing —
 *     shipped six emergency-roofing questions including "Will my insurance
 *     cover storm damage?". The same substring trap ADR-059 found in the
 *     accreditation map.
 *  4. An off-taxonomy trade printed the SEO content pillars as its service
 *     list: "design inspiration", "Leeds & area pages".
 */

const TRADES = TRADE_TAXONOMY as ReadonlyArray<{
  id: string;
  label: string;
  customerName: string;
}>;

const REGISTRY_NAMES = Object.values(SECTION_PRIMITIVE_REGISTRY).map(
  (primitive) => (primitive as { name: string }).name,
);

/** Legal pages are titled by name legitimately — those are real page titles. */
const LEGITIMATE_NAMES = new Set(["Privacy Policy", "Terms & Legal Notice"]);

function publicHtml(trade: string, location = "Leeds"): string {
  const blueprint = buildWebsiteBlueprint({
    strategy: generateExperienceStrategy({
      businessName: "Probe Ltd",
      trade,
      location,
    }),
  });
  return renderToStaticMarkup(renderPage(blueprint, { mode: "public" }));
}

function headlineOf(html: string): string {
  const raw = html.match(/<h1[^>]*>([^<]+)/)?.[1] ?? "";
  return raw.replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
}

describe("the trade as a customer reads it", () => {
  it("every trade has a customer-facing name distinct from its ops label", () => {
    expect(TRADES.length).toBeGreaterThanOrEqual(30);
    for (const trade of TRADES) {
      expect(trade.customerName, trade.id).toBeTruthy();
      // Operational qualifiers never survive into the customer name.
      expect(trade.customerName, trade.id).not.toMatch(/[()/]|—/);
      expect(tradePhrase(trade.label)).toBe(trade.customerName);
    }
  });

  it("acronyms keep their capitals, off-taxonomy included", () => {
    expect(tradePhrase("Solar PV")).toBe("solar PV");
    expect(tradePhrase("MOT & Servicing")).toBe("MOT & servicing");
    expect(tradePhrase("Dentists (Private)")).toBe("private dentistry");
    // The fallback path for a trade nobody has classified.
    expect(humaniseTradePhrase("Pest Control")).toBe("pest control");
    expect(humaniseTradePhrase("EV Charger Repairs")).toBe("EV charger repairs");
    expect(humaniseTradePhrase("Ducting (HVAC) Cleaning")).toBe("ducting cleaning");
  });

  it("NO headline carries a lowercased acronym or an internal qualifier", () => {
    for (const trade of TRADES) {
      const headline = headlineOf(publicHtml(trade.label));
      expect(headline.length, trade.label).toBeGreaterThan(10);
      // The exact defects: "solar pv", "mot & servicing", "(private)".
      expect(headline, trade.label).not.toMatch(/\bpv\b|\bmot\b|\bhvac\b|\bev\b/);
      expect(headline, `${trade.label} leaked a parenthetical`).not.toContain("(");
      expect(headline, `${trade.label} leaked ops shorthand`).not.toContain("—");
      expect(headline, `${trade.label} leaked a slash`).not.toContain("/");
    }
  });

  it("a free-text trade outside the taxonomy still reads properly", () => {
    expect(headlineOf(publicHtml("Pest Control"))).toContain("pest control");
  });
});

describe("no internal vocabulary on a public page", () => {
  it("no section prints its registry name to a visitor, in any archetype", () => {
    // Five archetypes; the care pair (Gentle Welcome / Team Introduction)
    // only appears on dental, and was missed by the first sweep.
    for (const trade of [
      "Driveways & Paving",
      "Solar PV",
      "Emergency Roofing & Drainage",
      "Dentists (Private)",
      "Landscaping",
    ]) {
      const html = publicHtml(trade);
      for (const name of REGISTRY_NAMES) {
        if (LEGITIMATE_NAMES.has(name)) continue;
        expect(html, `${trade} printed "${name}" to the customer`).not.toContain(
          name,
        );
      }
    }
  });

  it("the founder's preview keeps them — they are useful scaffolding", () => {
    const blueprint = buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({
        businessName: "Probe Ltd",
        trade: "Driveways & Paving",
        location: "Leeds",
      }),
    });
    const html = renderToStaticMarkup(renderPage(blueprint, { mode: "preview" }));
    expect(html).toContain("Lead Capture");
  });
});

describe("the FAQ substring trap", () => {
  it("damp proofing is not a roofer", () => {
    // "roof" hides inside "p-ROOF-ing". This shipped six emergency-roofing
    // answers — callout costs, storm damage, insurance claims — on a
    // damp-proofing site.
    expect(resolveFaqBank({ trade: "Damp Proofing", tradeId: "damp-proofing" })).toBeNull();
    // …while real roofers still get the roofing bank.
    expect(resolveFaqBank({ trade: "Roofing", tradeId: "roofing" })?.id).toBe(
      "roofing-emergency",
    );
    expect(
      resolveFaqBank({ trade: "Emergency Roofing & Drainage" })?.id,
    ).toBe("roofing-emergency");
  });

  it("no other bank matches on a buried substring either", () => {
    // "dent" inside "accident"/"independent"; "paving" and "electric" were
    // checked the same way.
    for (const [trade, expected] of [
      ["Accident Repair", null],
      ["Independent Financial Advice", null],
      ["Resident Services", null],
      ["Dentists (Private)", "dentistry"],
      ["Solar PV", "electrical-solar"],
      ["Driveways & Paving", "driveways-paving"],
    ] as const) {
      expect(resolveFaqBank({ trade })?.id ?? null, trade).toBe(expected);
    }
  });

  it("every taxonomy trade either gets a topical bank or none at all", () => {
    // A wrong bank is worse than no bank (ADR-047). This pins the whole
    // taxonomy so a future matcher edit cannot quietly mis-assign one.
    const assigned = TRADES.map((trade) => ({
      label: trade.label,
      bank: resolveFaqBank({ trade: trade.label, tradeId: trade.id })?.id ?? null,
    }));
    const withBank = assigned.filter((row) => row.bank);
    expect(withBank.length).toBeGreaterThan(0);
    for (const row of withBank) {
      const label = row.label.toLowerCase();
      const topical =
        (row.bank === "roofing-emergency" && /\broof/.test(label)) ||
        (row.bank === "driveways-paving" && /\bdrivew|\bpaving/.test(label)) ||
        (row.bank === "dentistry" && /\bdent/.test(label)) ||
        (row.bank === "electrical-solar" && /\belectric|\bsolar|\bev charg/.test(label));
      expect(topical, `${row.label} was given the "${row.bank}" bank`).toBe(true);
    }
  });
});

describe("the SEO plan is not the service list", () => {
  it("the service anchors come from the taxonomy, or there are none", () => {
    // The structural form of the bug: `anchors = services.length >= 2 ?
    // services : seoStrategy.contentPillars`. Asserted on the anchor LIST
    // rather than on substrings, because a pillar like "alpaca grooming
    // services" also appears legitimately in the sentence around it — the
    // SOURCE was wrong, not the string.
    for (const [trade, expectAnchors] of [
      ["Driveways & Paving", true],
      ["Solar PV", true],
      ["Pest Control", false],
      ["Alpaca Grooming", false],
    ] as const) {
      const blueprint = buildWebsiteBlueprint({
        strategy: generateExperienceStrategy({
          businessName: "Probe Ltd",
          trade,
          location: "Leeds",
        }),
      });
      const tradeId = matchTradeId(trade);
      const taxonomyServices = (tradeId && getTradeDefinition(tradeId)?.services) || [];
      for (const page of blueprint.pages.pages) {
        for (const section of page.sections) {
          if (section.identifier !== "services.interactive-explorer") continue;
          const slot =
            section.contentRequirements?.find((entry) => entry.startsWith("services:")) ?? "";
          expect(slot, `${trade} lost its services slot entirely`).toBeTruthy();
          const anchors = slot.includes("customers choose:")
            ? slot.split("customers choose:")[1].split("·").map((a) => a.trim().replace(/\.$/, ""))
            : [];
          if (!expectAnchors) {
            // No taxonomy services → no anchor list at all. The explorer
            // degrades to its crafted card grid rather than printing the
            // publishing plan as the offer.
            expect(anchors, `${trade} invented anchors from somewhere`).toEqual([]);
          } else {
            expect(anchors.length, trade).toBeGreaterThan(1);
            for (const anchor of anchors) {
              expect(
                taxonomyServices,
                `${trade} anchor "${anchor}" is not a taxonomy service`,
              ).toContain(anchor);
            }
          }
        }
      }
    }
  });

  it("and the unmistakably internal ones never reach a page at all", () => {
    for (const trade of ["Driveways & Paving", "Solar PV", "Pest Control", "Alpaca Grooming"]) {
      const blueprint = buildWebsiteBlueprint({
        strategy: generateExperienceStrategy({
          businessName: "Probe Ltd",
          trade,
          location: "Leeds",
        }),
      });
      const internal = (blueprint.informationArchitecture?.pillars ?? []).filter(
        (pillar) => /area pages|case stud|galleries|inspiration|certifications|guides/i.test(pillar),
      );
      expect(internal.length, `${trade} pillars look nothing like a plan`).toBeGreaterThan(0);
      for (const page of blueprint.pages.pages) {
        const html = renderToStaticMarkup(
          renderPage(blueprint, { mode: "public", pageId: page.id }),
        );
        for (const pillar of internal) {
          expect(
            html,
            `${trade} · ${page.id} published the internal pillar "${pillar}"`,
          ).not.toContain(pillar);
        }
      }
    }
  });
});
