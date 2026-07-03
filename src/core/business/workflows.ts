/**
 * Spine workflows (ADR-024): the business rules that span repositories,
 * framework-free so they are unit-testable and adapter-agnostic. Server
 * actions call these; they never contain Next.js concerns themselves.
 */

import { isLostStage, stageLabel, type Business, type LifecycleStage } from "./model";
import { BusinessNotFoundError } from "./repository";
import type {
  ArtifactKind,
  BusinessSpineRepositories,
  Publication,
} from "./repository";

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

/** Kebab-case a business name into a slug candidate. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-and-/g, "-")
    .replace(/--+/g, "-");
}

/** A slug no OTHER business owns (suffixes -2, -3… when contested). */
export async function uniqueSlugFor(
  repos: BusinessSpineRepositories,
  name: string,
  businessId?: string,
): Promise<string> {
  const base = slugify(name) || "site";
  let candidate = base;
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const owner = await repos.publications.slugOwner(candidate);
    if (owner === null || owner === businessId) return candidate;
    candidate = `${base}-${suffix}`;
  }
  throw new Error(`Could not find a free slug for "${name}"`);
}

/**
 * Publish (or republish) the website (ADR-027): pins the LATEST blueprint
 * version as an immutable snapshot. Gating happens upstream — this is called
 * only from the founder-approved go-live action. The slug is stable across
 * republishes.
 */
export async function publishWebsite(
  repos: BusinessSpineRepositories,
  businessId: string,
): Promise<Publication> {
  const business = await repos.businesses.get(businessId);
  if (!business) throw new BusinessNotFoundError(businessId);
  const blueprint = await repos.artifacts.latest(businessId, "blueprint");
  if (!blueprint) {
    throw new Error("Cannot publish: no blueprint artifact exists yet");
  }

  const history = await repos.publications.history(businessId);
  const slug =
    history[0]?.slug ?? (await uniqueSlugFor(repos, business.name, businessId));
  const publication = await repos.publications.publish(
    businessId,
    blueprint.version,
    slug,
  );
  await repos.activity.log({
    businessId,
    kind: "publication",
    message: `Published v${publication.version} (blueprint v${blueprint.version}) at /sites/${slug}`,
    meta: {
      publicationId: publication.id,
      publicationVersion: publication.version,
      blueprintVersion: blueprint.version,
      slug,
    },
  });
  return publication;
}

/** Take the live site offline (explicit founder action). */
export async function unpublishWebsite(
  repos: BusinessSpineRepositories,
  businessId: string,
): Promise<void> {
  const current = await repos.publications.current(businessId);
  await repos.publications.unpublish(businessId);
  await repos.activity.log({
    businessId,
    kind: "publication",
    message: current
      ? `Unpublished v${current.version} — site offline`
      : "Unpublish requested — nothing was live",
    meta: { unpublished: true },
  });
}

export interface EnquiryInput {
  slug: string;
  name: string;
  contact: string;
  message: string;
  sourcePage: string;
  /** Hidden honeypot field — humans leave it empty. */
  honeypot: string;
}

export interface EnquiryOutcome {
  /** Always true when not thrown — bots must believe they succeeded. */
  accepted: boolean;
  /** True when the honeypot fired and nothing was stored. */
  dropped: boolean;
}

/**
 * Handle a public enquiry (ADR-027): resolves the LIVE publication by slug,
 * validates essentials, silently drops honeypot hits, stores the enquiry on
 * the account, and logs it to the activity feed.
 */
export async function processEnquiry(
  repos: BusinessSpineRepositories,
  input: EnquiryInput,
): Promise<EnquiryOutcome> {
  const publication = await repos.publications.currentBySlug(input.slug.trim());
  if (!publication) {
    throw new Error(`No live publication for slug "${input.slug}"`);
  }
  if (input.honeypot.trim() !== "") {
    return { accepted: true, dropped: true };
  }
  const name = input.name.trim();
  const contact = input.contact.trim();
  if (!name || !contact) {
    throw new Error("An enquiry needs a name and contact");
  }

  const enquiry = await repos.enquiries.create({
    businessId: publication.businessId,
    publicationId: publication.id,
    name: name.slice(0, 200),
    contact: contact.slice(0, 200),
    message: input.message.trim().slice(0, 2000),
    sourcePage: input.sourcePage.trim().slice(0, 500) || "/",
  });
  await repos.activity.log({
    businessId: publication.businessId,
    kind: "enquiry",
    message: `Enquiry from ${enquiry.name} (${enquiry.contact}) via /sites/${publication.slug}`,
    meta: { enquiryId: enquiry.id, publicationId: publication.id },
  });
  return { accepted: true, dropped: false };
}
