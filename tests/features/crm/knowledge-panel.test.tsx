import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { KnowledgePanel } from "@/features/crm/components/knowledge-panel";

/**
 * The knowledge panel is the founder-facing face of the knowledge base:
 * legal MUSTs as selling ammunition, coverage stated honestly, sources on
 * the surface. The unmatched case matters most — a trade with no record
 * must say so, never borrow a neighbour's facts (the ADR-066 lesson,
 * one level up).
 */

describe("KnowledgePanel", () => {
  it("puts the legal MUSTs in front of the founder for a covered trade", () => {
    const html = renderToStaticMarkup(
      <KnowledgePanel trade="Electricians" tradeId="electricians" />,
    );
    expect(html).toContain("Part P");
    expect(html).toContain("Legal MUSTs");
    expect(html).toContain("researched for this trade");
  });

  it("states coverage honestly — N of 12 sections, named", () => {
    const html = renderToStaticMarkup(
      <KnowledgePanel trade="Damp Proofing" tradeId="damp-proofing" />,
    );
    expect(html).toMatch(/\d+ of 12 sections researched/);
    expect(html).toContain("Trade-specific sections:");
  });

  it("an unmatched trade says so — no borrowed facts", () => {
    const html = renderToStaticMarkup(
      <KnowledgePanel trade="Underwater Basket Weaving" />,
    );
    expect(html).toContain("No trade-specific record matched");
    expect(html).toContain("no borrowed facts");
    // Platform knowledge may render; trade-specific MUSTs must not.
    expect(html).not.toContain("Gas Safe");
    expect(html).not.toContain("Part P");
  });

  it("shows its sources — every fact traces to a dossier", () => {
    const html = renderToStaticMarkup(
      <KnowledgePanel trade="Roofing" tradeId="roofing" />,
    );
    expect(html).toContain("Sources (");
    expect(html).toContain("docs/research/");
  });

  it("the damp-proofing panel never carries roofing facts — the four-times bug stays dead at the surface", () => {
    const html = renderToStaticMarkup(
      <KnowledgePanel trade="Damp Proofing" tradeId="damp-proofing" />,
    );
    expect(html).toContain("PCA");
    expect(html).not.toContain("NFRC");
    expect(html).not.toContain("re-roof");
  });
});
