/**
 * The evidentiary-slot law (ADR-060).
 *
 * TITAN never generates a photograph of work the business did — the fourth
 * item on ADR-059's list of things that may never be invented, alongside
 * accreditations, reviews and prices.
 *
 * Most media slots carry no claim about provenance. A hero backdrop is
 * scene-setting; a close-up of block paving is a material illustration; the
 * ambience film is a mood. None of them says "we did this".
 *
 * A few slots carry the claim in their own meaning. A frame under the
 * heading "The work speaks first". A before/after comparison with a drag
 * handle. Those are EVIDENCE, and evidence can only come from the business.
 *
 * The rule is expressed on the SLOT REFERENCE rather than on the primitive,
 * deliberately, so that it holds at three independent choke points:
 *
 *   1. `deriveMediaPlan` — the slot is planned but carries no prompt, so
 *      there is nothing to send a provider.
 *   2. `generateMissingMedia` — refuses to commission it, so it is never
 *      paid for.
 *   3. `resolvePublishedSite` — refuses to SERVE a non-customer asset in
 *      one, so assets generated before this law existed stop appearing on
 *      live sites without a migration.
 *
 * Any one of the three would be bypassable on its own. Together they are
 * not.
 */

/**
 * The provenance provider that marks an asset as the business's OWN
 * photograph (ADR-053). Lives here rather than in `./ingest` because the
 * published-site resolution seam needs it and must not drag the ingestion
 * pipeline (and sharp) into the public page's server graph. `./ingest`
 * re-exports it, so every existing import still resolves.
 */
export const CUSTOMER_UPLOAD_PROVIDER = "customer-upload";

export type MediaSourcing =
  /** Atmosphere, setting, texture — no claim about who did what. */
  | "generated"
  /** The slot asserts "this is our work". The business's own photograph, or
   *  nothing at all. */
  | "customer-photo";

/**
 * `.before` / `.after`           — the transformation comparison.
 * `.pair-before` / `.pair-after` — the portfolio's headline comparison.
 * `.frame-N`                     — portfolio and gallery project frames.
 *
 * Matched against `MediaRecord.slotRef`, which is always the plain slot —
 * retake suffixes (`.take-2`) and upload suffixes (`.customer-1`) live in
 * the STORAGE path, never on the record.
 */
const EVIDENTIARY_SLOT = /\.(?:pair-)?(?:before|after)$|\.frame-\d+$/;

/** Who is allowed to fill this slot. */
export function sourcingForSlot(slotRef: string): MediaSourcing {
  return EVIDENTIARY_SLOT.test(slotRef) ? "customer-photo" : "generated";
}

/** True when the slot's own meaning asserts "this is our work". */
export function isEvidentiarySlot(slotRef: string): boolean {
  return sourcingForSlot(slotRef) === "customer-photo";
}

/**
 * The ILLUSTRATIVE counterpart of an evidentiary slot (ADR-060).
 *
 * `.showcase-N` dresses a portfolio or gallery, `.atmosphere` dresses a
 * transformation arc, when the business has supplied no photographs of its
 * own. They are ordinary generated slots — no dot-suffix the evidentiary
 * regex matches — because they carry no provenance claim: the section that
 * renders them is headed "the finishes we install", not "our recent work",
 * and its alt text names a material, not a job.
 *
 * The distinction is the CLAIM, never the technology. A generated image is
 * lawful illustration in one frame and a misleading presentation in the
 * next, depending only on what the page around it asserts.
 */
export function showcaseSlot(baseRef: string, index: number): string {
  return `${baseRef}.showcase-${index}`;
}

export function atmosphereSlot(baseRef: string): string {
  return `${baseRef}.atmosphere`;
}

/**
 * How many project frames a section lays out — read by BOTH the media plan
 * and the primitive that renders them, so the shot list the founder is asked
 * to collect is exactly the set of frames the page has room for.
 *
 * It was not, before: the plan declared three portfolio frames while the
 * grid drew four and the carousel five, so two frames per site could never
 * be filled by anyone. Silent, because generation filled them.
 */
export function projectFrameCount(identifier: string, variant?: string): number {
  if (identifier === "gallery.immersive-grid") {
    // "full-bleed-slider" pans four panels; masonry lays out six.
    return variant === "full-bleed-slider" ? 4 : 6;
  }
  if (identifier === "proof.portfolio-showcase") {
    if (variant === "cinematic-carousel") return 5;
    // The before-after variant spends its headline on the pair.
    if (variant === "before-after-reveal") return 3;
    return 4;
  }
  return 0;
}
