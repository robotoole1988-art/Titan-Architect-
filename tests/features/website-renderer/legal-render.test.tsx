import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage } from "@/features/website-renderer";

/**
 * ADR-045: the legal layer as the customer sees it. The two legal pages render
 * crafted (never the placeholder), carry the "baseline, not legal advice"
 * disclaimer, and every page's footer reaches Privacy + Terms alongside the
 * honest "no tracking cookies" statement that stands in for a consent banner.
 */

const blueprint = buildWebsiteBlueprint({
  strategy: generateExperienceStrategy({
    businessName: "Summit Roofing Rescue",
    trade: "Emergency Roofing & Drainage",
    location: "Leeds",
  }),
  coverageAreas: ["Headingley", "Horsforth"],
});

const CONTACT = { phone: "0113 000 0000", email: "hello@summitroofing.co.uk" };

function renderPublic(pageId: string, contact = CONTACT): string {
  return renderToStaticMarkup(
    renderPage(blueprint, { mode: "public", pageId, contact }),
  );
}

const privacyId = "legal.privacy";
const termsId = "legal.terms";

describe("legal pages render (ADR-045)", () => {
  it("renders the privacy policy CRAFTED, with the real business copy", () => {
    const html = renderPublic(privacyId);
    expect(html).not.toContain("data-placeholder=");
    expect(html).toContain('data-primitive="legal.privacy-policy"');
    // A real H1, not a redundant eyebrow echo.
    expect(html).toContain("Privacy Policy");
    expect(html).toMatch(/name, phone number, and email/i); // what we collect
    expect(html).toMatch(/Legitimate interests/i); // lawful basis
    expect(html).toMatch(/right to:/i); // the rights enumeration
  });

  it("renders the terms notice CRAFTED, with England & Wales governing law", () => {
    const html = renderPublic(termsId);
    expect(html).not.toContain("data-placeholder=");
    expect(html).toContain('data-primitive="legal.legal-notice"');
    // renderToStaticMarkup escapes the ampersand to &amp;.
    expect(html).toMatch(/law of England &amp; Wales/i);
  });

  it("carries the 'baseline, not legal advice' disclaimer on BOTH pages", () => {
    for (const id of [privacyId, termsId]) {
      expect(renderPublic(id)).toMatch(/it is not legal advice/i);
    }
  });

  it("states 'no tracking cookies' — the honest stand-in for a consent banner", () => {
    // In the privacy body...
    expect(renderPublic(privacyId)).toMatch(/sets no tracking cookies/i);
    // ...and in the footer legal bar of every page.
    for (const id of [privacyId, termsId, "home"]) {
      expect(renderPublic(id)).toContain("No tracking cookies");
    }
  });

  it("reaches Privacy + Terms from the footer of EVERY page", () => {
    for (const page of blueprint.pages.pages) {
      const html = renderPublic(page.id);
      const footer = html.slice(html.lastIndexOf("<footer"));
      expect(footer, `${page.id} footer missing Privacy link`).toContain('href="/privacy"');
      expect(footer, `${page.id} footer missing Terms link`).toContain('href="/terms"');
      expect(footer).toContain('aria-label="Legal"');
    }
  });

  it("names the REAL controller contact when the business supplies it", () => {
    const html = renderPublic(privacyId, CONTACT);
    expect(html).toContain("hello@summitroofing.co.uk");
    expect(html).toContain("0113 000 0000");
  });

  it("falls back to an honest placeholder when contact is absent — never fabricated", () => {
    const html = renderToStaticMarkup(
      renderPage(blueprint, { mode: "public", pageId: privacyId }),
    );
    expect(html).toContain("[contact details to be confirmed]");
    expect(html).not.toContain("hello@summitroofing.co.uk");
  });

  it("respects a custom href resolver (slug serving) for the legal links", () => {
    const html = renderToStaticMarkup(
      renderPage(blueprint, {
        mode: "public",
        pageId: privacyId,
        contact: CONTACT,
        pageHref: (_pageId, url) => `/sites/summit${url === "/" ? "" : url}`,
      }),
    );
    expect(html).toContain('href="/sites/summit/privacy"');
    expect(html).toContain('href="/sites/summit/terms"');
  });
});
