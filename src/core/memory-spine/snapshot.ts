/**
 * loadMemorySnapshot (ADR-046): read the EXISTING sources — the Business
 * Spine repositories (and optionally a market-data provider) — into the plain
 * snapshot the graph builder derives from. This is the only async half of the
 * spine; everything after it is pure.
 *
 * Repositories arrive as a PARAMETER (memory in tests, Supabase in the app),
 * so the module carries no environment coupling of its own.
 */

import type {
  ArtifactRecord,
  BusinessSpineRepositories,
} from "@/core/business";
import {
  resolveCplEstimate,
  type MarketDataProvider,
} from "@/core/market-intelligence";
import type { MarketContext, MemorySnapshot } from "./model";

export interface LoadSnapshotOptions {
  /**
   * Include internal/test businesses (ADR-049). Default FALSE: Brain
   * surfaces (Mission Control, Ask the Brain) never see them; the CRM,
   * which reads repositories directly, keeps them findable and recoverable.
   */
  includeInternal?: boolean;
  /**
   * When supplied, businesses with a canonical tradeId gain market context
   * (business —in_market→ market), attributed to the provider by name.
   * Absent → no market nodes. Never fabricated for unclassified trades.
   */
  market?: MarketDataProvider;
}

export async function loadMemorySnapshot(
  repos: BusinessSpineRepositories,
  options: LoadSnapshotOptions = {},
): Promise<MemorySnapshot> {
  const all = await repos.businesses.list();
  const businesses = options.includeInternal
    ? all
    : all.filter((business) => !business.internal);

  const perBusiness = await Promise.all(
    businesses.map(async (business) => {
      const [enquiries, metrics, build, publications, deal, campaign, media, activity] =
        await Promise.all([
          repos.enquiries.listForBusiness(business.id),
          repos.metrics.listForBusiness(business.id),
          repos.builds.getForBusiness(business.id),
          repos.publications.history(business.id),
          repos.artifacts.latest(business.id, "deal"),
          repos.artifacts.latest(business.id, "campaign_plan"),
          repos.media.listForBusiness(business.id),
          repos.activity.list(business.id),
        ]);

      let market: MarketContext | null = null;
      if (options.market && business.tradeId) {
        try {
          const estimate = await resolveCplEstimate(
            options.market,
            business.tradeId,
            business.location,
          );
          market = {
            businessId: business.id,
            trade: business.tradeId,
            location: business.location,
            estimate,
            providerName: options.market.name,
          };
        } catch {
          // No benchmark for this trade/location → no market node. Honest
          // absence, never a made-up estimate.
          market = null;
        }
      }

      return { enquiries, metrics, build, publications, deal, campaign, media, activity, market };
    }),
  );

  return {
    businesses,
    enquiries: perBusiness.flatMap((detail) => detail.enquiries),
    deals: perBusiness
      .map((detail) => detail.deal)
      .filter((deal): deal is ArtifactRecord => deal !== null),
    campaigns: perBusiness
      .map((detail) => detail.campaign)
      .filter((campaign): campaign is ArtifactRecord => campaign !== null),
    builds: perBusiness
      .map((detail) => detail.build)
      .filter((build): build is NonNullable<typeof build> => build !== null),
    publications: perBusiness.flatMap((detail) => detail.publications),
    metrics: perBusiness.flatMap((detail) => detail.metrics),
    media: perBusiness.flatMap((detail) => detail.media),
    activity: perBusiness.flatMap((detail) => detail.activity),
    markets: perBusiness
      .map((detail) => detail.market)
      .filter((market): market is MarketContext => market !== null),
  };
}
