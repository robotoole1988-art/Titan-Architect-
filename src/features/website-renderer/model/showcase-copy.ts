/**
 * The two voices of an evidentiary section (ADR-060).
 *
 * A portfolio, gallery or transformation arc says one of two different
 * things depending on what the business has actually supplied:
 *
 *   EVIDENCE     — "our recent work". True only with the customer's own
 *                  photographs behind it.
 *   ILLUSTRATIVE — "the finish we install". True on day one, of any
 *                  competent business in the trade, and provable by the
 *                  work itself rather than by a photograph.
 *
 * Generated imagery is lawful in the second and misleading in the first,
 * and the difference is entirely in this file: the heading, the caption,
 * and the alt text. Same pixels either way.
 *
 * The illustrative voice is deliberately NOT hedged with an "illustrative"
 * disclaimer. It does not need one, because it makes no claim to disclaim —
 * and a premium site that captions its own imagery "not real" teaches the
 * visitor to distrust everything else on the page. What it must never do is
 * imply provenance, which is what the wording below is written to avoid and
 * what tests/core/evidence-law.test.ts enforces.
 */

export interface ShowcaseVoice {
  /** The section heading. */
  title: string;
  /**
   * The small label above it. These sections used to print the REGISTRY
   * NAME here — "Portfolio Showcase", "Transformation Arc" — internal
   * vocabulary on the customer's live page, and worse: "Portfolio" is
   * itself a provenance word sitting directly above imagery that claims no
   * provenance. Public gets this instead; preview keeps the primitive name
   * as founder scaffolding (ADR-034).
   *
   * The other call sites printing internal names — "Lead Capture" appears
   * on 100% of pages — are a separate fix.
   */
  eyebrow: string;
  /** Alt text for frame N (0-indexed). */
  alt: (index: number) => string;
}

/**
 * Per-theme illustrative copy. The theme ref is the archetype's fingerprint
 * (titan-project, titan-care, …), so an emergency roofer and a dental
 * practice never open the same section with the same sentence — the "no two
 * sites alike" rule applied to the one place both would otherwise say
 * "Our work".
 */
const ILLUSTRATIVE_BY_THEME: Record<string, string> = {
  "titan-emergency": "Made right, made safe",
  "titan-project": "The finish you're buying",
  "titan-premium": "Materials and finishes",
  "titan-technical": "The standard we install to",
  "titan-care": "Inside the practice",
  "titan-recurring": "Kept to this standard",
  "titan-event": "How it comes together",
};

const ILLUSTRATIVE_FALLBACK = "The standard we work to";

/** Evidence voice — only ever used when real photographs are present. */
export function evidenceVoice(): ShowcaseVoice {
  return {
    title: "Our recent work",
    eyebrow: "Recent work",
    alt: (index) => `A completed job — photograph ${index + 1}`,
  };
}

/** Illustrative voice — what the trade produces, not who produced it. */
export function illustrativeVoice(
  themeRef: string | undefined,
  trade: string | undefined,
): ShowcaseVoice {
  const subject = (trade ?? "").trim().toLowerCase();
  return {
    title: (themeRef && ILLUSTRATIVE_BY_THEME[themeRef]) || ILLUSTRATIVE_FALLBACK,
    eyebrow: "Workmanship",
    alt: (index) =>
      subject
        ? `The ${subject} finish — detail ${index + 1}`
        : `Finish detail ${index + 1}`,
  };
}

/**
 * The arc's headline when it has no real pair to compare. The section keeps
 * its atmosphere and its real journey steps; what it drops is the assertion
 * that a specific property was transformed by this business.
 */
export function atmosphericArcTitle(themeRef: string | undefined): string {
  return (themeRef && ILLUSTRATIVE_BY_THEME[themeRef]) || ILLUSTRATIVE_FALLBACK;
}

/**
 * The public eyebrow for any section that would otherwise print its REGISTRY
 * NAME to the customer (ADR-061).
 *
 * Measured on a live driveways page: "Lead Capture", "Process Journey Map",
 * "Reassurance FAQ", "Portfolio Showcase" and "Transformation Arc" were all
 * rendering as visible labels. "Lead Capture" appeared on 100% of pages —
 * internal product vocabulary, above the form the customer is meant to fill
 * in.
 *
 * Preview keeps the primitive name: it is useful scaffolding for the founder
 * and ADR-034 already draws that line.
 */
const PUBLIC_EYEBROWS: Record<string, string> = {
  "conversion.lead-capture": "Get in touch",
  "conversion.emergency-cta": "Need help now",
  "process.journey-map": "How it works",
  "faq.reassurance-accordion": "Common questions",
  "services.interactive-explorer": "What we do",
  "location.service-area": "Where we work",
  "trust.review-wall": "What customers say",
  "trust.team-introduction": "The team",
  "proof.credential-band": "Why us",
  "story.gentle-welcome": "Welcome",
};

export function publicEyebrow(identifier: string): string | undefined {
  return PUBLIC_EYEBROWS[identifier];
}
