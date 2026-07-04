/**
 * hero.cinematic-reveal — the golden-hour opening (ADR-029).
 *
 * Aspiration, not urgency: a warm, editorial reveal that lands the
 * positioning in one held breath. Atmosphere is composed light — a generated
 * golden-hour poster, a sun-glow radial, one long shadow — never fake
 * photography. Variants: "full-bleed" (the statement), "split-editorial"
 * (copy beside a tall art-directed frame), "video-backdrop" (an explicitly
 * annotated motion slot until the media pipeline exists).
 *
 * A SERVER component animated with pure CSS: this hero is the LCP — it must
 * paint before any JavaScript arrives. Entrances are slower than the
 * emergency hero's (premium motion language); reduced motion is honoured via
 * media query.
 */

import { ArrowDown } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { createElement } from "react";
import { CinematicImage } from "./cinematic-image";
import { resolveSignatureMoment } from "../moments/registry";
import type { PrimitiveSectionProps } from "../model/types";
import {
  AnnotationTag,
  Container,
  MediaSlotFrame,
  SectionShell,
  SectionTitle,
  SignalCTA,
  displayFont,
  monoFont,
} from "./atoms";

const HERO_CSS = `
@keyframes wr-gh-bloom {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(1.06); }
}
@keyframes wr-gh-rule {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes wr-gh-shimmer {
  0%, 100% { opacity: 0.10; }
  50% { opacity: 0.22; }
}
.wr-gh-bloom { animation: wr-gh-bloom 14s ease-in-out infinite; }
.wr-gh-rule { animation: wr-gh-rule 1.1s 0.55s cubic-bezier(0.16,1,0.3,1) both; transform-origin: left; }
.wr-gh-shimmer { animation: wr-gh-shimmer 9s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .wr-gh-bloom, .wr-gh-shimmer { animation: none; }
  .wr-gh-rule { animation: none; transform: scaleX(1); }
}
`;

