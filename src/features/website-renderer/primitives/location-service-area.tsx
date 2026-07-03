"use client";

/**
 * location.service-area — coverage as a calm radar, not a generic map embed.
 *
 * A slow scanning sweep over concentric range rings grounds the business in
 * its place; local search terms orbit as coverage chips. No map tiles, no
 * network requests — art direction from geometry (media discipline, ADR-022).
 * Variants: "map-focus" (radar leads) / "area-list" (chips lead).
 */

import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { PrimitiveSectionProps } from "../model/types";
import { Reveal, Stagger, StaggerItem } from "../motion/motion";
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

function headingOf(coverage: string | undefined): string {
  if (!coverage) return "";
  return coverage.split("—")[0].trim().replace(/\.$/, "");
}

function areaTerms(coverage: string | undefined): string[] {
  if (!coverage) return [];
  const afterColon = coverage.split(":").slice(1).join(":");
  return afterColon
    .split(",")
    .map((term) => term.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

function Radar({ place }: { place?: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden>
      {/* range rings */}
      {[1, 0.72, 0.44].map((scale) => (
        <div
          key={scale}
          className="absolute rounded-full border"
          style={{
            inset: `${((1 - scale) / 2) * 100}%`,
            borderColor: "var(--wr-line)",
          }}
        />
      ))}
      {/* scanning sweep */}
      {!reduced && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, var(--wr-accent-glow), transparent 70deg, transparent 360deg)",
            maskImage: "radial-gradient(circle, black 99%, transparent 100%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
      )}
      {/* faint cross-hairs */}
      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: "var(--wr-line)" }} />
      <div className="absolute inset-y-0 left-1/2 w-px" style={{ background: "var(--wr-line)" }} />
      {/* the beacon: home */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="relative flex size-3">
            <span
              className="absolute inline-flex size-full animate-ping rounded-full opacity-50 motion-reduce:animate-none"
              style={{ background: "var(--wr-accent)" }}
            />
            <span className="relative inline-flex size-3 rounded-full" style={{ background: "var(--wr-accent)" }} />
          </span>
          {place && (
            <span
              className="rounded-full border px-3 py-1 text-sm font-semibold backdrop-blur-sm"
              style={{
                ...displayFont,
                borderColor: "var(--wr-line-strong)",
                background: "color-mix(in oklab, var(--wr-bg) 70%, transparent)",
              }}
            >
              {place}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function LocationServiceArea({ section, variant, slots, blueprint }: PrimitiveSectionProps) {
  const heading = headingOf(slots.coverage);
  const terms = areaTerms(slots.coverage);
  const radarFirst = variant !== "area-list";

  return (
    <SectionShell section={section}>
      <Container wide>
        <div className={`grid items-center gap-12 lg:grid-cols-2 ${radarFirst ? "" : "lg:[direction:rtl]"}`}>
          <Reveal className="lg:[direction:ltr]">
            <Radar place={blueprint.identity.location} />
          </Reveal>
          <div className="lg:[direction:ltr]">
            <Reveal>
              <Eyebrow>{primitiveName(section)}</Eyebrow>
              <SectionTitle id={`${section.id}-title`}>
                <MapPin
                  aria-hidden
                  className="mb-1 mr-2 inline-block size-[0.7em]"
                  style={{ color: "var(--wr-accent)" }}
                />
                {heading}
              </SectionTitle>
            </Reveal>
            {terms.length > 0 && (
              <Stagger className="mt-8 flex flex-wrap gap-2" gap={0.06}>
                {terms.map((term) => (
                  <StaggerItem key={term}>
                    <CopyChip>{term}</CopyChip>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
            {slots["response-notes"] && (
              <Reveal delay={0.1}>
                <div className="mt-8 flex flex-col gap-2">
                  <AnnotationTag>response note</AnnotationTag>
                  <p className="max-w-[var(--wr-measure)] text-sm leading-relaxed" style={{ color: "var(--wr-ink-muted)" }}>
                    {slots["response-notes"]}
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </Container>
    </SectionShell>
  );
}
