import { gzipSync } from "node:zlib";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TRADE_CARDS } from "@/features/company-site/components/home";
import { TradeArt } from "@/features/company-site/components/trade-art";
import {
  buildTradeArt,
  TRADE_ART_KINDS,
  type TradeArtKind,
} from "@/features/company-site/model/trade-art";

/**
 * The trade-card artwork obeys the site's laws (ADR-064).
 *
 * The founder asked for imagery (2026-08-07). The site bans image FILES —
 * so the imagery is geometry, like the sphere: deterministic, budgeted,
 * and unmistakably drawn light rather than a photograph of anyone's work
 * (ADR-059 / DMCC: decoration may never impersonate evidence).
 */

const KINDS = TRADE_ART_KINDS;

describe("trade-art model", () => {
  it("is deterministic — same drawing, byte for byte, every build", () => {
    for (const kind of KINDS) {
      expect(buildTradeArt(kind)).toEqual(buildTradeArt(kind));
    }
  });

  it("every founder card names an artwork that exists; the sixth door gets the network", () => {
    for (const card of TRADE_CARDS) {
      expect(KINDS).toContain(card.art);
    }
    expect(KINDS).toContain("network");
    // five named trades draw five different pictures
    expect(new Set(TRADE_CARDS.map((c) => c.art)).size).toBe(TRADE_CARDS.length);
  });

  it("stays inside the markup budget — decoration never buys a render loop", () => {
    for (const kind of KINDS) {
      const s = buildTradeArt(kind);
      // element count is the SVG node count: strokes + points
      expect(
        s.strokes.length + s.points.length,
        `${kind} node count`,
      ).toBeLessThanOrEqual(80);
    }
  });
});

describe("trade-art rendered", () => {
  const markupFor = (kind: TradeArtKind): string =>
    renderToStaticMarkup(createElement(TradeArt, { kind, tint: "#8fb2ff" }));

  it("is inline SVG only — no image element, no external reference", () => {
    for (const kind of KINDS) {
      const m = markupFor(kind);
      expect(/<img\b/i.test(m), `${kind} draws an <img>`).toBe(false);
      expect(/<image\b/i.test(m), `${kind} draws an <image>`).toBe(false);
      expect(/url\(http/i.test(m), `${kind} reaches off-site`).toBe(false);
      expect(m.startsWith("<svg"), `${kind} is not an <svg>`).toBe(true);
      expect(m).toContain('aria-hidden="true"');
    }
  });

  it("all six artworks together cost less than 6KB gzipped", () => {
    const all = KINDS.map(markupFor).join("");
    expect(gzipSync(all).byteLength).toBeLessThan(6 * 1024);
  });

  it("the bright strokes carry the card's own tint", () => {
    const m = renderToStaticMarkup(
      createElement(TradeArt, { kind: "roofing", tint: "#abcdef" }),
    );
    expect(m).toContain("#abcdef");
  });
});
