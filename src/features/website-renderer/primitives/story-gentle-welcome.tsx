/**
 * story.gentle-welcome — the care archetype's fear-removing welcome (ADR-043).
 *
 * A soft, unhurried introduction that puts the visitor at ease before anything
 * is sold: a large calm statement, warm reassurance points drawn from the
 * strategy's key messages, and a soft media frame. Variants: "soft-intro" (a
 * calm two-column) / "meet-the-practice" (media-forward invitation). Copy comes
 * only from slots; media is a real approved asset or an honest art-directed
 * frame — never faked.
 */

import { Check } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import { splitList } from "../model/slots";
import { Reveal, Stagger, StaggerItem } from "../motion/motion";
import {
  Container,
  Eyebrow,
  MediaSlotFrame,
  SectionShell,
  SectionTitle,
  displayFont,
  primitiveName,
} from "./atoms";
import { CinematicImage } from "./cinematic-image";

export function StoryGentleWelcome({
  section,
  variant,
  slots,
  mediaAssets,
  mode,
}: PrimitiveSectionProps) {
  const headline = slots.headline ?? slots["welcome-message"] ?? primitiveName(section);
  const welcome = slots["welcome-message"] ?? "";
  const reassurances = splitList(slots.reassurances);
  const showWelcomeBody = welcome && welcome !== headline;

  const media = section.media?.[0];
  const mediaRef = media?.generationRef ?? `media/${section.id}`;
  const asset = mediaAssets?.[mediaRef];
  const mediaForward = variant === "meet-the-practice";

  const Frame = (
    <div className="relative">
      {asset ? (
        <CinematicImage
          asset={asset}
          alt={headline}
          className="w-full overflow-hidden rounded-[var(--wr-radius-lg)] border"
          sizes="(max-width: 900px) 100vw, 46vw"
        />
      ) : (
        <MediaSlotFrame
          media={media}
          label="Gentle welcome — the space & the people"
          minHeight={mediaForward ? "24rem" : "20rem"}
          mode={mode}
        />
      )}
    </div>
  );

  const Copy = (
    <div className="flex flex-col">
      <Eyebrow id={`${section.id}-title`}>{primitiveName(section)}</Eyebrow>
      <Reveal>
        <SectionTitle id={`${section.id}-heading`} size="var(--wr-text-2xl)">
          {headline}
        </SectionTitle>
      </Reveal>
      {showWelcomeBody && (
        <Reveal delay={0.05}>
          <p
            className="mt-5 text-pretty"
            style={{
              maxWidth: "var(--wr-measure)",
              fontSize: "var(--wr-text-lg)",
              lineHeight: 1.6,
              color: "var(--wr-ink-muted)",
            }}
          >
            {welcome}
          </p>
        </Reveal>
      )}
      {reassurances.length > 0 && (
        <Stagger
          gap={0.07}
          className="mt-8 flex flex-col gap-3.5"
        >
          {reassurances.map((point) => (
            <StaggerItem key={point}>
              <p className="flex items-start gap-3 text-base" style={{ color: "var(--wr-ink)" }}>
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "var(--wr-surface-raised)", color: "var(--wr-accent)" }}
                >
                  <Check className="size-3.5" strokeWidth={2.5} />
                </span>
                <span style={{ ...displayFont, letterSpacing: "-0.01em" }}>{point}</span>
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );

  return (
    <SectionShell section={section}>
      <Container>
        {mediaForward ? (
          <div className="flex flex-col gap-10">
            <Reveal>{Frame}</Reveal>
            <div className="mx-auto max-w-[46rem] text-center">{Copy}</div>
          </div>
        ) : (
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {Copy}
            <Reveal delay={0.1}>{Frame}</Reveal>
          </div>
        )}
      </Container>
    </SectionShell>
  );
}
