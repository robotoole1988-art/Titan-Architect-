import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { TRADE_TAXONOMY } from "@/core/trade-taxonomy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage } from "@/features/website-renderer";

/**
 * TITAN NEVER PUBLISHES AN ACCREDITATION IT HAS NOT VERIFIED (ADR-059).
 *
 * `accreditationsFor()` used to guess UK accreditation bodies by keyword-
 * matching the TRADE NAME, and the renderer printed them as shield badges on
 * the live site. It never consulted the business record. Measured before the
 * fix: 35 of 35 trades published at least one unverified accreditation and 22
 * published the literal string "TrustMark". Damp proofing published roofing
 * accreditations, because the substring "roof" hides inside "p-ROOF-ing".
 *
 * DMCC Act 2024 Schedule 20 paras 3 and 4 make displaying an unauthorised
 * trust mark, or falsely claiming approval by a body, BANNED PRACTICES —
 * automatically unfair, with no need to show a consumer was misled, and a
 * criminal offence under s.237(7).
 *
 * This suite is the law. A business's accreditations may only ever come from
 * a verified field on the business record, with a registration number and the
 * customer's own sign-off. Never from its trade name.
 */

/**
 * UK schemes and marks TITAN must never assert on a business's behalf.
 *
 * This is deliberately a BLUNT string ban rather than an attempt to detect
 * assertion vs education. Naming a scheme while telling a homeowner to ask
 * for a registration number is lawful — Which? and trading standards do it
 * constantly — but "is this sentence an assertion?" is not a property a test
 * can check reliably, and this generator writes thousands of pages nobody
 * reads first. An absolute rule is worth more than an accurate one here: FAQ
 * copy can always be rewritten to tell the reader to ask which scheme their
 * tradesperson belongs to, which is just as useful and names nothing.
 */
const PROTECTED_MARKS = [
  "TrustMark",
  "Which? Trusted",
  "Gas Safe",
  "NICEIC",
  "MCS certified",
  "FENSA",
  "CERTASS",
  "NFRC",
  "CompetentRoofer",
  "FMB member",
  "GDC registered",
  "HCPC",
  "Part P",
  "F-Gas",
  "REFCOM",
  "CIPHE",
  "WaterSafe",
  "Marshalls-accredited",
  "OZEV",
  "RECC",
  "SRA",
] as const;

const TRADES = TRADE_TAXONOMY as ReadonlyArray<{ id: string; label: string }>;

describe("the accreditation law — no badge without a verified number", () => {
  it("the taxonomy is actually being exercised (the suite is not vacuous)", () => {
    expect(TRADES.length).toBeGreaterThanOrEqual(30);
  });

  it("NO trade in the taxonomy produces an accreditation from its name alone", () => {
    for (const trade of TRADES) {
      const strategy = generateExperienceStrategy({
        businessName: "Probe Ltd",
        trade: trade.label,
        location: "Leeds",
      });
      expect(
        strategy.conversionStrategy.accreditations,
        `${trade.label} invented an accreditation`,
      ).toEqual([]);
    }
  });

  it("no protected mark leaks through trust signals either", () => {
    // trustSignals used to spread `...accreditations` into itself, so the
    // badges reached the credential band by a second route.
    for (const trade of TRADES) {
      const strategy = generateExperienceStrategy({
        businessName: "Probe Ltd",
        trade: trade.label,
        location: "Leeds",
      });
      const signals = strategy.conversionStrategy.trustSignals.join(" · ");
      for (const mark of PROTECTED_MARKS) {
        expect(signals, `${trade.label} leaked "${mark}" via trustSignals`).not.toContain(mark);
      }
    }
  });

  it("free-text trades outside the taxonomy invent nothing either", () => {
    // The old fallback returned ["TrustMark", "Which? Trusted Trader"] for
    // anything unrecognised, so an off-taxonomy trade was the worst case.
    for (const trade of ["Window Cleaner", "Alpaca Grooming", "Damp Proofing", "EV Charger Installation"]) {
      const strategy = generateExperienceStrategy({
        businessName: "Probe Ltd",
        trade,
        location: "Leeds",
      });
      expect(strategy.conversionStrategy.accreditations, trade).toEqual([]);
      const signals = strategy.conversionStrategy.trustSignals.join(" · ");
      for (const mark of PROTECTED_MARKS) {
        expect(signals, `${trade} leaked "${mark}"`).not.toContain(mark);
      }
    }
  });
});

describe("the accreditation law — enforced at the page, not just the strategy", () => {
  // The strategy is upstream; what matters legally is what a customer's
  // visitor actually reads. This renders the real pipeline end to end.
  const SHAPES = [
    { name: "Roofing (project)", trade: "Roofing" },
    { name: "Emergency Plumbing", trade: "Emergency Plumbing & Heating" },
    { name: "Electrical (technical)", trade: "Electrical" },
    { name: "Dentistry (care)", trade: "Dentists (Private)" },
    { name: "Damp Proofing (the substring trap)", trade: "Damp Proofing" },
  ];

  for (const shape of SHAPES) {
    it(`${shape.name} publishes no protected mark on any page`, () => {
      const blueprint = buildWebsiteBlueprint({
        strategy: generateExperienceStrategy({
          businessName: "Probe Ltd",
          trade: shape.trade,
          location: "Leeds",
        }),
      });
      for (const page of blueprint.pages.pages) {
        const html = renderToStaticMarkup(
          renderPage(blueprint, { mode: "public", pageId: page.id }),
        );
        for (const mark of PROTECTED_MARKS) {
          expect(
            html,
            `${shape.name} · page "${page.id}" published "${mark}" without verification`,
          ).not.toContain(mark);
        }
      }
    });
  }
});
