/**
 * Shared presentational atoms for rendered primitives.
 *
 * Copy rules (ADR-022): brand and marketing copy comes ONLY from blueprint
 * content slots. Structural eyebrows use the registry primitive's name (data
 * from the blueprint ecosystem, not renderer copy). Interaction affordances
 * (form labels, drag hints) are interface furniture, kept minimal and neutral.
 * Anything awaiting real content (photography, reviews, FAQ answers) renders
 * as an art-directed, explicitly annotated slot — never faked.
 */

import type { CSSProperties, ReactNode } from "react";
import {
  SECTION_PRIMITIVE_REGISTRY,
  getSectionPrimitive,
  type MediaBlueprint,
  type SectionBlueprint,
} from "@/core/website-blueprint";
import { sectionVariant } from "../model/slots";

/**
 * Structural eyebrow text = the registry primitive's human name. Data from the
 * blueprint ecosystem, never copy invented by the renderer.
 */
export function primitiveName(section: SectionBlueprint): string {
  return (
    getSectionPrimitive(SECTION_PRIMITIVE_REGISTRY, section.identifier)?.name ??
    section.identifier
  );
}

const displayFont: CSSProperties = {
  fontFamily: "var(--wr-font-display, inherit)",
};
const monoFont: CSSProperties = {
  fontFamily: "var(--wr-font-mono, ui-monospace, monospace)",
};

/** Semantic shell every primitive renders inside. */
export function SectionShell({
  section,
  children,
  className = "",
  flush = false,
  defer = true,
}: {
  section: SectionBlueprint;
  children: ReactNode;
  className?: string;
  /** Skip the default vertical rhythm (bands, heroes). */
  flush?: boolean;
  /**
   * Below-the-fold sections skip offscreen layout/paint entirely
   * (content-visibility) so the hero paints sooner. Sections with
   * fixed-position children (sticky bars) must opt out — paint containment
   * would trap them.
   */
  defer?: boolean;
}) {
  return (
    <section
      data-primitive={section.identifier}
      data-variant={sectionVariant(section)}
      aria-labelledby={`${section.id}-title`}
      className={`relative ${className}`}
      style={{
        ...(flush ? {} : { paddingBlock: "var(--wr-space-section)" }),
        ...(defer
          ? { contentVisibility: "auto", containIntrinsicSize: "auto 720px" }
          : {}),
      }}
    >
      {children}
    </section>
  );
}

/** Centred content column. */
export function Container({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto w-full ${className}`}
      style={{
        maxWidth: wide ? "76rem" : "68rem",
        paddingInline: "var(--wr-space-gutter)",
      }}
    >
      {children}
    </div>
  );
}

/** Mono, uppercase, accent-ticked structural label. */
export function Eyebrow({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p
      id={id}
      className="mb-4 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.28em]"
      style={{ ...monoFont, color: "var(--wr-ink-faint)" }}
    >
      <span
        aria-hidden
        className="inline-block h-px w-8"
        style={{ background: "var(--wr-accent)" }}
      />
      {children}
    </p>
  );
}

/** The section heading (h2 everywhere except the hero's h1). */
export function SectionTitle({
  children,
  id,
  as: As = "h2",
  size = "var(--wr-text-3xl)",
}: {
  children: ReactNode;
  id: string;
  as?: "h1" | "h2";
  size?: string;
}) {
  return (
    <As
      id={id}
      className="max-w-[24ch] text-balance font-semibold"
      style={{ ...displayFont, fontSize: size, lineHeight: 1.05, letterSpacing: "-0.02em" }}
    >
      {children}
    </As>
  );
}

/** A tiny mono annotation chip — the architect's pencil mark. */
export function AnnotationTag({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-dashed px-2 py-1 text-[10px] uppercase tracking-[0.14em]"
      style={{
        ...monoFont,
        borderColor: "var(--wr-line-strong)",
        color: "var(--wr-ink-faint)",
      }}
    >
      {children}
    </span>
  );
}

/** A neutral content chip (real copy from slots). */
export function CopyChip({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1.5 text-sm"
      style={{
        borderColor: "var(--wr-line)",
        background: "var(--wr-surface)",
        color: "var(--wr-ink-muted)",
      }}
    >
      {children}
    </span>
  );
}

/**
 * An art-directed media slot: atmosphere from composition, an explicit brief
 * annotation from the blueprint's media aspect. Never fake imagery (ADR-022).
 */
export function MediaSlotFrame({
  media,
  label,
  scene = "linear-gradient(150deg, var(--wr-storm-1), var(--wr-storm-2) 55%, var(--wr-bg))",
  className = "",
  minHeight = "16rem",
}: {
  media?: MediaBlueprint;
  label: string;
  scene?: string;
  className?: string;
  minHeight?: string;
}) {
  return (
    <figure
      className={`relative overflow-hidden rounded-[var(--wr-radius-lg)] border ${className}`}
      style={{ borderColor: "var(--wr-line)", background: scene, minHeight }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 0%, rgba(255,255,255,0.06), transparent 55%)",
        }}
      />
      <div aria-hidden className="absolute inset-3 rounded-[calc(var(--wr-radius-lg)-0.6rem)] border border-dashed"
        style={{ borderColor: "var(--wr-line-strong)" }}
      />
      <figcaption className="absolute inset-x-5 bottom-4 flex flex-col gap-1.5">
        <AnnotationTag>
          {label}
          {media ? ` · ${media.kind}` : ""}
        </AnnotationTag>
        {media?.direction && (
          <span
            className="line-clamp-2 text-xs leading-relaxed"
            style={{ color: "var(--wr-ink-faint)" }}
          >
            {media.direction}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

/** The one high-visibility action. Amber signal, dark ink, generous target. */
export function SignalCTA({
  href,
  children,
  size = "lg",
}: {
  href: string;
  children: ReactNode;
  size?: "lg" | "md" | "sm";
}) {
  const padding =
    size === "lg" ? "1.05rem 2.1rem" : size === "md" ? "0.8rem 1.6rem" : "0.55rem 1.1rem";
  const fontSize = size === "lg" ? "1.05rem" : size === "md" ? "0.95rem" : "0.85rem";
  return (
    <a
      href={href}
      className="relative inline-flex items-center justify-center gap-2.5 rounded-full font-semibold transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{
        ...displayFont,
        padding,
        fontSize,
        background:
          "linear-gradient(180deg, var(--wr-accent), var(--wr-accent-strong))",
        color: "var(--wr-accent-ink)",
        boxShadow: "0 12px 40px -8px var(--wr-accent-glow)",
        outlineColor: "var(--wr-accent)",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </a>
  );
}

/** Quiet secondary action. */
export function GhostCTA({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{
        borderColor: "var(--wr-line-strong)",
        color: "var(--wr-ink-muted)",
        outlineColor: "var(--wr-accent)",
      }}
    >
      {children}
    </a>
  );
}

export { displayFont, monoFont };
