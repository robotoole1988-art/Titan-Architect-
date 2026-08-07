import { describe, expect, it } from "vitest";
import { buildSphereScene } from "@/features/company-site/model/sphere";
import { TRADE_TAXONOMY } from "@/core/trade-taxonomy";
import { TRADE_CARDS } from "@/features/company-site/components/home";

/**
 * The OS sphere obeys the site's physics (ADR-064).
 *
 * The hero is server-computed geometry, so its guarantees are testable in a
 * way a canvas never was: the same sphere every build (a marketing page
 * must not be a lottery), and a hard node budget (the honesty-law suite
 * bans client JS and images from this site — the SVG must not become the
 * new page-weight leak wearing an honest disguise).
 */

describe("the OS sphere", () => {
  it("is deterministic — the same sphere, every build", () => {
    const first = buildSphereScene();
    const second = buildSphereScene();
    expect(second).toEqual(first);
  });

  it("stays inside its node budget", () => {
    const scene = buildSphereScene();
    const points = scene.back.length + scene.front.length;
    expect(points).toBeGreaterThan(400); // still reads as a mass, not a sketch
    expect(points).toBeLessThan(700); // and never becomes a megabyte of markup
    const strokes =
      (scene.linksA.match(/M/g) ?? []).length +
      (scene.linksB.match(/M/g) ?? []).length +
      (scene.chords.match(/M/g) ?? []).length;
    expect(strokes).toBeGreaterThan(150);
    expect(strokes).toBeLessThan(600);
  });

  it("keeps every coordinate inside the viewBox", () => {
    const scene = buildSphereScene();
    for (const p of [...scene.back, ...scene.front]) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(scene.w);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(scene.h);
    }
  });
});

describe("every trade card opens a real door", () => {
  it("names only trades the taxonomy actually holds", () => {
    // "See it built" must land on the live generator demo for a real trade
    // id — a renamed trade breaks this test, not the visitor (ADR-066:
    // declared, never inferred; no fake doors).
    const ids = new Set(TRADE_TAXONOMY.map((trade) => trade.id));
    for (const card of TRADE_CARDS) {
      expect(ids.has(card.tradeId), `${card.name} → ${card.tradeId}`).toBe(true);
      expect(card.town).toMatch(/^[a-z][a-z-]{1,39}$/);
    }
  });
});
