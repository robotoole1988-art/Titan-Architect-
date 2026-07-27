/**
 * CinematicImage (ADR-033) — how every generated asset is shown, and
 * THE BOX LAW (ADR-055) — how it is guaranteed to be visible at all.
 *
 * next/image serves assets SAME-ORIGIN, per-viewport sized, AVIF/WebP —
 * the difference between a 280KB cross-origin hero and a ~33KB optimised
 * one. A themed placeholder paints beneath instantly (never gating the
 * image); below-fold assets are lazy; the hero is priority (it is the LCP).
 * Ken Burns drift is CSS-only and reduced-motion safe.
 *
 * The box law exists because `fill` positions the <img> absolutely: the
 * wrapper can NEVER derive its height from the image. A wrapper that lays
 * out at zero height is not merely invisible — it never intersects the
 * viewport, so the lazy loader never fires and the visitor is left looking
 * at the placeholder gradient for ever.
 *
 * That is not a hypothesis. It shipped. This component hardcoded
 * `relative overflow-hidden` and concatenated the caller's `absolute
 * inset-0`; Tailwind emits `.relative` AFTER `.absolute`, so `relative`
 * won, the wrapper stayed in flow, and 10 of the 11 photographs on the
 * live Kerbside site measured 755x0 in production and never loaded.
 *
 * So the box is no longer implied by a class string. This component owns
 * `position`, callers never pass position or inset utilities, and `fit` is
 * REQUIRED so the compiler asks every call site the question:
 *
 *   inset — fill the nearest positioned ancestor (the caller sizes it).
 *   sized — the caller's own height utilities (h-full, h-56 sm:h-72).
 *   ratio — its own intrinsic box from an aspect-ratio. Zero height is
 *           impossible by construction, and CLS is 0 for free (media law
 *           §4: intrinsic dimensions everywhere).
 */

import Image from "next/image";
import type { ResolvedMediaAsset } from "../model/types";

const KEN_BURNS_CSS = `
@keyframes wr-kenburns {
  0% { transform: scale(1.1) translate3d(-1.5%, -1%, 0); }
  100% { transform: scale(1.02) translate3d(1.5%, 1%, 0); }
}
.wr-kenburns { animation: wr-kenburns 26s ease-in-out infinite alternate; will-change: transform; }
@media (prefers-reduced-motion: reduce) {
  .wr-kenburns { animation: none; transform: none; }
}
`;

/** How a CinematicImage gets its box (ADR-055). There is no default. */
export type CinematicFit = "inset" | "sized" | "ratio";

/** Used when fit="ratio" and the asset carries no intrinsic dimensions. */
const FALLBACK_RATIO = "4 / 3";

export function CinematicImage({
  asset,
  alt,
  fit,
  className = "",
  ratio,
  kenBurns = false,
  eager = false,
  sizes = "(max-width: 768px) 100vw, 60vw",
}: {
  asset: ResolvedMediaAsset;
  alt: string;
  /**
   * How this image gets its box (ADR-055). Required on purpose — an
   * unanswered box question is what blanked the live sites. Callers must
   * NOT pass position or inset utilities in `className`.
   */
  fit: CinematicFit;
  className?: string;
  /** fit="ratio" only: CSS aspect-ratio. Defaults to the asset's own. */
  ratio?: string;
  /** Slow drift for hero backdrops. */
  kenBurns?: boolean;
  /** The hero backdrop is the LCP — everything else stays lazy. */
  eager?: boolean;
  sizes?: string;
}) {
  const intrinsic =
    asset.width && asset.height ? `${asset.width} / ${asset.height}` : undefined;
  return (
    <div
      // The box mode is in the markup so the law can be enforced by a test
      // rather than by memory (tests/features/website-renderer/media-box).
      data-wr-box={fit}
      className={`${fit === "inset" ? "absolute inset-0" : "relative"} overflow-hidden ${className}`}
      style={{
        // Instant paint beneath the asset — never gates the image itself.
        background: "linear-gradient(135deg, var(--wr-storm-1), var(--wr-storm-2))",
        ...(fit === "ratio"
          ? { aspectRatio: ratio ?? intrinsic ?? FALLBACK_RATIO }
          : {}),
      }}
    >
      {kenBurns && <style dangerouslySetInnerHTML={{ __html: KEN_BURNS_CSS }} />}
      <Image
        src={asset.url}
        alt={alt}
        fill
        // The hero backdrop is the LCP. `priority` emits the image PRELOAD
        // link (early discovery); an explicit fetchPriority="high" adds the
        // high-priority HINT next/image alone omits here — together they satisfy
        // lcp-discovery-insight so the LCP image fetches at high priority on
        // throttled mobile. Below-fold images stay lazy (prod audit, ADR-036).
        priority={eager}
        {...(eager
          ? { fetchPriority: "high" as const }
          : { loading: "lazy" as const })}
        quality={45}
        sizes={sizes}
        // Blurred micro-preview (ADR-033): a photograph is visible from the
        // first paint — a cold optimizer cache never shows a bare gradient.
        {...(asset.lqip
          ? { placeholder: "blur" as const, blurDataURL: asset.lqip }
          : {})}
        className={`object-cover ${kenBurns ? "wr-kenburns" : ""}`}
      />
    </div>
  );
}
