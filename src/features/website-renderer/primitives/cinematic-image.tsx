/**
 * CinematicImage (ADR-033): how every generated asset is shown.
 *
 * LCP-protected and JS-independent: a themed placeholder paints UNDER the
 * image instantly; the image simply draws over it when loaded (no
 * opacity-gating that could strand a cached image invisible). Below-fold
 * assets are lazy. Optional Ken Burns drift gives hero backdrops slow
 * cinematic life — reduced-motion turns it off via media query.
 */

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
  sizes,
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
      {/* eslint-disable-next-line @next/next/no-img-element -- generated
          assets are pre-sized webp; next/image adds nothing here */}
      <img
        src={asset.url}
        alt={alt}
        width={asset.width}
        height={asset.height}
        loading={eager ? "eager" : "lazy"}
        decoding={eager ? "sync" : "async"}
        fetchPriority={eager ? "high" : undefined}
        sizes={sizes}
        className={`h-full w-full object-cover ${kenBurns ? "wr-kenburns" : ""}`}
      />
    </div>
  );
}
