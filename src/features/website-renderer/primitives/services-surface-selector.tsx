"use client";

/**
 * The SURFACE SELECTOR (ADR-029) — services.interactive-explorer, "tabbed".
 *
 * The founder's driveways vision: visitors explore surfaces and materials
 * (block paving, resin, tarmac…) the way they'd walk a showroom. Each surface
 * gets texture-SUGGESTIVE styling — CSS pattern work tinted by the theme,
 * never fake photography — an explainer drawn from the content slots, and a
 * pricing-guide CTA hook. Fully keyboard-operable tabs.
 */

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CinematicImage } from "./cinematic-image";
import type { ResolvedMediaAsset } from "../model/types";
import { Reveal } from "../motion/motion";
import {
  AnnotationTag,
  Container,
  Eyebrow,
  SectionTitle,
  displayFont,
  monoFont,
} from "./atoms";

/** Texture-suggestive CSS per surface position — patterns, not photos. */
function textureFor(index: number): string {
  const patterns = [
    // coursed blocks
    `repeating-linear-gradient(0deg, transparent 0 26px, var(--wr-line-strong) 26px 27px),
     repeating-linear-gradient(90deg, transparent 0 44px, var(--wr-line) 44px 45px),
     linear-gradient(155deg, var(--wr-storm-1), var(--wr-storm-2))`,
    // resin speckle
    `radial-gradient(circle at 20% 30%, var(--wr-line-strong) 0 1px, transparent 1.5px),
     radial-gradient(circle at 70% 60%, var(--wr-line-strong) 0 1px, transparent 1.5px),
     radial-gradient(circle at 45% 80%, var(--wr-line) 0 1px, transparent 1.5px),
     linear-gradient(140deg, var(--wr-storm-1), color-mix(in oklab, var(--wr-storm-2) 85%, var(--wr-bg)))`,
    // rolled surface
    `repeating-linear-gradient(105deg, transparent 0 3px, color-mix(in oklab, var(--wr-ink) 10%, transparent) 3px 4px),
     linear-gradient(160deg, color-mix(in oklab, var(--wr-storm-2) 70%, var(--wr-ink)), var(--wr-storm-2))`,
    // flags / large format
    `repeating-linear-gradient(0deg, transparent 0 64px, var(--wr-line-strong) 64px 65px),
     repeating-linear-gradient(90deg, transparent 0 88px, var(--wr-line-strong) 88px 89px),
     linear-gradient(150deg, var(--wr-storm-1), var(--wr-storm-2))`,
    // loose aggregate
    `radial-gradient(circle at 30% 40%, var(--wr-line-strong) 0 1.5px, transparent 2.5px),
     radial-gradient(circle at 80% 20%, var(--wr-line) 0 1.5px, transparent 2.5px),
     radial-gradient(circle at 60% 75%, var(--wr-line-strong) 0 1.5px, transparent 2.5px),
     linear-gradient(170deg, var(--wr-storm-1), var(--wr-storm-2))`,
  ];
  return patterns[index % patterns.length];
}

const BG_SIZES = [
  "auto, auto, auto",
  "34px 34px, 46px 46px, 28px 28px, auto",
  "auto, auto",
  "auto, auto, auto",
  "40px 40px, 52px 52px, 33px 33px, auto",
];

function surfaceSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function SurfaceSelector({
  sectionId,
  heading,
  surfaces,
  explainers,
  mediaAssets,
}: {
  sectionId: string;
  heading: string;
  surfaces: string[];
  explainers: string[];
  mediaAssets?: Readonly<Record<string, ResolvedMediaAsset>>;
}) {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const baseId = useId();
  const surface = surfaces[active];

  return (
    <Container wide>
      <Reveal duration={0.9}>
        <Eyebrow>Choose your surface</Eyebrow>
        <SectionTitle id={`${sectionId}-title`}>{heading}</SectionTitle>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(14rem,4fr)_8fr]">
        {/* surface tabs */}
        <div role="tablist" aria-label="Surfaces" className="flex flex-col gap-1.5">
          {surfaces.map((name, index) => {
            const selected = index === active;
            return (
              <button
                key={name}
                type="button"
                role="tab"
                id={`${baseId}-tab-${index}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                onClick={() => setActive(index)}
                className="group flex items-center justify-between gap-4 rounded-[var(--wr-radius)] border px-5 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderColor: selected ? "var(--wr-accent)" : "var(--wr-line)",
                  background: selected ? "var(--wr-surface-raised)" : "transparent",
                  outlineColor: "var(--wr-accent)",
                }}
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="text-xs"
                    style={{ ...monoFont, color: selected ? "var(--wr-accent)" : "var(--wr-ink-faint)" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="font-semibold capitalize"
                    style={{
                      ...displayFont,
                      fontSize: "var(--wr-text-base)",
                      color: selected ? "var(--wr-ink)" : "var(--wr-ink-muted)",
                    }}
                  >
                    {name}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  style={{ color: selected ? "var(--wr-accent)" : "var(--wr-ink-faint)" }}
                />
              </button>
            );
          })}
        </div>

        {/* the selected surface, felt */}
        <div
          id={`${baseId}-panel`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active}`}
          className="relative min-h-[24rem] overflow-hidden rounded-[var(--wr-radius-lg)] border"
          style={{ borderColor: "var(--wr-line)" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.15 : 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
              style={{
                background: textureFor(active),
                backgroundSize: BG_SIZES[active % BG_SIZES.length],
              }}
            >
              {mediaAssets?.[`surfaces/${surfaceSlug(surface)}`] && (
                // The REAL material — texture photography over the suggestion.
                <CinematicImage
                  asset={mediaAssets[`surfaces/${surfaceSlug(surface)}`]}
                  alt={`${surface} surface texture`}
                  className="absolute inset-0"
                />
              )}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 30%, color-mix(in oklab, var(--wr-ink) 55%, transparent))",
                }}
              />
              <div className="absolute inset-x-6 bottom-6 flex flex-col items-start gap-3">
                {!mediaAssets?.[`surfaces/${surfaceSlug(surface)}`] && (
                  <AnnotationTag>surface texture · suggestive, real media slot</AnnotationTag>
                )}
                <h3
                  className="text-balance font-semibold capitalize"
                  style={{ ...displayFont, fontSize: "var(--wr-text-xl)", color: "#fdf6ec" }}
                >
                  {surface}
                </h3>
                {explainers[active % Math.max(explainers.length, 1)] && (
                  <p
                    className="max-w-md text-sm leading-relaxed"
                    style={{ color: "rgba(253, 246, 236, 0.82)" }}
                  >
                    {explainers[active % explainers.length]}
                  </p>
                )}
                <a
                  href="#callback"
                  className="mt-1 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none motion-reduce:hover:scale-100"
                  style={{
                    ...displayFont,
                    background: "linear-gradient(180deg, var(--wr-accent), var(--wr-accent-strong))",
                    color: "var(--wr-accent-ink)",
                    boxShadow: "0 10px 32px -8px var(--wr-accent-glow)",
                    outlineColor: "var(--wr-accent)",
                  }}
                >
                  Get the {surface} pricing guide
                  <ArrowRight className="size-4" aria-hidden />
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Container>
  );
}
