"use server";

/**
 * CRM server actions (ADR-024). Thin orchestration over the spine workflows —
 * the business rules (build-once-on-won, the review gate, activity logging)
 * live in core/business and are unit-tested there.
 */

import { revalidatePath } from "next/cache";
import {
  generateCampaignPlan,
  validateCampaignPlan,
} from "@/core/ads-intelligence";
import type { Deal } from "@/core/pricing";
import type { WebsiteBlueprint } from "@/core/website-blueprint";
import {
  ALL_LIFECYCLE_STATES,
  BusinessNotFoundError,
  buildItemLabel,
  markEnquiryStatus,
  publishWebsite,
  recordArtifactGenerated,
  resolveBusinessSpine,
  transitionBusinessStage,
  unpublishWebsite,
  type BuildItemKind,
  type BuildItemStatus,
  type LifecycleStage,
} from "@/core/business";
import { buildDeal, getPricedService, type DealInputs } from "@/core/pricing";

function revalidateCrm(businessId?: string): void {
  revalidatePath("/crm");
  revalidatePath("/crm/build-queue");
  revalidatePath("/crm/accounts");
  if (businessId) {
    revalidatePath(`/crm/${businessId}`);
    revalidatePath(`/businesses/${businessId}`);
  }
  revalidatePath("/businesses");
  revalidatePath("/business-intake");
}

/** Level 1 quick-add: the minimum to get a lead on the board. */
export async function quickAddLead(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const trade = String(formData.get("trade") ?? "").trim();
  const tradeId = String(formData.get("tradeId") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name || !trade || !location) return;

  const spine = await resolveBusinessSpine();
  await spine.businesses.create({
    name,
    trade,
    ...(tradeId ? { tradeId } : {}),
    location,
    ...(email || phone
      ? { contact: { ...(email ? { email } : {}), ...(phone ? { phone } : {}) } }
      : {}),
  });
  revalidateCrm();
}

export async function moveBusinessStage(
  businessId: string,
  stage: string,
  reason?: string,
): Promise<void> {
  if (!(ALL_LIFECYCLE_STATES as readonly string[]).includes(stage)) {
    throw new Error(`Unknown lifecycle stage "${stage}"`);
  }
  const spine = await resolveBusinessSpine();
  await transitionBusinessStage(
    spine,
    businessId,
    stage as LifecycleStage,
    reason?.trim() || undefined,
  );
  revalidateCrm(businessId);
}

export async function addBusinessNote(
  businessId: string,
  message: string,
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) return;
  const spine = await resolveBusinessSpine();
  await spine.activity.log({ businessId, kind: "note", message: trimmed });
  revalidateCrm(businessId);
}

/**
 * Save a deal as a new artifact version (never overwrites) + activity.
 * Ad spend is RE-DERIVED here via buildDeal (lead target × CPL) — the server
 * never trusts a client-supplied spend figure (v1.1 addendum).
 */
export async function saveDeal(
  businessId: string,
  inputs: DealInputs,
): Promise<void> {
  const deal = buildDeal({
    ...inputs,
    includedServices: inputs.includedServices.filter((id) => getPricedService(id)),
    notes: inputs.notes?.trim() || undefined,
  });
  const spine = await resolveBusinessSpine();
  const artifact = await spine.artifacts.save({
    businessId,
    kind: "deal",
    payload: deal,
  });
  await recordArtifactGenerated(spine, businessId, "deal", artifact.version);
  revalidateCrm(businessId);
}

/**
 * Move a build item (founder approvals, send-backs, manual progress, go-live).
 * The review gate is enforced in core; going live on the website advances the
 * business itself to `live`.
 */
export async function setBuildItemStatus(
  businessId: string,
  kind: BuildItemKind,
  status: BuildItemStatus,
  note?: string,
): Promise<void> {
  const spine = await resolveBusinessSpine();
  const build = await spine.builds.getForBusiness(businessId);
  if (!build) throw new BusinessNotFoundError(businessId);

  await spine.builds.setItemStatus(build.id, kind, status, note?.trim() || undefined);
  await spine.activity.log({
    businessId,
    kind: "build_item_update",
    message: note?.trim()
      ? `${buildItemLabel(kind)} → ${status} — ${note.trim()}`
      : `${buildItemLabel(kind)} → ${status}`,
    meta: { kind, status, ...(note?.trim() ? { note: note.trim() } : {}) },
  });

  if (kind === "website" && status === "live") {
    // Going live IS publishing (ADR-027): the founder-approved snapshot pins
    // the latest blueprint version and starts serving at the public URL.
    await publishWebsite(spine, businessId);
    const business = await spine.businesses.get(businessId);
    if (business && business.stage !== "live" && business.stage !== "account") {
      await transitionBusinessStage(spine, businessId, "live");
    }
  }
  revalidateCrm(businessId);
}

