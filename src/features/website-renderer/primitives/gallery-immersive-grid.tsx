/**
 * gallery.immersive-grid — imagery-led, unhurried (ADR-029).
 *
 * For work bought with the eyes: expansive, editorial frames given full
 * attention. Every frame is an art-directed slot with its shooting brief —
 * atmosphere from composed light, never fake photography.
 *
 * TWO VOICES (ADR-060): a gallery captioned "our work" is EVIDENCE and needs
 * the customer's own photographs; the same grid captioned as the trade's
 * finishes is ILLUSTRATION and may be generated. It opens illustrative and
 * upgrades itself the moment real photographs arrive.
 *
 * Variants: "masonry" (staggered editorial column heights) /
 * "full-bleed-slider" (scroll-snap panels the width of the viewport).
 */

import { MoveHorizontal } from "lucide-react";
import { projectFrameCount, showcaseSlot } from "@/core/media/sourcing";
import { evidenceVoice, illustrativeVoice } from "../model/showcase-copy";
import type { PrimitiveSectionProps } from "../model/types";
import { CinematicImage } from "./cinematic-image";
import type { ResolvedMediaAsset } from "../model/types";
import { Parallax, Reveal } from "../motion/motion";
import {
  AnnotationTag,
  Container,
  Eyebrow,
  SectionShell,
  SectionTitle,
  monoFont,
  primitiveName,
} from "./atoms";

const HEIGHTS = ["26rem", "18rem", "22rem", "16rem", "24rem", "19rem"];

function GalleryFrame({
  index,
  brief,
  height,
  asset,
  annotate,
  alt,
}: {
  index: number;
  brief?: string;
  height?: string;
  asset?: ResolvedMediaAsset;
  /** Preview-only pencil marks (ADR-034). */
  annotate?: boolean;
  /** Names a JOB in evidence mode, a MATERIAL in illustrative mode. */
  alt: string;
}) {
  const angle = [160, 120, 195, 140, 175, 110][index % 6];
  const warm = index % 2 === 0;
  return (
    <figure
      className="group relative w-full overflow-hidden rounded-[var(--wr-radius-lg)] border"
      style={{
        borderColor: "var(--wr-line)",
        minHeight: height ?? "20rem",
        background: `linear-gradient(${angle}deg, ${
          warm
            ? "var(--wr-storm-1), var(--wr-storm-2)"
            : "color-mix(in oklab, var(--wr-storm-2) 80%, var(--wr-bg)), var(--wr-storm-1)"
        })`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 scale-105 transition-transform duration-1000 ease-out group-hover:scale-100 motion-reduce:transition-none"
        style={{
          background:
            "radial-gradient(110% 80% at 30% 15%, rgba(255, 240, 210, 0.22), transparent 60%)",
        }}
      />
      {asset && (
        <CinematicImage asset={asset} alt={alt} fit="inset" />
      )}
      {!asset && annotate && (
      <figcaption className="absolute inset-x-5 bottom-4 flex flex-col gap-1.5">
        <AnnotationTag>gallery {String(index + 1).padStart(2, "0")} · customer photo</AnnotationTag>
        {brief && (
          <span
            className="line-clamp-2 text-xs leading-relaxed"
            style={{ color: "var(--wr-ink-faint)" }}
          >
            {brief}
          </span>
        )}
      </figcaption>
      )}
    </figure>
  );
}

export function GalleryImmersiveGrid({
  section,
  variant,
  slots,
  blueprint,
  mediaAssets,
  mode,
}: PrimitiveSectionProps) {
  const annotate = mode === "preview";
  const brief = slots["gallery-direction"];
  const baseRef = section.media?.[0]?.generationRef ?? `media/${section.id}`;
  const frameAsset = (index: number) => mediaAssets?.[`${baseRef}.frame-${index + 1}`];
  const slider = variant === "full-bleed-slider";

  // ADR-060: the same law as the portfolio. Preview is the shot list; public
  // renders exactly the supplied frames and collapses when there are none.
  const isPublic = mode === "public";
  const frames = Array.from(
    { length: projectFrameCount(section.identifier, variant) },
    (_, index) => ({ index, asset: frameAsset(index) }),
  );
  const evidence = frames.filter((frame) => frame.asset);
  const isEvidence = evidence.length > 0;
  const voice = isEvidence
    ? evidenceVoice()
    : illustrativeVoice(
        blueprint.designSystem?.themeRef,
        blueprint.identity.trade,
      );
  const dressed = isEvidence
    ? evidence
    : frames.map((frame) => ({
        ...frame,
        // Showcase slots are 1-based, matching frame-N.
        asset: mediaAssets?.[showcaseSlot(baseRef, frame.index + 1)],
      }));
  const shown = isPublic ? dressed.filter((frame) => frame.asset) : dressed;
  if (isPublic && shown.length === 0) return null;

  return (
    <SectionShell section={section} className="overflow-hidden">
      <Container wide>
        <Reveal duration={0.9}>
          <Eyebrow>{isPublic ? voice.eyebrow : primitiveName(section)}</Eyebrow>
          <SectionTitle id={`${section.id}-title`}>{voice.title}</SectionTitle>
        </Reveal>
      </Container>

      {slider ? (
        <div className="relative mt-12">
          <div
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--wr-space-gutter)] pb-4"
            role="group"
            aria-label="Immersive gallery"
          >
            {shown.map((frame) => (
              <div key={frame.index} className="w-[min(88vw,60rem)] shrink-0 snap-center">
                <GalleryFrame index={frame.index} brief={brief} height="clamp(20rem, 55vw, 32rem)" asset={frame.asset} annotate={annotate} alt={voice.alt(frame.index)} />
              </div>
            ))}
          </div>
          {shown.length > 1 && (
            <Container wide>
              <p
                className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]"
                style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
              >
                <MoveHorizontal className="size-3.5" aria-hidden />
                drag to explore
              </p>
            </Container>
          )}
        </div>
      ) : (
        <Container wide>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((frame) => (
              <Parallax key={frame.index} distance={frame.index % 3 === 1 ? 28 : 14}>
                <GalleryFrame
                  index={frame.index}
                  brief={brief}
                  height={HEIGHTS[frame.index % HEIGHTS.length]}
                  asset={frame.asset}
                  annotate={annotate}
                  alt={voice.alt(frame.index)}
                />
              </Parallax>
            ))}
          </div>
        </Container>
      )}
    </SectionShell>
  );
}
