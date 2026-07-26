/**
 * M2 addendum — THE navigation guarantee, tested not asserted:
 * every destination reachable in one click today stays reachable in at most
 * one action from anywhere, and the constellation is never the only route.
 */

import { describe, expect, it } from "vitest";
import {
  commandCentreHome,
  primaryNavigation,
  secondaryNavigation,
} from "@/config/navigation";
import {
  allDestinations,
  clickCountTable,
  constellationPoints,
  filterDestinations,
  numberShortcuts,
  paletteItems,
  railItems,
} from "@/features/command-centre/model/navigation";

const EXPECTED_SECTIONS = [
  "Mission Control",
  "TITAN Brain",
  "Business Intake",
  "Businesses",
  "CRM",
  "Market",
  "Experience Studio",
  "Codex",
  "PRDs",
  "Directives",
  "AI Employees",
  "Roadmap",
  "Architecture",
  "Settings",
];

describe("the navigation guarantee (M2 addendum)", () => {
  it("the registry still contains all 14 sections the addendum names", () => {
    const titles = allDestinations().map((item) => item.title);
    for (const section of EXPECTED_SECTIONS) {
      expect(titles).toContain(section);
    }
    expect(titles).toHaveLength(EXPECTED_SECTIONS.length);
  });

  it("the ⌘K palette lists EVERY destination", () => {
    const palette = paletteItems().map((item) => item.href);
    for (const item of allDestinations()) {
      expect(palette).toContain(item.href);
    }
  });

  it("the summonable rail lists EVERY destination", () => {
    const rail = railItems().map((item) => item.href);
    for (const item of allDestinations()) {
      expect(rail).toContain(item.href);
    }
  });

  it("the constellation is a strict subset — an enhancement, never the only route", () => {
    const registry = new Set(allDestinations().map((item) => item.href));
    const rail = new Set(railItems().map((item) => item.href));
    for (const point of constellationPoints()) {
      expect(registry.has(point.href)).toBe(true);
      expect(rail.has(point.href)).toBe(true);
    }
  });

  it("no destination regresses: new click counts never exceed the old sidebar's", () => {
    const table = clickCountTable();
    expect(table).toHaveLength(EXPECTED_SECTIONS.length);
    for (const row of table) {
      expect(row.newClicksFromOperations).toBeLessThanOrEqual(row.oldClicksFromOperations);
      expect(row.newClicksFromCommandCentre).toBeLessThanOrEqual(1);
    }
  });

  it("number shortcuts are additive aliases of constellation departments", () => {
    const constellation = new Set(constellationPoints().map((point) => point.href));
    for (const shortcut of numberShortcuts()) {
      expect(constellation.has(shortcut.href)).toBe(true);
    }
  });

  it("type-ahead matches by title first, then description", () => {
    const items = allDestinations();
    expect(filterDestinations("crm", items)[0].title).toBe("CRM");
    expect(filterDestinations("briefing", items).map((item) => item.title)).toContain(
      "Mission Control",
    );
    expect(filterDestinations("zzz-nothing", items)).toHaveLength(0);
  });

  it("the sidebar registry drives everything — one truth, no drift", () => {
    const sidebar = [
      ...primaryNavigation.flatMap((section) => section.items),
      ...secondaryNavigation,
    ].map((item) => item.href);
    expect(allDestinations().map((item) => item.href)).toEqual(sidebar);
  });
});

describe("the way home (ADR-057 §7)", () => {
  it("the home entry points at the room and stays out of the Layer 2 registry", () => {
    expect(commandCentreHome.href).toBe("/");
    expect(allDestinations().map((item) => item.href)).not.toContain("/");
  });

  it("the palette finds home by name and by 'home'", () => {
    const items = [commandCentreHome, ...allDestinations()];
    expect(filterDestinations("command", items)[0].href).toBe("/");
    expect(filterDestinations("home", items)[0].href).toBe("/");
  });
});
