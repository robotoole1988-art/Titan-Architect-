import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { buildWebsiteBlueprint } from "@/core/website-blueprint";
import { renderPage } from "@/features/website-renderer";

// "Drainage" keeps this in the emergency archetype (ADR-020 keywords).
const strategy = generateExperienceStrategy({
  businessName: "Summit Roofing Rescue",
  trade: "Emergency Roofing & Drainage",
  location: "Leeds",
});
const blueprint = buildWebsiteBlueprint({ strategy });

function markup(): string {
  return renderToStaticMarkup(renderPage(blueprint));
}

/**
 * A blueprint whose hero identifier is OUTSIDE the registry — registry
 * primitives always resolve (crafted or placeholder), so only a non-registry
 * identifier exercises the throw/skip behaviour.
 */
function withUnknownHero(): typeof blueprint {
  const doctored = structuredClone(blueprint);
  doctored.pages.pages[0].sections[0].identifier = "hero.not-in-registry";
  return doctored;
}

/** React escapes text nodes; assertions must compare escaped copy. */
function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

describe("renderPage", () => {
  it("is deterministic: the same blueprint renders the same markup", () => {
    expect(markup()).toBe(markup());
  });

  it("composes semantic landmarks: header, main, footer", () => {
    const html = markup();
    expect(html).toContain("<header");
    expect(html).toContain("<main");
    expect(html).toContain("<footer");
  });

  it("renders exactly one h1 (the hero headline)", () => {
    const html = markup();
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(escapeHtml(strategy.heroConcept.headline));
  });

  it("renders every blueprint section, in order, tagged with its primitive", () => {
    const html = markup();
    const positions = blueprint.pages.pages[0].sections.map((section) => {
      const index = html.indexOf(`data-primitive="${section.identifier}"`);
      expect(index, `section "${section.identifier}" not rendered`).toBeGreaterThan(-1);
      return index;
    });
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it("draws business copy from content slots, never hardcoded", () => {
    const html = markup();
    // Slot-fed copy present:
    expect(html).toContain(escapeHtml(strategy.heroConcept.headline));
    expect(html).toContain(escapeHtml(strategy.conversionStrategy.primaryCta));
    // A different business produces different copy (nothing baked in):
    const other = buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({
        businessName: "Aqua Drains",
        trade: "Emergency Plumber",
        location: "Hull",
      }),
    });
    const otherHtml = renderToStaticMarkup(renderPage(other));
    expect(otherHtml).not.toContain("Summit Roofing Rescue");
    expect(otherHtml).toContain("Aqua Drains");
  });

  it("surfaces every key message in the review wall (em-dash-safe parsing)", () => {
    const html = markup();
    for (const message of strategy.storytelling.keyMessages) {
      expect(html).toContain(escapeHtml(message));
    }
  });

  it("gives every section an accessible name", () => {
    const html = markup();
    const sections = html.match(/<section[^>]*>/g) ?? [];
    expect(sections.length).toBeGreaterThan(0);
    for (const tag of sections) {
      expect(tag, `section lacks accessible name: ${tag}`).toMatch(
        /aria-(labelledby|label)=/,
      );
    }
  });

  it("passes basic a11y smoke checks: img alt text and named buttons", () => {
    const html = markup();
    for (const img of html.match(/<img[^>]*>/g) ?? []) {
      expect(img, `img missing alt: ${img}`).toContain("alt=");
    }
    for (const button of html.match(/<button[^>]*>[\s\S]*?<\/button>/g) ?? []) {
      const named =
        /aria-label=/.test(button) || />[^<>]*[a-zA-Z][^<>]*</.test(button);
      expect(named, `button has no accessible name: ${button}`).toBe(true);
    }
  });

  it("fails loudly on a non-registry identifier when asked to throw", () => {
    expect(() =>
      renderToStaticMarkup(
        renderPage(withUnknownHero(), { onUnmapped: "throw" }),
      ),
    ).toThrowError(/hero\.not-in-registry/);
  });

  it("degrades gracefully on a non-registry identifier when asked to skip", () => {
    const html = renderToStaticMarkup(
      renderPage(withUnknownHero(), { onUnmapped: "skip" }),
    );
    expect(html).not.toContain('data-primitive="hero.not-in-registry"');
    expect(html).toContain('data-primitive="conversion.emergency-cta"');
    expect(html).toContain("<footer");
  });
});
