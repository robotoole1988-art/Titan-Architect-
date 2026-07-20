/**
 * trust.review-wall — social proof, honestly.
 *
 * TITAN never fabricates testimonials. With VERIFIED reviews ingested
 * (ADR-053) the wall renders them — real names, real dates, filled stars, a
 * source label. Without them: preview mode stages art-directed, explicitly
 * annotated slots awaiting verified reviews; public mode collapses entirely.
 * Variant "spotlight" features one large card; "carousel"/"masonry" arrange
 * several equally.
 */

import { Star } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import type { ResolvedReview } from "../model/types";
import { Reveal, Stagger, StaggerItem } from "../motion/motion";
import { afterFirstDash, splitList } from "../model/slots";
import {
  AnnotationTag,
  Container,
  CopyChip,
  Eyebrow,
  SectionShell,
  SectionTitle,
  displayFont,
  primitiveName,
} from "./atoms";

/** "Curate reviews that echo the key messages — a · b · c." → [a, b, c] */
function reviewThemes(direction: string | undefined): string[] {
  if (!direction) return [];
  return splitList(afterFirstDash(direction));
}

const SOURCE_LABELS: Record<ResolvedReview["source"], string> = {
  direct: "Verified customer",
  google: "Google review",
  other: "Verified review",
};

/** "2026-07-01" → "July 2026" (en-GB, month granularity — honest, compact). */
function reviewDateLabel(reviewedAt: string): string {
  const parsed = new Date(`${reviewedAt.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return reviewedAt;
  return parsed.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function RatingStars({ rating, dim = false }: { rating: number; dim?: boolean }) {
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className="size-4"
          style={
            dim
              ? { color: "var(--wr-ink-faint)" }
              : index < rating
                ? { color: "var(--wr-accent)", fill: "var(--wr-accent)" }
                : { color: "var(--wr-ink-faint)" }
          }
        />
      ))}
    </div>
  );
}

/** A REAL, verified review (ADR-053). */
function ReviewCard({ review, large = false }: { review: ResolvedReview; large?: boolean }) {
  return (
    <article
      className={`relative flex flex-col justify-between gap-6 overflow-hidden rounded-[var(--wr-radius-lg)] border p-7 ${large ? "sm:p-10" : ""}`}
      style={{ borderColor: "var(--wr-line)", background: "var(--wr-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none select-none leading-none"
        style={{
          ...displayFont,
          fontSize: large ? "5rem" : "3rem",
          color: "var(--wr-accent)",
          opacity: 0.35,
        }}
      >
        “
      </div>
      <div className="flex flex-col gap-3">
        <blockquote
          className="text-pretty font-medium"
          style={{
            ...displayFont,
            fontSize: large ? "var(--wr-text-xl)" : "var(--wr-text-lg)",
            color: "var(--wr-ink)",
            lineHeight: 1.3,
          }}
        >
          {review.text}
        </blockquote>
        <RatingStars rating={review.rating} />
      </div>
      <footer className="flex flex-col gap-1">
        <span
          className="font-medium"
          style={{ color: "var(--wr-ink)", fontSize: "var(--wr-text-sm)" }}
        >
          {review.customerName}
        </span>
        <span className="text-[11px] leading-relaxed" style={{ color: "var(--wr-ink-faint)" }}>
          {SOURCE_LABELS[review.source]} · {reviewDateLabel(review.reviewedAt)}
        </span>
      </footer>
    </article>
  );
}

/** The awaiting-verified-reviews slot — PREVIEW mode only (ADR-034). */
function ReviewSlot({
  theme,
  attribution,
  large = false,
}: {
  theme?: string;
  attribution?: string;
  large?: boolean;
}) {
  return (
    <article
      className={`relative flex flex-col justify-between gap-6 overflow-hidden rounded-[var(--wr-radius-lg)] border p-7 ${large ? "sm:p-10" : ""}`}
      style={{ borderColor: "var(--wr-line)", background: "var(--wr-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none select-none leading-none"
        style={{
          ...displayFont,
          fontSize: large ? "5rem" : "3rem",
          color: "var(--wr-accent)",
          opacity: 0.35,
        }}
      >
        “
      </div>
      <div className="flex flex-col gap-3">
        {theme && (
          <p
            className="text-pretty font-medium"
            style={{
              ...displayFont,
              fontSize: large ? "var(--wr-text-xl)" : "var(--wr-text-lg)",
              color: "var(--wr-ink)",
              lineHeight: 1.3,
            }}
          >
            {theme}
          </p>
        )}
        <RatingStars rating={0} dim />
      </div>
      <div className="flex flex-col gap-1.5">
        <AnnotationTag>verified review slot</AnnotationTag>
        {attribution && (
          <span className="text-[11px] leading-relaxed" style={{ color: "var(--wr-ink-faint)" }}>
            {attribution}
          </span>
        )}
      </div>
    </article>
  );
}

export function TrustReviewWall({ section, variant, slots, mode, reviews }: PrimitiveSectionProps) {
  const verified = reviews ?? [];
  const spotlight = variant === "spotlight";

  // VERIFIED reviews exist (ADR-053): render them, in both modes. Real
  // names, real dates — never themes, never placeholders.
  if (verified.length > 0) {
    const [featured, ...rest] = verified;
    return (
      <SectionShell section={section}>
        <Container wide>
          <Reveal>
            <Eyebrow>{primitiveName(section)}</Eyebrow>
            <SectionTitle id={`${section.id}-title`}>
              What customers say
            </SectionTitle>
          </Reveal>

          <Stagger
            className={`mt-12 grid gap-4 ${
              spotlight ? "lg:grid-cols-[3fr_2fr]" : "sm:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            <StaggerItem className={spotlight ? "lg:row-span-2" : ""}>
              <ReviewCard review={featured} large={spotlight} />
            </StaggerItem>
            {rest.slice(0, spotlight ? 2 : 5).map((review) => (
              <StaggerItem key={`${review.customerName}:${review.reviewedAt}`}>
                <ReviewCard review={review} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </SectionShell>
    );
  }

  // Public mode (ADR-034): with no VERIFIED reviews, the section collapses
  // entirely — never empty quote cards, never zero-star outlines.
  if (mode === "public") return null;

  const themes = reviewThemes(slots["review-themes"]);
  const attribution = slots["attribution-direction"];
  const [headline, ...supporting] = themes;

  return (
    <SectionShell section={section}>
      <Container wide>
        <Reveal>
          <Eyebrow>{primitiveName(section)}</Eyebrow>
          <SectionTitle id={`${section.id}-title`}>
            {headline ?? attribution ?? ""}
          </SectionTitle>
        </Reveal>

        <Stagger
          className={`mt-12 grid gap-4 ${
            spotlight ? "lg:grid-cols-[3fr_2fr]" : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          <StaggerItem className={spotlight ? "lg:row-span-2" : ""}>
            <ReviewSlot theme={headline} attribution={attribution} large={spotlight} />
          </StaggerItem>
          {(supporting.length > 0 ? supporting : themes).slice(0, spotlight ? 2 : 5).map((theme) => (
            <StaggerItem key={theme}>
              <ReviewSlot theme={theme} attribution={attribution} />
            </StaggerItem>
          ))}
        </Stagger>

        {themes.length > 0 && (
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap gap-2">
              {themes.map((theme) => (
                <CopyChip key={theme}>{theme}</CopyChip>
              ))}
            </div>
          </Reveal>
        )}
      </Container>
    </SectionShell>
  );
}
