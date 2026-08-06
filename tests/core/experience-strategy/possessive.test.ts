import { describe, expect, it } from "vitest";
import { generateExperienceStrategy } from "@/core/experience-strategy";
import { possessive } from "@/core/experience-strategy/trade-intelligence";

/**
 * "LEEDS'S FINEST ROOFING" NEVER SHIPS AGAIN.
 *
 * The first archetype sweep of the generator (the night the demo route was
 * built) put "Leeds's finest roofing, done properly" on a generated H1 —
 * grammatically defensible, typographically clumsy, and headed for every
 * customer site in every s-ending town in Britain. Headline copy now takes
 * the s-apostrophe form via one helper, and this file pins it at both
 * levels: the helper's rule, and the generated headline a visitor reads.
 */

describe("possessive", () => {
  it("s-ending nouns take the bare apostrophe", () => {
    expect(possessive("Leeds")).toBe("Leeds'");
    expect(possessive("St Albans")).toBe("St Albans'");
    expect(possessive("Roofing Solutions")).toBe("Roofing Solutions'");
  });

  it("everything else keeps 's", () => {
    expect(possessive("York")).toBe("York's");
    expect(possessive("Manchester")).toBe("Manchester's");
    expect(possessive("Example Roofing")).toBe("Example Roofing's");
  });
});

describe("the generated headline honours it", () => {
  it("an s-ending town reads cleanly in the project-archetype H1", () => {
    const strategy = generateExperienceStrategy({
      businessName: "Example Roofing",
      trade: "roofing",
      location: "Leeds",
    });
    expect(strategy.heroConcept.headline).toContain("Leeds'");
    expect(strategy.heroConcept.headline).not.toContain("Leeds's");
  });

  it("a non-s town is untouched", () => {
    const strategy = generateExperienceStrategy({
      businessName: "Example Plumbing",
      trade: "emergency plumbing",
      location: "York",
    });
    expect(strategy.heroConcept.headline).toContain("York's");
  });
});
