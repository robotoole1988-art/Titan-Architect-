import "server-only";

/**
 * The demo route's data seam (ADR-055). READ-ONLY: variants are built
 * in-memory from the deterministic generators — rendering the demo writes
 * NOTHING. Saving a direction is a separate, explicit founder action.
 */

import {
  resolveBusinessSpine,
  type Business,
  type MediaRecord,
} from "@/core/business";
import {
  ARCHETYPE_ALTERNATES,
  classifyArchetype,
  generateExperienceStrategy,
  type TradeArchetype,
} from "@/core/experience-strategy";
import {
  buildWebsiteBlueprint,
  type WebsiteBlueprint,
} from "@/core/website-blueprint";
import { resolveLearningFeed } from "@/core/memory-spine";
import type {
  ResolvedMediaAsset,
  ResolvedReview,
} from "@/features/website-renderer";
import { DEMO_CAPTURE_KIND } from "./prepare";

export interface BeforeCapture {
  presence: "website" | "website-unreachable" | "none";
  url?: string;
  title?: string;
  description?: string;
  /** Resolved image of their current site, when captured. */
  image?: ResolvedMediaAsset;
  capturedAt?: string;
}

export interface DemoData {
  business: Business;
  /** Latest capture state; null → prep has never run (honest-empty). */
  before: BeforeCapture | null;
  /** The strategy's own archetype. */
  primaryArchetype: TradeArchetype;
  /** Curated alternates for the flip (ADR-055). */
  alternates: ReadonlyArray<TradeArchetype>;
  /** The archetype being shown right now. */
  activeArchetype: TradeArchetype;
  /** True when showing the stored primary blueprint. */
  showingPrimary: boolean;
  /** Stored primary blueprint version, when one exists. */
  primaryVersion: number | null;
  /** What the stage renders; null → no blueprint yet (honest-empty). */
  blueprint: WebsiteBlueprint | null;
  /** Approved media, primary render only (variants show honest frames). */
  media: Readonly<Record<string, ResolvedMediaAsset>>;
  /** VERIFIED reviews (ADR-053) — real on every variant; never staged. */
  reviews: ReadonlyArray<ResolvedReview>;
}

function toAsset(record: MediaRecord): ResolvedMediaAsset {
  return {
    url: record.url,
    modality: record.modality,
    ...(record.width !== undefined ? { width: record.width } : {}),
    ...(record.height !== undefined ? { height: record.height } : {}),
    ...(record.lqip !== undefined ? { lqip: record.lqip } : {}),
  };
}

export async function loadDemoData(
  businessId: string,
  variantParam: string | undefined,
): Promise<DemoData | null> {
  const [spine, feed] = await Promise.all([
    resolveBusinessSpine(),
    resolveLearningFeed(),
  ]);
  const business = await spine.businesses.get(businessId);
  if (!business) return null;

  const [blueprintArtifact, approved, captures, verifiedReviews] = await Promise.all([
    spine.artifacts.latest<WebsiteBlueprint>(businessId, "blueprint"),
    spine.media.listApprovedForBusiness(businessId),
    feed.list({ businessId, kind: DEMO_CAPTURE_KIND, limit: 1 }),
    spine.reviews.listVerifiedForBusiness(businessId),
  ]);
  const reviews: ResolvedReview[] = verifiedReviews.map((review) => ({
    customerName: review.customerName,
    rating: review.rating,
    text: review.text,
    reviewedAt: review.reviewedAt,
    source: review.source,
  }));

  // The Before, exactly as prepared — the pitch never fetches live.
  let before: BeforeCapture | null = null;
  const capture = captures[0];
  if (capture) {
    const payload = capture.payload as {
      presence?: BeforeCapture["presence"];
      url?: string;
      title?: string;
      description?: string;
      mediaId?: string;
      capturedAt?: string;
    };
    const mediaRecord = payload.mediaId
      ? approved.find((record) => record.id === payload.mediaId) ??
        (await spine.media.get(payload.mediaId))
      : null;
    before = {
      presence: payload.presence ?? "none",
      ...(payload.url ? { url: payload.url } : {}),
      ...(payload.title ? { title: payload.title } : {}),
      ...(payload.description ? { description: payload.description } : {}),
      ...(mediaRecord ? { image: toAsset(mediaRecord) } : {}),
      ...(payload.capturedAt ? { capturedAt: payload.capturedAt } : {}),
    };
  }

  const primaryArchetype = classifyArchetype(business.trade.toLowerCase());
  const alternates = ARCHETYPE_ALTERNATES[primaryArchetype];
  const activeArchetype =
    variantParam && (alternates as readonly string[]).includes(variantParam)
      ? (variantParam as TradeArchetype)
      : primaryArchetype;
  const showingPrimary = activeArchetype === primaryArchetype;

  let blueprint: WebsiteBlueprint | null = null;
  const media: Record<string, ResolvedMediaAsset> = {};
  if (showingPrimary && blueprintArtifact) {
    // The real artifact — exactly what they'd get — dressed with approved
    // media (the before-capture asset never dresses the After).
    blueprint = blueprintArtifact.payload;
    for (const record of approved) {
      if (record.slotRef === "demo.before") continue;
      media[record.slotRef] = toAsset(record);
    }
  } else if (!showingPrimary) {
    // A VARIANT: built in-memory under the override — nothing persisted
    // (ADR-055: no intake edits, no duplicated business, no artifacts).
    blueprint = buildWebsiteBlueprint({
      strategy: generateExperienceStrategy({
        businessName: business.name,
        trade: business.trade,
        location: business.location,
        archetypeOverride: activeArchetype,
      }),
      coverageAreas: business.coverageAreas,
      archetypeOverride: activeArchetype,
    });
  }

  return {
    business,
    before,
    primaryArchetype,
    alternates,
    activeArchetype,
    showingPrimary,
    primaryVersion: blueprintArtifact?.version ?? null,
    blueprint,
    media,
    reviews,
  };
}