/** Slow CSS entrance (premium tempo) that never gates first paint. */
function CssSettle({
  children,
  delay = 0,
  className,
  fade = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** The LCP headline settles WITHOUT fading so it paints on frame one. */
  fade?: boolean;
}) {
  return (
    <div
      className={`duration-1000 ease-out animate-in slide-in-from-bottom-5 motion-reduce:animate-none ${fade ? "fade-in-0" : ""} ${className ?? ""}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" } as CSSProperties}
    >
      {children}
    </div>
  );
}

function GoldenAtmosphere({ dim = false }: { dim?: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* golden-hour ground — a generated, checked-in poster (composed
          gradients + ordered dither, never fake photography). A real <img>
          so the largest paint is a tiny cacheable image, not font-gated
          text (the Renderer v1 LCP lesson). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size
          generated poster; next/image adds nothing here */}
      <img
        src="/renderer/golden-poster.png"
        alt=""
        width={416}
        height={260}
        fetchPriority="high"
        loading="eager"
        decoding="sync"
        className="absolute inset-0 h-full w-full object-cover"
        style={dim ? { opacity: 0.55 } : undefined}
      />
      {/* sun bloom — a slow breath of light (radial, never filter:blur) */}
      <div
        className="wr-gh-bloom absolute right-[8%] top-[30%] h-[55%] w-[45%] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255, 214, 140, 0.5) 8%, rgba(255, 200, 120, 0.16) 48%, transparent 75%)",
        }}
      />
      {/* one long evening shadow, anchoring the composition */}
      <div
        className="absolute inset-y-0 left-0 w-[52%]"
        style={{
          background:
            "linear-gradient(100deg, rgba(36, 31, 24, 0.34), rgba(36,31,24,0.08) 55%, transparent 80%)",
        }}
      />
      {/* settle into the page ground */}
      <div
        className="absolute inset-x-0 bottom-0 h-44"
        style={{ background: "linear-gradient(180deg, transparent, var(--wr-bg))" }}
      />
    </div>
  );
}

export function HeroCinematicReveal({
  section,
  variant,
  slots,
  blueprint,
  mediaAssets,
  mode,
}: PrimitiveSectionProps) {
  const split = variant === "split-editorial";
  const video = variant === "video-backdrop";
  const media = section.media?.[0];
  const backdrop = slots["backdrop-direction"];

  const copy = (
    <div className="flex max-w-3xl flex-col items-start gap-7">
      <CssSettle delay={0}>
        <p
          className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.3em]"
          style={{ ...monoFont, color: "var(--wr-ink-muted)" }}
        >
          <span
            className="wr-gh-rule inline-block h-px w-10"
            style={{ background: "var(--wr-accent)" }}
          />
          {blueprint.identity.trade} · {blueprint.identity.location}
        </p>
      </CssSettle>

      <CssSettle delay={120} fade={false}>
        <SectionTitle as="h1" id={`${section.id}-title`} size="var(--wr-text-display)">
          {slots.headline}
        </SectionTitle>
      </CssSettle>

      {slots.subheadline && (
        <CssSettle delay={340}>
          <p
            className="max-w-[var(--wr-measure)] text-pretty leading-relaxed"
            style={{ fontSize: "var(--wr-text-lg)", color: "var(--wr-ink-muted)" }}
          >
            {slots.subheadline}
          </p>
        </CssSettle>
      )}

      <CssSettle delay={560} className="mt-2 flex flex-wrap items-center gap-5">
        {slots["primary-cta"] && (
          <span className="inline-flex rounded-full transition-transform duration-500 hover:scale-[1.03] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100">
            <SignalCTA href="#callback" size="lg">
              {slots["primary-cta"]}
            </SignalCTA>
          </span>
        )}
        <a
          href="#story"
          className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ color: "var(--wr-ink-muted)", outlineColor: "var(--wr-accent)" }}
        >
          <ArrowDown className="size-4" aria-hidden />
          See the transformations
        </a>
      </CssSettle>
    </div>
  );

  const momentId = section.extensions?.signatureMoment as string | undefined;
  const signatureMoment = resolveSignatureMoment(momentId);
  const backdropAsset =
    mediaAssets?.[media?.generationRef ?? `media/${section.id}`];

  return (
    // Top-anchored (never vertically centred): late layout cannot re-centre
    // the block (CLS 0 discipline from Renderer v1).
    <SectionShell
      section={section}
      flush
      defer={false}
      className="isolate min-h-[92svh]"
    >
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />
      {backdropAsset && (
        // The real hero photograph — Ken Burns drift, warm legibility wash.
        <div aria-hidden className="absolute inset-0">
          <CinematicImage
            asset={backdropAsset}
            alt=""
            kenBurns
            eager
            className="h-full w-full"
          />
          {/* golden-hour mood grade — the theme is literally named for it:
              warm low sun from the right, faint violet in the sky */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(15deg, rgba(255, 138, 46, 0.32), rgba(255, 206, 130, 0.12) 55%, rgba(84, 62, 128, 0.14))",
              mixBlendMode: "overlay",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(255, 170, 80, 0.10)",
              mixBlendMode: "soft-light",
            }}
          />
          {/* directional dusk scrim — headlines never fight the photograph */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(100deg, color-mix(in oklab, var(--wr-bg) 88%, transparent) 24%, color-mix(in oklab, var(--wr-bg) 45%, transparent) 55%, transparent 85%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-44"
            style={{ background: "linear-gradient(180deg, transparent, var(--wr-bg))" }}
          />
        </div>
      )}
      {!backdropAsset && <GoldenAtmosphere dim={split} />}
      {signatureMoment && (
        // The site's ONE signature moment — the opening act (ADR-032).
        <div
          data-signature-moment={momentId}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {createElement(signatureMoment, { hasBackdrop: Boolean(backdropAsset) })}
        </div>
      )}

      {video && (
        <div
          aria-hidden
          className="wr-gh-shimmer absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255, 236, 200, 0.5) 50%, transparent 70%)",
          }}
        />
      )}

      <Container wide className="relative pb-24 pt-[clamp(6.5rem,16svh,10rem)]">
        {split ? (
          <div className="grid items-start gap-12 lg:grid-cols-[7fr_5fr]">
            {copy}
            <CssSettle delay={450} className="hidden lg:block">
              <MediaSlotFrame
                media={media}
                label="hero frame · the finished space"
                scene="linear-gradient(160deg, var(--wr-storm-1), var(--wr-storm-2) 60%, #8a6d47)"
                minHeight="26rem"
                mode={mode}
              />
            </CssSettle>
          </div>
        ) : (
          copy
        )}

        {mode === "preview" && (video || (!split && backdrop)) && (
          <div className="absolute bottom-6 right-[var(--wr-space-gutter)] hidden max-w-xs flex-col gap-1.5 sm:flex">
            <AnnotationTag>
              {video ? "video backdrop slot · awaiting real footage" : "backdrop direction"}
            </AnnotationTag>
            {backdrop && (
              <p
                className="line-clamp-2 text-[11px] leading-relaxed"
                style={{ color: "var(--wr-ink-faint)" }}
              >
                {backdrop}
              </p>
            )}
          </div>
        )}

        {/* the oversized ghost word — the place the work belongs to */}
        {blueprint.identity.location && (
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-8 right-0 select-none text-right leading-none opacity-[0.05]"
            style={{ ...displayFont, fontSize: "clamp(5rem, 15vw, 12rem)", fontWeight: 800 }}
          >
            {blueprint.identity.location}
          </div>
        )}
      </Container>
    </SectionShell>
  );
}
