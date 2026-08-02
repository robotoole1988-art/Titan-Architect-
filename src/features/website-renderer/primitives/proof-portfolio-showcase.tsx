/**
 * proof.portfolio-showcase — finished work as the argument (ADR-029).
 *
 * Art-directed project frames: composed golden atmospheres with explicit
 * media-brief annotations — never fake photography. Each frame is a slot for
 * a real project; the captions direction tells the founder exactly what to
 * shoot. Hover lifts a frame toward the light; scroll staggers the entrance.
 *
 * The section has TWO VOICES (ADR-060). With the customer's own photographs
 * it is EVIDENCE — "Our recent work", their jobs, their captions. Without
 * them it is ILLUSTRATIVE — the same layout dressed in generated imagery of
 * the trade's materials and finish, under a heading that claims a standard
 * rather than a job. Only the first voice asserts provenance, so only the
 * first requires real photographs.
 *
 * Variants: "before-after-reveal" (the comparison leads), "cinematic-carousel"
 * (a scroll-snap strip), "filterable-grid" (filters activate with real data).
 */

import { MoveHorizontal } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import { Reveal, Stagger, StaggerItem } from "../motion/motion";
import { projectFrameCount, showcaseSlot } from "@/core/media/sourcing";
import { evidenceVoice, illustrativeVoice } from "../model/showcase-copy";
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
  alt,
}: {
  index: number;
  caption?: string;
  tall?: boolean;
  asset?: ResolvedMediaAsset;
  /** Preview-only pencil marks (ADR-034). */
  annotate?: boolean;
  /** Names a JOB in evidence mode, a MATERIAL in illustrative mode. */
  alt: string;
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
          alt={alt}
          fit="inset"
          className="transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transition-none"
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
            project {String(index + 1).padStart(2, "0")} · customer photo
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
  blueprint,
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
  const pairBefore = mediaAssets?.[`${baseRef}.pair-before`];
  const pairAfter = mediaAssets?.[`${baseRef}.pair-after`];
  const hasPair = Boolean(pairBefore && pairAfter);

  // TWO VOICES (ADR-060).
  //
  // EVIDENCE MODE the moment the business supplies its own photographs of
  // finished jobs: "Our recent work", their frames, alt text that names a
  // job. ILLUSTRATIVE MODE otherwise: the identical layout dressed with
  // generated imagery of the trade's materials and finish, under a heading
  // that claims a STANDARD rather than a job, with alt text that names a
  // material. Nothing about the pixels changes — only what the page says
  // about them, which is the whole of the legal difference.
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
  // Preview keeps every frame as a shot list; public shows only what exists,
  // because a public page of empty coloured boxes is the ADR-034 defect
  // whichever voice it is speaking in.
  const shown = isPublic ? dressed.filter((frame) => frame.asset) : dressed;

  // The before/after pair is EVIDENCE with no illustrative substitute — a
  // comparison is structurally a claim about one property — so it waits.
  const showComparison = beforeAfter && (hasPair || !isPublic);
  if (isPublic && shown.length === 0 && !showComparison) return null;

  return (
    <SectionShell section={section} className="overflow-hidden">
      <Container wide>
        <Reveal duration={0.9}>
          <Eyebrow>{isPublic ? voice.eyebrow : primitiveName(section)}</Eyebrow>
          <SectionTitle id={`${section.id}-title`}>{voice.title}</SectionTitle>
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

        {showComparison && (
          <div className="mt-12">
            <Comparison
              mediaDirection={pairBefore ? undefined : captionBrief || undefined}
              beforeAsset={pairBefore}
              afterAsset={pairAfter}
              mode={mode}
            />
          </div>
        )}

        {shown.length > 0 &&
          (carousel ? (
            <div className="relative mt-12">
              <div
                className="-mx-[var(--wr-space-gutter)] flex snap-x snap-mandatory gap-6 overflow-x-auto px-[var(--wr-space-gutter)] pb-4"
                role="group"
                aria-label="Project showcase"
              >
                {shown.map((frame) => (
                  <div key={frame.index} className="w-[min(78vw,34rem)] shrink-0 snap-center">
                    <ProjectFrame index={frame.index} caption={captionBrief} tall asset={frame.asset} annotate={annotate} alt={voice.alt(frame.index)} />
                  </div>
                ))}
              </div>
              {shown.length > 1 && (
                <p
                  className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]"
                  style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
                >
                  <MoveHorizontal className="size-3.5" aria-hidden />
                  drag to explore
                </p>
              )}
            </div>
          ) : (
            <Stagger
              className={`mt-12 grid gap-6 sm:grid-cols-2 ${beforeAfter ? "lg:grid-cols-3" : ""}`}
              gap={0.12}
            >
              {shown.map((frame) => (
                <StaggerItem key={frame.index}>
                  <ProjectFrame
                    index={frame.index}
                    caption={captionBrief}
                    tall={!beforeAfter && frame.index % 3 === 0}
                    asset={frame.asset}
                    annotate={annotate}
                    alt={voice.alt(frame.index)}
                  />
                </StaggerItem>
              ))}
            </Stagger>
          ))}

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
