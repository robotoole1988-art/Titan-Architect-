/**
 * hero.rapid-response — the cinematic storm opening.
 *
 * A dark, weather-heavy atmosphere built from layered gradients and slow
 * drifting cloud masses (no imagery), a single amber call signal, and copy
 * that answers the visitor's panic in one held breath. Variant "call-first"
 * leads with the call action; "quote-first" swaps the emphasis.
 *
 * Deliberately a SERVER component animated with pure CSS: the emergency hero
 * is the LCP — it must paint and move on the first frame, before any
 * JavaScript arrives. Reduced motion is honoured via media query.
 */

import { Phone } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { createElement } from "react";
import { CinematicImage } from "./cinematic-image";
import { resolveSignatureMoment } from "../moments/registry";
import type { PrimitiveSectionProps } from "../model/types";
import {
  AnnotationTag,
  Container,
  GhostCTA,
  SectionShell,
  SectionTitle,
  SignalCTA,
  displayFont,
  monoFont,
} from "./atoms";

/** Static film-grain (tiny inline SVG turbulence, no network request). */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/** Local keyframes, scoped by the wr-hero- prefix (self-contained, no globals). */
const HERO_CSS = `
@keyframes wr-hero-drift-a {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(90px, 24px); }
}
@keyframes wr-hero-drift-b {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-110px, 36px); }
}
@keyframes wr-hero-flash {
  0%, 86%, 100% { opacity: 0; }
  88% { opacity: 0.16; }
  91% { opacity: 0.05; }
  94% { opacity: 0.12; }
  96% { opacity: 0; }
}
@keyframes wr-hero-pulse {
  0% { transform: scale(1); opacity: 0.55; }
  100% { transform: scale(1.35); opacity: 0; }
}
.wr-hero-cloud-a { animation: wr-hero-drift-a 52s ease-in-out infinite; }
.wr-hero-cloud-b { animation: wr-hero-drift-b 64s ease-in-out infinite; }
.wr-hero-flash { animation: wr-hero-flash 12s linear infinite 4s; opacity: 0; }
.wr-hero-beacon { animation: wr-hero-pulse 2.2s ease-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .wr-hero-cloud-a, .wr-hero-cloud-b, .wr-hero-beacon { animation: none; }
  .wr-hero-flash { animation: none; opacity: 0; }
}
`;

function StormAtmosphere({ overPhoto = false }: { overPhoto?: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* storm ground — a designed atmosphere asset (composed gradients +
          grain, never fake photography; generated, checked in). A real <img>
          so the hero's largest paint is a tiny, cacheable image rather than
          font-gated text. */}
      {!overPhoto && (
        // eslint-disable-next-line @next/next/no-img-element -- fixed-size generated poster; next/image adds nothing here
        <img
        src="/renderer/storm-poster.png"
        alt=""
        width={416}
        height={260}
        fetchPriority="high"
        loading="eager"
        decoding="sync"
        className="absolute inset-0 h-full w-full object-cover"
      />
      )}
      {/* drifting cloud masses — soft radial gradients, deliberately NOT
          filter:blur (huge blur layers dominate first-paint raster cost) */}
      <div
        className="wr-hero-cloud-a absolute -top-1/4 left-[-15%] h-[70%] w-[80%] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, var(--wr-storm-1) 20%, rgba(22,35,58,0.4) 55%, transparent 78%)",
        }}
      />
      <div
        className="wr-hero-cloud-b absolute -top-[10%] right-[-20%] h-[65%] w-[70%] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(35, 54, 78, 0.8) 15%, rgba(35,54,78,0.35) 55%, transparent 78%)",
        }}
      />
      {/* a distant, soft flash — barely there, never alarming */}
      <div
        className="wr-hero-flash absolute -top-1/3 left-1/4 h-2/3 w-1/3 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(213, 228, 247, 0.4) 10%, rgba(213,228,247,0.12) 50%, transparent 80%)",
        }}
      />
      {/* light shaft guiding the eye to the headline */}
      <div
        className="absolute inset-y-0 left-[8%] w-[38%] -skew-x-12"
        style={{
          background:
            "linear-gradient(180deg, rgba(127, 180, 232, 0.07), transparent 65%)",
        }}
      />
      {/* grain */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: NOISE }} />
      {/* settle into the page */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(180deg, transparent, var(--wr-bg))" }}
      />
    </div>
  );
}

/**
 * CSS-only entrance for the LCP-critical hero copy: it starts painting on the
 * first frame (no hydration wait), honours reduced motion via media query,
 * and staggers with animation-delay.
 */
