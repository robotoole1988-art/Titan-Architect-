/**
 * ADR-057 — the room's crafted empty states render designed, not broken
 * (renderToStaticMarkup, the repo's component-test convention).
 */

import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DecisionsRow,
  HealthChips,
  RevenueStory,
  TimelineFeed,
} from "@/features/command-centre/components/room-sections";
import { buildHealthChips } from "@/features/command-centre/model/chips";
import { makeFacts } from "./fixture";

describe("crafted absence renders designed, not broken (ADR-057)", () => {
  it("the revenue story renders the honest line while unmeasured", () => {
    const html = renderToStaticMarkup(
      <RevenueStory facts={makeFacts()} delayMs={0} />,
    );
    expect(html).toContain("Measurement begins with your first live campaign.");
    expect(html).toContain("176 page views measured to date");
    expect(html).toContain("data-empty");
  });

  it("the decisions row collapses to one quiet line when clear", () => {
    const html = renderToStaticMarkup(<DecisionsRow cards={[]} delayMs={0} />);
    expect(html).toContain("Nothing awaits your approval.");
    expect(html).toContain("data-empty");
  });

  it("the timeline renders its crafted first-day line", () => {
    const html = renderToStaticMarkup(<TimelineFeed entries={[]} delayMs={0} />);
    expect(html).toContain("The feed begins with your first live activity.");
  });

  it("chips carry their figures, click-throughs and empty flags", () => {
    const html = renderToStaticMarkup(
      <HealthChips chips={buildHealthChips(makeFacts())} delayMs={0} />,
    );
    expect(html).toContain('href="/businesses"');
    expect(html).toContain('href="/brain"');
    expect(html).toContain("of 8 in the book");
    expect(html).toContain("Measurement begins with your first live campaign.");
  });

  it("staged reveals carry server-computed delays for the choreography", () => {
    const html = renderToStaticMarkup(
      <RevenueStory facts={makeFacts()} delayMs={3200} />,
    );
    expect(html).toContain("animation-delay:3200ms");
    expect(html).toContain("cc-reveal");
  });
});
