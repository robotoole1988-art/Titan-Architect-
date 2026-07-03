/**
 * The labelled premium placeholder (ADR-022). Every registry primitive whose
 * crafted component has not landed yet renders through this — a coherent,
 * art-directed section that presents the blueprint's direction honestly and
 * says so. Nothing here pretends to be finished work: the annotation names the
 * primitive and states that its crafted component is in production.
 */

import {
  SECTION_PRIMITIVE_REGISTRY,
  getSectionPrimitive,
} from "@/core/website-blueprint";
import type { PrimitiveSectionProps } from "../model/types";
import {
  AnnotationTag,
  Container,
  Eyebrow,
  SectionShell,
  SectionTitle,
  monoFont,
} from "./atoms";

export function PremiumSectionPlaceholder({
  section,
  variant,
  slots,
}: PrimitiveSectionProps) {
  const primitive = getSectionPrimitive(
    SECTION_PRIMITIVE_REGISTRY,
    section.identifier,
  );
  const entries = Object.entries(slots);

  return (
    <SectionShell section={section}>
      <div data-placeholder={section.identifier} className="contents">
        <Container>
          <Eyebrow id={`${section.id}-title`}>
            {primitive?.name ?? section.identifier}
          </Eyebrow>
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <AnnotationTag>
              Crafted component in production · {section.identifier}
              {variant ? ` · ${variant}` : ""}
            </AnnotationTag>
          </div>
          {primitive?.description && (
            <SectionTitle
              id={`${section.id}-heading`}
              // A placeholder hero still owns the page's single h1.
              as={section.identifier.startsWith("hero.") ? "h1" : "h2"}
              size="var(--wr-text-2xl)"
            >
              {primitive.description}
            </SectionTitle>
          )}
          {entries.length > 0 && (
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {entries.map(([slot, direction]) => (
                <div
                  key={slot}
                  className="rounded-[var(--wr-radius-lg)] border border-dashed p-5"
                  style={{
                    borderColor: "var(--wr-line-strong)",
                    background: "var(--wr-surface)",
                  }}
                >
                  <dt
                    className="mb-2 text-[10px] uppercase tracking-[0.2em]"
                    style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
                  >
                    {slot}
                  </dt>
                  <dd
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--wr-ink-muted)" }}
                  >
                    {direction}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Container>
      </div>
    </SectionShell>
  );
}
