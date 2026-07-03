/**
 * Build model (ADR-024): what TITAN produces for a won business, and the
 * status ladder every deliverable climbs. THE REVIEW GATE IS LAW: no item
 * reaches `live` except from `approved`, and `approved` is only granted from
 * `review` — the founder's explicit approval action. Both adapters enforce
 * these rules through {@link assertBuildItemTransition}.
 */

/** The founder's build items. Order is the canonical display order. */
export const BUILD_ITEM_KINDS = [
  "website",
  "google_ads",
  "lsa",
  "seo",
  "gbp",
  "meta_ads",
  "ai_search",
] as const;

export type BuildItemKind = (typeof BUILD_ITEM_KINDS)[number];

export const BUILD_ITEM_STATUSES = [
  "queued",
  "building",
  "ai_check",
  "review",
  "approved",
  "live",
] as const;

export type BuildItemStatus = (typeof BUILD_ITEM_STATUSES)[number];

/**
 * v1 honesty: only the website pipeline is automated (blueprint → renderer).
 * Every other item is run by hand until its department comes online, and the
 * UI labels it "manual".
 */
export function isManualBuildKind(kind: BuildItemKind): boolean {
  return kind !== "website";
}

const LABELS: Record<BuildItemKind, string> = {
  website: "Website",
  google_ads: "Google Ads",
  lsa: "Local Services Ads",
  seo: "SEO",
  gbp: "Google Business Profile",
  meta_ads: "Meta Ads",
  ai_search: "AI Search",
};

export function buildItemLabel(kind: BuildItemKind): string {
  return LABELS[kind];
}

export class BuildTransitionError extends Error {
  constructor(from: BuildItemStatus, to: BuildItemStatus, rule: string) {
    super(`Illegal build item transition ${from} → ${to}: ${rule}`);
    this.name = "BuildTransitionError";
  }
}

/**
 * Transitions are deliberately permissive (manual items move by hand, items
 * get sent back) EXCEPT the gate:
 *   · `live` is reachable only from `approved`
 *   · `approved` is reachable only from `review`
 */
export function assertBuildItemTransition(
  from: BuildItemStatus,
  to: BuildItemStatus,
): void {
  if (from === to) {
    throw new BuildTransitionError(from, to, "the item is already in that status");
  }
  if (to === "live" && from !== "approved") {
    throw new BuildTransitionError(
      from,
      to,
      "nothing goes live without founder approval (review → approved → live)",
    );
  }
  if (to === "approved" && from !== "review") {
    throw new BuildTransitionError(
      from,
      to,
      "approval is granted only from review",
    );
  }
}