function CssRise({
  children,
  delay = 0,
  className,
  fade = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  /** LCP-critical children rise WITHOUT fading, so they paint on frame one. */
  fade?: boolean;
}) {
  return (
    <div
      className={`duration-700 ease-out animate-in slide-in-from-bottom-4 motion-reduce:animate-none ${fade ? "fade-in-0" : ""} ${className ?? ""}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** "Lead with the response promise — X — stated plainly…" → "X". */
function promiseOf(direction: string | undefined): string | undefined {
  if (!direction) return undefined;
  const segments = direction.split("—").map((segment) => segment.trim());
  return segments.length >= 2 ? segments[1] : direction;
}

export function HeroRapidResponse({ section, variant, slots, blueprint, mediaAssets }: PrimitiveSectionProps) {
  const callFirst = variant !== "quote-first";
  const media = section.media?.[0];
  const secondary = blueprint.pages.pages[0].conversion?.ctas?.[0];
  const promise = promiseOf(slots["response-promise"]);

  const momentId = section.extensions?.signatureMoment as string | undefined;
  const signatureMoment = resolveSignatureMoment(momentId);
  const backdropAsset =
    mediaAssets?.[media?.generationRef ?? `media/${section.id}`];

  return (
    // Content is top-anchored (not vertically centred): late layout above or
    // within the hero cannot re-centre the whole block (CLS).
    <SectionShell section={section} flush defer={false} className="isolate min-h-[94svh]">
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />
      {backdropAsset && (
        // The real photograph beneath the storm — the property at stake.
        <div aria-hidden className="absolute inset-0">
          <CinematicImage asset={backdropAsset} alt="" kenBurns eager className="h-full w-full" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, rgba(8, 11, 18, 0.88) 25%, rgba(8, 11, 18, 0.55) 60%, rgba(8, 11, 18, 0.35))",
            }}
          />
        </div>
      )}
      <StormAtmosphere overPhoto={Boolean(backdropAsset)} />
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
      <Container wide className="relative pb-24 pt-[clamp(7rem,18svh,11rem)]">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          {promise && (
            <CssRise delay={0}>
              <p
                className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.24em]"
                style={{ ...monoFont, color: "var(--wr-calm)" }}
              >
                <span className="relative flex size-2">
                  <span
                    className="absolute inline-flex size-full animate-ping rounded-full opacity-60 motion-reduce:animate-none"
                    style={{ background: "var(--wr-ok)" }}
                  />
                  <span
                    className="relative inline-flex size-2 rounded-full"
                    style={{ background: "var(--wr-ok)" }}
                  />
                </span>
                {promise} · {blueprint.identity.location}
              </p>
            </CssRise>
          )}

          <CssRise delay={90} fade={false}>
            <SectionTitle as="h1" id={`${section.id}-title`} size="var(--wr-text-display)">
              {slots.headline}
            </SectionTitle>
          </CssRise>

          {slots.subheadline && (
            <CssRise delay={200}>
              <p
                className="max-w-[var(--wr-measure)] text-pretty leading-relaxed"
                style={{ fontSize: "var(--wr-text-lg)", color: "var(--wr-ink-muted)" }}
              >
                {slots.subheadline}
              </p>
            </CssRise>
          )}

          <CssRise delay={320} className="mt-2 flex flex-wrap items-center gap-4">
            {slots["primary-cta"] && (
              <span className="relative inline-flex rounded-full transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100">
                <span
                  aria-hidden
                  className="wr-hero-beacon absolute inset-0 rounded-full border-2"
                  style={{ borderColor: "var(--wr-accent)" }}
                />
                <SignalCTA href="#callback" size="lg">
                  <Phone className="size-5" aria-hidden />
                  {slots["primary-cta"]}
                </SignalCTA>
              </span>
            )}
            {!callFirst && secondary?.label && (
              <GhostCTA href="#callback">{secondary.label}</GhostCTA>
            )}
          </CssRise>
        </div>

        {media && (
          <div className="absolute bottom-6 right-[var(--wr-space-gutter)] hidden max-w-xs sm:block">
            <AnnotationTag>media brief · {media.kind}</AnnotationTag>
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed" style={{ color: "var(--wr-ink-faint)" }}>
              {media.direction}
            </p>
          </div>
        )}

        {/* oversized ghost word anchoring the composition — the place itself */}
        {blueprint.identity.location && (
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-6 right-0 select-none text-right leading-none opacity-[0.045]"
            style={{ ...displayFont, fontSize: "clamp(5rem, 16vw, 13rem)", fontWeight: 800 }}
          >
            {blueprint.identity.location}
          </div>
        )}
      </Container>
    </SectionShell>
  );
}
