/**
 * The shared motion system (ADR-022, v2 — the JS diet).
 *
 * Every rendered primitive animates through these components — never ad-hoc —
 * so motion stays coherent, purposeful, and accessible. v2 removes Framer
 * Motion entirely (Published Sites Performance Law: framer-motion is banned
 * from the renderer; motion is CSS):
 *
 * - `Reveal` / `Stagger` / `StaggerItem` render `data-wr-reveal` targets.
 *   ONE shared IntersectionObserver (see `RevealObserver`) marks them
 *   `data-wr-on` as they approach the viewport; CSS transitions in the page
 *   root (`WR_MOTION_CSS`, render-page) do the rise-and-settle. Without
 *   JavaScript nothing is ever hidden — the hiding rule only applies under
 *   `[data-wr-js]`, which the observer itself sets. Content can never be
 *   stuck invisible (audit fault F3, honoured by construction).
 * - `Parallax`, `PulseBeacon`, and the primitives' scroll choreography are
 *   pure CSS — scroll-driven animations behind `@supports
 *   (animation-timeline: view())` with a visible static fallback.
 * - `prefers-reduced-motion` collapses everything to instant, complete
 *   visibility via media queries — no JS branching required.
 *
 * These components are universal (server- and client-renderable): no hooks,
 * no state, no bundle weight. Motion exists to create emotion and guide
 * attention — never decoration.
 */

import type { CSSProperties, ReactNode } from "react";

export { RevealObserver } from "./reveal-observer";

/**
 * Rise-and-settle scroll reveal. The workhorse: calm, decisive, once.
 * Server-rendered visible; the shared observer + CSS add the entrance.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  duration = 0.7,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  /** Premium primitives reveal more slowly than emergency's urgency (ADR-029). */
  duration?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      data-wr-reveal
      className={className}
      style={
        {
          ...style,
          "--wr-reveal-delay": `${delay}s`,
          "--wr-reveal-y": `${y}px`,
          "--wr-reveal-duration": `${duration}s`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/**
 * Orchestrated entrance for a group of children. The observer assigns each
 * `data-wr-reveal` child an incremental transition delay of `gap` seconds.
 */
export function Stagger({
  children,
  className,
  gap = 0.09,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  return (
    <div data-wr-stagger={gap} className={className}>
      {children}
    </div>
  );
}

/** One item inside a <Stagger>. */
export function StaggerItem({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      data-wr-reveal
      className={className}
      style={{ ...style, "--wr-reveal-y": "16px", "--wr-reveal-duration": "0.6s" } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * Gentle scroll parallax — a CSS scroll-driven animation where supported;
 * static (and reduced-motion) everywhere else. Zero JavaScript.
 */
export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  return (
    <div
      className={className ? `wr-parallax ${className}` : "wr-parallax"}
      style={{ "--wr-parallax": `${distance}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * The page's most important action, given presence through CSS alone: a
 * scale lean on hover, a settle on press. (v2 retires the pointer-tracking
 * lean — decoration the Performance Law doesn't pay for.)
 */
export function MagneticCTA({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  /** Kept for API compatibility; the CSS lean has one strength. */
  strength?: number;
}) {
  return (
    <div className={className ? `wr-magnetic ${className}` : "wr-magnetic"}>
      {children}
    </div>
  );
}

/** A slow, reassuring pulse ring (the "we're here" beacon). Pure CSS. */
export function PulseBeacon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={className ? `wr-beacon ${className}` : "wr-beacon"}
    />
  );
}
