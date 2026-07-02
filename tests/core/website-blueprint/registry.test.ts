import { describe, expect, it } from "vitest";
import {
  SECTION_PRIMITIVE_REGISTRY,
  getSectionPrimitive,
} from "@/core/website-blueprint";

const primitives = Object.values(SECTION_PRIMITIVE_REGISTRY);

describe("section primitive registry", () => {
  it("contains between 10 and 15 primitives", () => {
    expect(primitives.length).toBeGreaterThanOrEqual(10);
    expect(primitives.length).toBeLessThanOrEqual(15);
  });

  it("keys every primitive by its own id", () => {
    for (const [key, primitive] of Object.entries(SECTION_PRIMITIVE_REGISTRY)) {
      expect(primitive.id).toBe(key);
    }
  });

  it("uses namespaced dot ids (family.name)", () => {
    for (const primitive of primitives) {
      expect(primitive.id).toMatch(/^[a-z]+\.[a-z][a-z-]*$/);
    }
  });

  it("declares at least one variant per primitive, with no duplicates", () => {
    for (const primitive of primitives) {
      expect(primitive.variants.length).toBeGreaterThanOrEqual(1);
      expect(new Set(primitive.variants).size).toBe(primitive.variants.length);
    }
  });

  it("declares at least one archetype affinity per primitive", () => {
    for (const primitive of primitives) {
      expect(primitive.archetypeAffinities.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("declares at least one required content slot per primitive", () => {
    for (const primitive of primitives) {
      expect(primitive.contentSlots.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("declares supported aspects for every primitive", () => {
    for (const primitive of primitives) {
      expect(typeof primitive.aspects.animation).toBe("boolean");
      expect(typeof primitive.aspects.interaction).toBe("boolean");
      expect(typeof primitive.aspects.media).toBe("boolean");
    }
  });

  it("covers the core primitive families", () => {
    const ids = primitives.map((primitive) => primitive.id);
    for (const expected of [
      "hero.cinematic-reveal",
      "hero.rapid-response",
      "story.transformation-arc",
      "proof.credential-band",
      "services.interactive-explorer",
      "conversion.emergency-cta",
      "trust.review-wall",
      "location.service-area",
    ]) {
      expect(ids).toContain(expected);
    }
  });

  it("looks a primitive up by id, and returns undefined for unknown ids", () => {
    const hero = getSectionPrimitive(
      SECTION_PRIMITIVE_REGISTRY,
      "hero.cinematic-reveal",
    );
    expect(hero?.id).toBe("hero.cinematic-reveal");
    expect(
      getSectionPrimitive(SECTION_PRIMITIVE_REGISTRY, "hero.nonexistent"),
    ).toBeUndefined();
  });
});
