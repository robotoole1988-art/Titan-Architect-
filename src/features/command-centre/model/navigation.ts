/**
 * Command Centre — the navigation registry (ADR-057, M2 addendum).
 *
 * THE navigation guarantee: every destination reachable in one click today
 * stays reachable in at most one action from anywhere. All three new
 * surfaces — the ⌘K palette, the summonable rail, and the constellation —
 * derive from src/config/navigation.ts, the same registry the sidebar
 * renders from. One registry, one truth; the coverage test in
 * tests/features/command-centre pins the guarantee.
 */

import {
  primaryNavigation,
  secondaryNavigation,
  type NavItem,
} from "@/config/navigation";

/** Every cockpit destination, flat — sidebar order preserved. */
export function allDestinations(): NavItem[] {
  return [...primaryNavigation.flatMap((section) => section.items), ...secondaryNavigation];
}

/** The palette lists every destination (addendum §2). */
export function paletteItems(): NavItem[] {
  return allDestinations();
}

/** The rail lists every destination (addendum §3) — icons + tooltip. */
export function railItems(): NavItem[] {
  return allDestinations();
}

/** Type-ahead filter for the palette: title-first, then description. */
export function filterDestinations(query: string, items: NavItem[]): NavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const byTitle = items.filter((item) => item.title.toLowerCase().includes(q));
  const byDescription = items.filter(
    (item) => !byTitle.includes(item) && item.description.toLowerCase().includes(q),
  );
  return [...byTitle, ...byDescription];
}

/**
 * The constellation (an ENHANCEMENT, never the only route — addendum §4):
 * the operating departments arced across the room, v5 proportions. Positions
 * are fractions of the viewport. Every href here also appears in the rail
 * and palette — the coverage test enforces that superset relation.
 */
export interface ConstellationPoint {
  title: string;
  href: string;
  /** The hover preview line — the registry's real description. */
  preview: string;
  x: number;
  y: number;
  /** Health-engine department driving the glow, when one maps. */
  healthDepartment: string | null;
}

const CONSTELLATION_LAYOUT: ReadonlyArray<{
  title: string;
  x: number;
  y: number;
  healthDepartment: string | null;
}> = [
  { title: "Mission Control", x: 0.5, y: 0.9, healthDepartment: null },
  { title: "TITAN Brain", x: 0.34, y: 0.86, healthDepartment: null },
  { title: "CRM", x: 0.66, y: 0.86, healthDepartment: "pipeline" },
  { title: "Businesses", x: 0.2, y: 0.8, healthDepartment: "enquiries" },
  { title: "Experience Studio", x: 0.8, y: 0.8, healthDepartment: "experience" },
  { title: "Business Intake", x: 0.09, y: 0.72, healthDepartment: "delivery" },
  { title: "Market", x: 0.91, y: 0.72, healthDepartment: "measurement" },
];

export function constellationPoints(): ConstellationPoint[] {
  const destinations = allDestinations();
  return CONSTELLATION_LAYOUT.flatMap((slot) => {
    const item = destinations.find((entry) => entry.title === slot.title);
    if (!item) return [];
    return [
      {
        title: item.title,
        href: item.href,
        preview: item.description,
        x: slot.x,
        y: slot.y,
        healthDepartment: slot.healthDepartment,
      },
    ];
  });
}

/**
 * Additive number-key shortcuts (addendum §5): 1–7 jump to the
 * constellation departments, in layout order. Never load-bearing.
 */
export function numberShortcuts(): ReadonlyArray<{ key: string; href: string; title: string }> {
  return constellationPoints().map((point, index) => ({
    key: String(index + 1),
    href: point.href,
    title: point.title,
  }));
}

/**
 * The written click-count comparison the DoD demands (addendum §6),
 * derived from the registry so the report can never drift from the code.
 * Old model: every destination was one sidebar click from any (app) page.
 * New model: Operations pages keep the sidebar (unchanged — 1 click); the
 * Command Centre reaches everything via the rail (edge hover/summon, then
 * 1 click) and the constellation adds a second one-click route for the
 * seven operating departments.
 */
export interface ClickCountRow {
  destination: string;
  href: string;
  oldClicksFromOperations: number;
  newClicksFromOperations: number;
  newClicksFromCommandCentre: number;
  constellationAlsoCovers: boolean;
}

export function clickCountTable(): ClickCountRow[] {
  const constellation = new Set(constellationPoints().map((point) => point.href));
  return allDestinations().map((item) => ({
    destination: item.title,
    href: item.href,
    oldClicksFromOperations: 1,
    newClicksFromOperations: 1,
    newClicksFromCommandCentre: 1,
    constellationAlsoCovers: constellation.has(item.href),
  }));
}
