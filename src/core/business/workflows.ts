/**
 * Spine workflows (ADR-024): the business rules that span repositories,
 * framework-free so they are unit-testable and adapter-agnostic. Server
 * actions call these; they never contain Next.js concerns themselves.
 */

import { isLostStage, stageLabel, type Business, type LifecycleStage } from "./model";
import type { ArtifactKind } from "./repository";
import type { BusinessSpineRepositories } from "./repository";

/**
 * Move a business through its lifecycle:
 * - the transition (with optional reason) lands in stage history,
 * - the activity log records it,
 * - hitting `won` creates the Build — exactly once, ever — seeding the
 *   website item into review when a blueprint already exists.
 */
export async function transitionBusinessStage(
  repos: BusinessSpineRepositories,
  businessId: string,
  stage: LifecycleStage,
  reason?: string,
): Promise<Business> {
  const business = await repos.businesses.updateStage(businessId, stage, reason);

  await repos.activity.log({
    businessId,
    kind: "stage_change",
    message: reason
      ? `Stage → ${stageLabel(stage)} — ${reason}`
      : `Stage → ${stageLabel(stage)}`,
    meta: { stage, ...(reason ? { reason } : {}), lost: isLostStage(stage) },
  });

  if (stage === "won") {
    const { build, created } = await repos.builds.createForBusiness(businessId);
    if (created) {
      await repos.activity.log({
        businessId,
        kind: "build_created",
        message: "Build created — production items queued",
        meta: { buildId: build.id },
      });
      const blueprint = await repos.artifacts.latest(businessId, "blueprint");
      if (blueprint) {
        await repos.builds.setItemStatus(build.id, "website", "review");
        await repos.activity.log({
          businessId,
          kind: "build_item_update",
          message: `Website moved to review — blueprint v${blueprint.version} already exists`,
          meta: { kind: "website", status: "review" },
        });
      }
    }
  }

  return business;
}

/**
 * Record an artifact generation on the business's activity log, and advance a
 * not-yet-reviewed website build item to review when a blueprint lands (the
 * automated part of the website pipeline; the review gate still applies).
 */
export async function recordArtifactGenerated(
  repos: BusinessSpineRepositories,
  businessId: string,
  kind: ArtifactKind,
  version: number,
): Promise<void> {
  await repos.activity.log({
    businessId,
    kind: "artifact_generated",
    message: `Generated ${kind} v${version}`,
    meta: { artifactKind: kind, version },
  });

  if (kind !== "blueprint") return;
  const build = await repos.builds.getForBusiness(businessId);
  const website = build?.items.find((item) => item.kind === "website");
  if (
    build &&
    website &&
    (website.status === "queued" || website.status === "building")
  ) {
    await repos.builds.setItemStatus(build.id, "website", "review");
    await repos.activity.log({
      businessId,
      kind: "build_item_update",
      message: `Website moved to review — blueprint v${version} ready`,
      meta: { kind: "website", status: "review" },
    });
  }
}
