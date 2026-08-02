import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage } from "@/features/website-renderer";
import { primaryCtaHref, telHref } from "@/features/website-renderer/model/cta";

/**
 * "CALL NOW" DIALS (ADR-062).
 *
 * The emergency archetype's primary CTA reads "Call now", renders with a
 * phone icon, and pointed at `#callback` — the on-page form. Someone standing
 * under a leak tapped it and got scrolled to a contact form. The only working
 * `tel:` link on the whole site was in the header.
 *
 * The decision is DECLARED (`primaryCtaAction` on the trade profile), never
 * inferred from the label. The deleted `ctaIntent()` did infer it —
 * `label.toLowerCase().includes("call")` — and nothing consumed the result,
 * which is how the bug hid. Inferring behaviour from a string is the same
 * shape of defect as ADR-059's accreditations and ADR-061's roofing FAQ on a
 * damp-proofing site.
 */

const PHONE = "0113 496 0000";
const CALL_TRADES = ["Emergency Roofing & Drainage", "Plumbing & Heating (emergency)"];
const FORM_TRADES = ["Driveways & Paving", "Solar PV", "Dentists (Private)"];

function blueprintFor(trade: string) {
  return buildWebsiteBlueprint({
    strategy: generateExperienceStrategy({
      businessName: "Probe Ltd",
      trade,
      location: "Leeds",
    }),
  });
}

function render(trade: string, contact?: { phone?: string }) {
  return renderToStaticMarkup(
    renderPage(blueprintFor(trade), {
      mode: "public",
      ...(contact ? { contact } : {}),
    }),
  );
}

function callbackCount(html: string): number {
  return (html.match(/href="#callback"/g) ?? []).length;
}

describe("the primary CTA does what its label promises", () => {
  it("an urgent trade DIALS when the business has a phone number", () => {
    for (const trade of CALL_TRADES) {
      const html = render(trade, { phone: PHONE });
      expect(html, trade).toContain(`href="tel:01134960000"`);
      // And the label really is the one that was broken.
      expect(html, trade).toContain("Call now");
    }
  });

  it("…and every call CTA switched, not just one of them", () => {
    // The sticky bar, the hero, the header and the inline emergency CTA all
    // said "Call now". Fixing one and leaving three is the likely regression.
    for (const trade of CALL_TRADES) {
      const withPhone = callbackCount(render(trade, { phone: PHONE }));
      const without = callbackCount(render(trade));
      expect(
        without - withPhone,
        `${trade}: only ${without - withPhone} CTA(s) started dialling`,
      ).toBeGreaterThanOrEqual(4);
    }
  });

  it("a non-urgent trade still routes to the form, phone or no phone", () => {
    for (const trade of FORM_TRADES) {
      const withPhone = render(trade, { phone: PHONE });
      const without = render(trade);
      expect(callbackCount(withPhone), trade).toBe(callbackCount(without));
      expect(callbackCount(withPhone), trade).toBeGreaterThan(0);
      // "Get a free quote" belongs on a form — dialling it would be worse.
      expect(withPhone, trade).not.toContain("Call now");
    }
  });

  it("falls back to the form when no phone number has been supplied yet", () => {
    // TITAN publishes plenty of sites before the founder has finished
    // collecting details. A button that dials nothing is worse than one that
    // scrolls.
    for (const trade of CALL_TRADES) {
      const html = render(trade);
      expect(html, trade).not.toContain("tel:");
      expect(callbackCount(html), trade).toBeGreaterThan(0);
    }
  });
});

describe("the decision is declared, not sniffed", () => {
  it("the blueprint carries the intent the trade profile declared", () => {
    for (const trade of CALL_TRADES) {
      expect(blueprintFor(trade).conversion?.ctas?.[0]?.intent, trade).toBe("call");
    }
    for (const trade of FORM_TRADES) {
      expect(blueprintFor(trade).conversion?.ctas?.[0]?.intent, trade).toBe("form");
    }
  });

  it("a call intent with a label that never mentions calling still dials", () => {
    // The point of declaring it. A label-sniffer would fail this.
    const blueprint = blueprintFor(CALL_TRADES[0]);
    const relabelled = {
      ...blueprint,
      conversion: {
        ...blueprint.conversion!,
        ctas: [{ ...blueprint.conversion!.ctas![0], label: "Get help now" }],
      },
    };
    expect(primaryCtaHref(relabelled, { phone: PHONE })).toBe("tel:01134960000");
  });

  it("a form intent labelled 'Call us' does NOT dial", () => {
    // The mirror image, and the reason sniffing is unsafe in both directions.
    const blueprint = blueprintFor(FORM_TRADES[0]);
    const relabelled = {
      ...blueprint,
      conversion: {
        ...blueprint.conversion!,
        ctas: [{ ...blueprint.conversion!.ctas![0], label: "Call us today" }],
      },
    };
    expect(primaryCtaHref(relabelled, { phone: PHONE })).toBe("#callback");
  });
});

describe("the tel: href is actually dialable", () => {
  it("strips everything a handset cannot dial, keeping a leading +", () => {
    expect(telHref("0113 496 0000")).toBe("tel:01134960000");
    expect(telHref("(0113) 496-0000")).toBe("tel:01134960000");
    expect(telHref("+44 113 496 0000")).toBe("tel:+441134960000");
    // A stray + mid-number is not a dialable character.
    expect(telHref("0113+496")).toBe("tel:0113496");
  });
});
