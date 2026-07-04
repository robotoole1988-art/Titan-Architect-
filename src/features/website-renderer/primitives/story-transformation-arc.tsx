"use client";

/**
 * story.transformation-arc — the before/after, felt.
 *
 * A scroll-driven reveal: the comparison begins to wipe as it enters view,
 * then hands control to the visitor through a draggable divider. The handle is
 * a real <input type="range"> — draggable by pointer AND fully keyboard
 * operable. Scenes are art-directed atmospheres with explicit media-slot
 * annotations (no fake photography — ADR-022). Variants: "scroll-narrative" /
 * "chaptered".
 */

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { MoveHorizontal } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import { Reveal, Stagger, StaggerItem } from "../motion/motion";
import { CinematicImage } from "./cinematic-image";
import type { ResolvedMediaAsset } from "../model/types";
import { splitArc, splitList } from "../model/slots";
import {
  AnnotationTag,
  Container,
  CopyChip,
  Eyebrow,
  SectionShell,
  SectionTitle,
  monoFont,
  primitiveName,
} from "./atoms";

// Theme-aware scenes (ADR-029): BEFORE is the tired, desaturated ground;
// AFTER carries the theme's scene tones (storm blues on emergency, golden
// stone on premium) — the mood changes with the archetype, mechanics don't.
const BEFORE_SCENE =
  "linear-gradient(155deg, color-mix(in oklab, var(--wr-ink) 20%, var(--wr-bg)) 0%, color-mix(in oklab, var(--wr-ink) 32%, var(--wr-bg)) 55%, var(--wr-bg) 100%)";
const AFTER_SCENE =
  "linear-gradient(155deg, var(--wr-storm-1) 0%, var(--wr-storm-2) 55%, color-mix(in oklab, var(--wr-storm-2) 70%, var(--wr-bg)) 100%)";

export function Comparison({
  mediaDirection,
  beforeAsset,
  afterAsset,
}: {
  mediaDirection?: string;
  beforeAsset?: ResolvedMediaAsset;
  afterAsset?: ResolvedMediaAsset;
}) {
  const [value, setValue] = useState(18);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-25%" });
  const reduced = useReducedMotion();
  const settled = reduced ? 50 : 55;

  // Until first seen, hold the intro position; once in view, animate the wipe
  // open, then the input value takes over on interaction.
  const [interacted, setInteracted] = useState(false);
  const position = interacted ? value : inView ? settled : 18;

  return (
    <div ref={containerRef} className="relative">
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--wr-radius-lg)] border sm:aspect-[21/10]"
        style={{ borderColor: "var(--wr-line)" }}
      >
        {/* AFTER — the restored state, underneath */}
        <div className="absolute inset-0" style={{ background: AFTER_SCENE }}>
          {afterAsset && (
            <CinematicImage asset={afterAsset} alt="After the work — the finished result" className="absolute inset-0" />
          )}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(90% 70% at 75% 20%, var(--wr-accent-glow), transparent 60%)",
            }}
          />
          {!afterAsset && (
            <div className="absolute bottom-4 right-5">
              <AnnotationTag>after · media slot</AnnotationTag>
            </div>
          )}
        </div>

        {/* BEFORE — clipped by the divider */}
        <motion.div
          className="absolute inset-0"
          style={{ background: BEFORE_SCENE }}
          animate={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          transition={
            interacted
              ? { duration: 0 }
              : { duration: reduced ? 0 : 1.6, ease: [0.16, 1, 0.3, 1] }
          }
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 60% at 25% 30%, color-mix(in oklab, var(--wr-ink) 14%, transparent), transparent 60%)",
            }}
          />
          {beforeAsset && (
            <CinematicImage asset={beforeAsset} alt="Before the work" className="absolute inset-0" />
          )}
          {!beforeAsset && (
            <div className="absolute bottom-4 left-5">
              <AnnotationTag>before · media slot</AnnotationTag>
            </div>
          )}
        </motion.div>

        {/* divider + handle */}
        <motion.div
          aria-hidden
          className="absolute inset-y-0 w-px"
          style={{ background: "var(--wr-accent)", left: 0 }}
          animate={{ left: `${position}%` }}
          transition={
            interacted
              ? { duration: 0 }
              : { duration: reduced ? 0 : 1.6, ease: [0.16, 1, 0.3, 1] }
          }
        >
          <span
            className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md"
            style={{
              borderColor: "var(--wr-accent)",
              background: "color-mix(in oklab, var(--wr-bg) 55%, transparent)",
              color: "var(--wr-accent)",
              boxShadow: "0 8px 30px -6px var(--wr-accent-glow)",
            }}
          >
            <MoveHorizontal className="size-5" />
          </span>
        </motion.div>

        {/* the real control: pointer-draggable, keyboard-operable */}
        <input
          type="range"
          min={0}
          max={100}
          value={interacted ? value : position}
          aria-label="Compare before and after"
          onChange={(event) => {
            setInteracted(true);
            setValue(Number(event.target.value));
          }}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>

      {mediaDirection && (
        <p className="mt-3 text-[11px] leading-relaxed" style={{ ...monoFont, color: "var(--wr-ink-faint)" }}>
          {mediaDirection}
        </p>
      )}
    </div>
  );
}

export function StoryTransformationArc({ section, slots, mediaAssets }: PrimitiveSectionProps) {
  const stages = splitArc(slots["narrative-arc"]);
  const milestones = splitList(slots["key-messages"]);
  const media = section.media?.[0];
  const baseRef = media?.generationRef ?? `media/${section.id}`;
  const beforeAsset = mediaAssets?.[`${baseRef}.before`];
  const afterAsset = mediaAssets?.[`${baseRef}.after`];

  return (
    <SectionShell section={section}>
      <Container wide>
        <Reveal>
          <Eyebrow>{primitiveName(section)}</Eyebrow>
          <SectionTitle id={`${section.id}-title`}>
            {stages[0] ?? milestones[0] ?? ""}
          </SectionTitle>
        </Reveal>

        <div className="mt-12">
          <Comparison
            mediaDirection={beforeAsset ? undefined : media?.direction}
            beforeAsset={beforeAsset}
            afterAsset={afterAsset}
          />
        </div>

        {stages.length > 1 && (
          <Stagger className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" gap={0.07}>
            {stages.map((stage, index) => (
              <StaggerItem key={stage}>
                <div
                  className="flex h-full flex-col gap-2 rounded-[var(--wr-radius)] border p-5"
                  style={{ borderColor: "var(--wr-line)", background: "var(--wr-surface)" }}
                >
                  <span className="text-xs" style={{ ...monoFont, color: "var(--wr-accent)" }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed" style={{ color: "var(--wr-ink-muted)" }}>
                    {stage}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {milestones.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap gap-2">
              {milestones.map((milestone) => (
                <CopyChip key={milestone}>{milestone}</CopyChip>
              ))}
            </div>
          </Reveal>
        )}
      </Container>
    </SectionShell>
  );
}
