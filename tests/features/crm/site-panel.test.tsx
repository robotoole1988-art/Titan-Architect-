import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Publication } from "@/core/business";

/**
 * The takedown control must exist wherever a publication exists — never
 * behind a CRM stage. The original bug: Unpublish lived only on the
 * Accounts page, which lists `live`/`account` businesses, so a site
 * published from a `lead` record was publicly serving with no off switch
 * anywhere in the app. The SitePanel renders from the PUBLICATION alone;
 * these tests pin that it never asks what stage the business is at.
 */

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { SitePanel } = await import("@/features/crm/components/site-panel");

const PUBLICATION: Publication = {
  id: "pub-1",
  businessId: "biz-1",
  slug: "voltway-renewables",
  version: 3,
  blueprintVersion: 7,
  status: "live",
  createdAt: "2026-07-20T10:00:00.000Z",
  statusChangedAt: "2026-07-21T09:30:00.000Z",
};

describe("SitePanel", () => {
  it("shows the live URL and the Unpublish control whenever a publication exists", () => {
    const html = renderToStaticMarkup(
      <SitePanel businessId="biz-1" publication={PUBLICATION} />,
    );
    expect(html).toContain("/sites/voltway-renewables");
    expect(html).toContain("v3");
    expect(html).toContain("Unpublish");
  });

  it("takes no stage input at all — publication state is the ONLY gate", () => {
    // The component's props are the contract: businessId + publication.
    // A stage prop reappearing here is the regression this suite exists
    // to catch, so the assertion is on the render, not the type.
    const html = renderToStaticMarkup(
      <SitePanel businessId="biz-1" publication={PUBLICATION} />,
    );
    expect(html).toContain("Unpublish");
    expect(html).not.toMatch(/stage/i);
  });

  it("renders the designed empty state when nothing is live — no dead controls", () => {
    const html = renderToStaticMarkup(
      <SitePanel businessId="biz-1" publication={null} />,
    );
    expect(html).toContain("Nothing is live");
    expect(html).not.toContain("Unpublish");
    expect(html).not.toContain("/sites/");
  });
});
