/**
 * CinematicImage (ADR-033): how every generated asset is shown.
 *
 * next/image serves assets SAME-ORIGIN, per-viewport sized, AVIF/WebP —
 * the difference between a 280KB cross-origin hero and a ~40KB optimised
 * one. A themed placeholder paints beneath instantly (never gating the
 * image); below-fold assets are lazy; the hero is priority (it is the
 * LCP). Ken Burns drift is CSS-only and reduced-motion safe.
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

export function CinematicImage({
  asset,
  alt,
  className = "",
  kenBurns = false,
  eager = false,
  sizes = "(max-width: 768px) 100vw, 60vw",
}: {
  asset: ResolvedMediaAsset;
  alt: string;
  className?: string;
  /** Slow drift for hero backdrops. */
  kenBurns?: boolean;
  /** The hero backdrop is the LCP — everything else stays lazy. */
  eager?: boolean;
  sizes?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        // Instant paint beneath the asset — never gates the image itself.
        background: "linear-gradient(135deg, var(--wr-storm-1), var(--wr-storm-2))",
      }}
    >
      {kenBurns && <style dangerouslySetInnerHTML={{ __html: KEN_BURNS_CSS }} />}
      <Image
        src={asset.url}
        alt={alt}
        fill
        priority={eager}
        loading={eager ? "eager" : "lazy"}
        quality={45}
        sizes={sizes}
        className={`object-cover ${kenBurns ? "wr-kenburns" : ""}`}
      />
    </div>
  );
}
