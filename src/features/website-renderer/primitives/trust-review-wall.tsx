/**
 * trust.review-wall — social proof, honestly.
 *
 * TITAN never fabricates testimonials. The wall renders the blueprint's
 * review THEMES as real brand copy and stages art-directed, explicitly
 * annotated review slots awaiting verified reviews. Variant "spotlight"
 * features one large slot; "carousel"/"masonry" arrange several equally.
 */

import { Star } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
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
        <div className="flex items-center gap-1" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="size-4" style={{ color: "var(--wr-ink-faint)" }} />
          ))}
        </div>
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

export function TrustReviewWall({ section, variant, slots, mode }: PrimitiveSectionProps) {
  const themes = reviewThemes(slots["review-themes"]);
  const attribution = slots["attribution-direction"];
  const [headline, ...supporting] = themes;
  const spotlight = variant === "spotlight";

  // Public mode (ADR-034): with no VERIFIED reviews, the section collapses
  // entirely — never empty quote cards, never zero-star outlines.
  if (mode === "public") return null;

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