/** Take the live site offline (explicit founder action, ADR-027). */
export async function unpublishBusinessSite(businessId: string): Promise<void> {
  const spine = await resolveBusinessSpine();
  await unpublishWebsite(spine, businessId);
  revalidateCrm(businessId);
}


/** Move an enquiry through the speed-to-lead lifecycle (ADR-030). */
export async function markEnquiry(
  enquiryId: string,
  status: "seen" | "contacted" | "qualified" | "disqualified",
): Promise<void> {
  const spine = await resolveBusinessSpine();
  const enquiry = await markEnquiryStatus(spine, enquiryId, status);
  revalidateCrm(enquiry.businessId);
}

/** Where enquiry notifications for this account go (ADR-030). */
export async function saveOwnerEmail(
  businessId: string,
  ownerEmail: string,
): Promise<void> {
  const spine = await resolveBusinessSpine();
  await spine.businesses.updateDetails(businessId, {
    ownerEmail: ownerEmail.trim() || undefined,
  });
  revalidateCrm(businessId);
}


/**
 * Generate the Google Ads campaign plan (ADR-031): deterministic assembly
 * from the deal, the live publication's pages, and the taxonomy. Lands the
 * google_ads build item in review — the founder gate approves the DESIGN;
 * execution stays manual.
 */
export async function generateAdsPlan(businessId: string): Promise<void> {
  const spine = await resolveBusinessSpine();
  const business = await spine.businesses.get(businessId);
  if (!business) throw new BusinessNotFoundError(businessId);

  const dealArtifact = await spine.artifacts.latest<Deal>(businessId, "deal");
  if (!dealArtifact) {
    throw new Error("No deal yet — the plan's budget comes from the deal's lead target × CPL.");
  }
  const publication = await spine.publications.current(businessId);
  if (!publication) {
    throw new Error("No live site yet — every ad group must land on a live page.");
  }
  const blueprint = await spine.artifacts.getVersion<WebsiteBlueprint>(
    businessId,
    "blueprint",
    publication.blueprintVersion,
  );
  if (!blueprint) throw new Error("The publication's blueprint version is missing.");

  const baseUrl = `${process.env.TITAN_APP_ORIGIN ?? "http://localhost:4100"}/sites/${publication.slug}`;
  const pages = blueprint.payload.pages.pages.map((page) => ({
    path: page.suggestedUrl ?? "/",
    name: page.name,
  }));
  const deal = dealArtifact.payload;
  const plan = generateCampaignPlan({
    business: {
      name: business.name,
      trade: business.trade,
      tradeId: business.tradeId,
      location: business.location,
      coverageAreas: business.coverageAreas,
    },
    deal: {
      leadTargetPerMonth: deal.leadTargetPerMonth,
      cplUsed: deal.cplUsed,
      cplSource: deal.cplSource,
      monthlyAdSpend: deal.monthlyAdSpend,
    },
    site: { baseUrl, pages },
  });
  const validation = validateCampaignPlan(plan, {
    validUrls: pages.map((page) => `${baseUrl}${page.path === "/" ? "" : page.path}`),
  });
  if (!validation.valid) {
    // The generator is deterministic — a violation here is a bug, said loudly.
    throw new Error(`Generated plan failed validation:\n${validation.errors.join("\n")}`);
  }
  const artifact = await spine.artifacts.save({
    businessId,
    kind: "campaign_plan",
    payload: plan,
    meta: {
      dealVersion: dealArtifact.version,
      blueprintVersion: publication.blueprintVersion,
      publicationVersion: publication.version,
    },
  });
  await recordArtifactGenerated(spine, businessId, "campaign_plan", artifact.version);
  revalidateCrm(businessId);
}
