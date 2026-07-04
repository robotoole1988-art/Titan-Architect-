"use client";

/**
 * proof.portfolio-showcase — finished work as the argument (ADR-029).
 *
 * Art-directed project frames: composed golden atmospheres with explicit
 * media-brief annotations — never fake photography. Each frame is a slot for
 * a real project; the captions direction tells the founder exactly what to
 * shoot. Hover lifts a frame toward the light; scroll staggers the entrance.
 * Variants: "before-after-reveal" (the comparison leads), "cinematic-carousel"
 * (a scroll-snap strip), "filterable-grid" (filters activate with real data).
 */

import { MoveHorizontal } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import { Reveal, Stagger, StaggerItem } from "../motion/motion";
import { afterFirstDash } from "../model/slots";
import { CinematicImage } from "./cinematic-image";
import type { ResolvedMediaAsset } from "../model/types";
import { Comparison } from "./story-transformation-arc";
import {
  AnnotationTag,
  Container,
  Eyebrow,
  SectionShell,
  SectionTitle,
  monoFont,
  primitiveName,
} from "./atoms";

/** Deterministic per-frame atmosphere — light falling differently on each. */
function frameScene(index: number): string {
  const angles = [150, 115, 200, 165, 130, 185];
  const mixes = [
    ["var(--wr-storm-1)", "var(--wr-storm-2)"],
    ["color-mix(in oklab, var(--wr-storm-1) 75%, var(--wr-bg))", "var(--wr-storm-2)"],
    ["var(--wr-storm-2)", "color-mix(in oklab, var(--wr-storm-2) 60%, var(--wr-ink))"],
    ["color-mix(in oklab, var(--wr-storm-1) 85%, #ffffff)", "var(--wr-storm-1)"],
    ["var(--wr-storm-1)", "color-mix(in oklab, var(--wr-storm-2) 80%, var(--wr-bg))"],
    ["color-mix(in oklab, var(--wr-storm-2) 90%, var(--wr-ink))", "var(--wr-storm-1)"],
  ];
  const [from, to] = mixes[index % mixes.length];
  return `linear-gradient(${angles[index % angles.length]}deg, ${from}, ${to})`;
}

function ProjectFrame({
  index,
  caption,
  tall = false,
  asset,
  annotate,
}: {
  index: number;
  caption?: string;
  tall?: boolean;
  asset?: ResolvedMediaAsset;
  /** Preview-only pencil marks (ADR-034). */
  annotate?: boolean;
}) {
  return (
    <figure
      className="group relative overflow-hidden rounded-[var(--wr-radius-lg)] border transition-transform duration-500 ease-out hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{
        borderColor: "var(--wr-line)",
        background: frameScene(index),
        minHeight: tall ? "22rem" : "15rem",
        boxShadow: "0 18px 50px -24px color-mix(in oklab, var(--wr-ink) 45%, transparent)",
      }}
    >
      {asset && (
        <CinematicImage
          asset={asset}
          alt={`Completed project ${index + 1}`}
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
        />
      )}
      {/* light sweep on hover — the frame catches the sun */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-reduce:transition-none"
        style={{
          background:
            "linear-gradient(120deg, transparent 35%, rgba(255, 236, 200, 0.28) 50%, transparent 65%)",
        }}
      />
      {!asset && annotate && (
        <div aria-hidden className="absolute inset-3 rounded-[calc(var(--wr-radius-lg)-0.6rem)] border border-dashed"
          style={{ borderColor: "var(--wr-line-strong)" }}
        />
      )}
      {!asset && annotate && (
        <figcaption className="absolute inset-x-5 bottom-4 flex flex-col gap-1.5">
          <AnnotationTag>
            project {String(index + 1).padStart(2, "0")} · media slot
          </AnnotationTag>
          {caption && (
            <span
              className="line-clamp-2 text-xs leading-relaxed"
              style={{ color: "var(--wr-ink-faint)" }}
            >
              {caption}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

export function ProofPortfolioShowcase({
  section,
  variant,
  slots,
  mediaAssets,
  mode,
}: PrimitiveSectionProps) {
  const annotate = mode === "preview";
  const direction = slots["portfolio-direction"];
  const baseRef = section.media?.[0]?.generationRef ?? `media/${section.id}`;
  const frameAsset = (index: number) => mediaAssets?.[`${baseRef}.frame-${index + 1}`];
  const captionBrief = afterFirstDash(slots["captions-direction"]).trim();
  const carousel = variant === "cinematic-carousel";
  const beforeAfter = variant === "before-after-reveal";
  const frameCount = carousel ? 5 : 4;

  return (
    <SectionShell section={section} className="overflow-hidden">
      <Container wide>
        <Reveal duration={0.9}>
          <Eyebrow>{primitiveName(section)}</Eyebrow>
          <SectionTitle id={`${section.id}-title`}>
            The work speaks first
          </SectionTitle>
          {/* portfolio-direction is photography DIRECTION, not customer copy */}
          {direction && annotate && (
            <p
              className="mt-4 max-w-[var(--wr-measure)] leading-relaxed"
              style={{ color: "var(--wr-ink-muted)" }}
            >
              {direction}
            </p>
          )}
        </Reveal>

        {beforeAfter && (
          <div className="mt-12">
            <Comparison
              mediaDirection={
                mediaAssets?.[`${baseRef}.pair-before`] ? undefined : captionBrief || undefined
              }
              beforeAsset={mediaAssets?.[`${baseRef}.pair-before`]}
              afterAsset={mediaAssets?.[`${baseRef}.pair-after`]}
              mode={mode}
            />
          </div>
        )}

        {carousel ? (
          <div className="relative mt-12">
            <div
              className="-mx-[var(--wr-space-gutter)] flex snap-x snap-mandatory gap-6 overflow-x-auto px-[var(--wr-space-gutter)] pb-4"
              role="group"
              aria-label="Project showcase"
            >
              {Array.from({ length: frameCount }, (_, index) => (
                <div key={index} className="w-[min(78vw,34rem)] shrink-0 snap-center">
                  <ProjectFrame index={index} caption={captionBrief} tall asset={frameAsset(index)} annotate={annotate} />
                </div>
              ))}
            </div>
            <p
              className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]"
              style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
            >
              <MoveHorizontal className="size-3.5" aria-hidden />
              drag to explore
            </p>
          </div>
        ) : (
          <Stagger
            className={`mt-12 grid gap-6 sm:grid-cols-2 ${beforeAfter ? "lg:grid-cols-3" : ""}`}
            gap={0.12}
          >
            {Array.from(
              { length: beforeAfter ? 3 : frameCount },
              (_, index) => (
                <StaggerItem key={index}>
                  <ProjectFrame
                    index={beforeAfter ? index + 1 : index}
                    caption={captionBrief}
                    tall={!beforeAfter && index % 3 === 0}
                    asset={frameAsset(index)}
                    annotate={annotate}
                  />
                </StaggerItem>
              ),
            )}
          </Stagger>
        )}

        {variant === "filterable-grid" && annotate && (
          <Reveal delay={0.15}>
            <div className="mt-6">
              <AnnotationTag>
                filters activate with real portfolio data — never staged
              </AnnotationTag>
            </div>
          </Reveal>
        )}
      </Container>
    </SectionShell>
  );
}
