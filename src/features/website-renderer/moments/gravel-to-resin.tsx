/**
 * SIGNATURE MOMENT: Gravel → Resin (ADR-032, driveways).
 *
 * The trade's whole promise in one scroll: loose, scattered gravel gathers,
 * settles, and melts into a single seamless resin surface — then the light
 * sweeps across the finish. Deterministic stone field (no randomness), pure
 * vector, golden-hour palette from the theme's own variables.
 *
 * Stone-craft rules (ADR-034 pass): the gravel lives ONLY in the driveway
 * band of the composition — a clip path guarantees it can never drift over
 * the sky, the house, or the headline. Stones are irregular shaded pebbles
 * (three cut shapes, deterministic rotation), not flat circles, and the
 * settle reads as gravel BECOMING surface: tumble → gather into courses →
 * sink flush as the resin seals over them.
 *
 * v2 (the JS diet): the whole cinematic is a CSS scroll-driven animation —
 * a named view timeline drives shared keyframes whose values come from
 * per-pebble custom properties. ZERO JavaScript. Markup is authored at the
 * FINISHED state (the designed still: the sealed resin, mid-sheen), so
 * browsers without scroll-driven animation support — and reduced motion —
 * simply see the calm ending.
 */

import type { CSSProperties } from "react";

/** The driveway band: everything the moment draws stays inside this region. */
const BAND_TOP = 430;

/** Three pebble cuts, each ~24×18 units centred on the origin. */
const PEBBLE_PATHS = [
  "M -11 2 C -12 -6 -5 -10 2 -9 C 9 -8 12 -3 10 3 C 8 8 -2 10 -7 7 C -10 5 -10.5 4 -11 2 Z",
  "M -10 -3 C -7 -9 4 -11 9 -6 C 13 -2 11 6 5 8 C -1 10 -9 8 -11 3 C -12 1 -11 -1 -10 -3 Z",
  "M -9 4 C -13 -2 -6 -9 1 -10 C 8 -10 12 -5 11 1 C 10 7 3 10 -3 9 C -6 8 -8 7 -9 4 Z",
];

/** Warm aggregate tones — solid, mineral, never translucent blobs. */
const PEBBLE_TONES = [
  { fill: "#8c7658", edge: "#5f4e39" },
  { fill: "#705e46", edge: "#4a3d2c" },
  { fill: "#a38a68", edge: "#6e5c44" },
];

/** Deterministic scatter — index maths, never Math.random (ADR-021 spirit). */
const STONES = Array.from({ length: 34 }, (_, index) => {
  const row = index % 2;
  return {
    // Tumbled start: spread across the band, upper courses only slightly
    // higher — gravel on the ground, never in the air.
    x: 40 + ((index * 173) % 910),
    y: BAND_TOP + 20 + ((index * 97) % 92), // 450..542 — inside the band
    rotate: ((index * 47) % 360) - 180,
    scale: 0.5 + ((index * 13) % 8) / 20, // 0.5..0.85 — gravel, not boulders
    // Settled finish: two tight courses reading as a laid surface.
    settleX: 38 + index * 28.2,
    settleY: 512 + row * 18,
    settleRotate: ((index * 29) % 24) - 12, // near-flat, slight tessellation
    tone: index % 3,
    shape: index % PEBBLE_PATHS.length,
  };
});

/**
 * The choreography. Elements are authored at their END state; keyframes
 * (progress fractions from the original scroll mapping) run only where
 * scroll-driven animations are supported. Pebbles share ONE keyframe set —
 * their tumble/settle values come from per-element custom properties.
 */
const GRAVEL_CSS = `
.wr-gv { view-timeline: --wr-gv block; }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .wr-gv-resin, .wr-gv-edge, .wr-gv-stone, .wr-gv-sheen {
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --wr-gv;
      animation-range: exit 0% exit 100%;
    }
    .wr-gv-resin { animation-name: wr-gv-resin; }
    .wr-gv-edge { animation-name: wr-gv-edge; }
    .wr-gv-stone { animation-name: wr-gv-stone; }
    .wr-gv-sheen { animation-name: wr-gv-sheen; }
  }
}
/* The resin pour: a smooth surface that flows in as the stones settle.
   With a real photo beneath (--wr-gv-h < 1) the drawn surface hands off to
   the photograph at the end — the morph resolves INTO the real driveway. */
.wr-gv-resin {
  opacity: var(--wr-gv-h, 1);
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes wr-gv-resin {
  0%, 42% { opacity: 0; scale: 0 1; }
  70% { opacity: 1; }
  80% { opacity: 1; scale: 1 1; }
  100% { opacity: var(--wr-gv-h, 1); scale: 1 1; }
}
.wr-gv-edge { opacity: 0.85; }
@keyframes wr-gv-edge {
  0%, 72% { opacity: 0; }
  90%, 100% { opacity: 0.85; }
}
/* Tumble → gather → sink flush: each pebble rolls to its course, squares
   up, then shrinks INTO the resin as it seals over. */
.wr-gv-stone {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}
@keyframes wr-gv-stone {
  0%, 8% {
    opacity: 1;
    translate: var(--gv-x) var(--gv-y);
    rotate: var(--gv-r);
    scale: var(--gv-s);
  }
  55% {
    opacity: 1;
    translate: var(--gv-ex) var(--gv-ey);
    rotate: var(--gv-er);
    scale: var(--gv-s);
  }
  72% {
    translate: var(--gv-ex) var(--gv-ey);
    rotate: var(--gv-er);
    scale: calc(var(--gv-s) * 0.45);
  }
  78%, 100% {
    opacity: 0;
    translate: var(--gv-ex) var(--gv-ey);
    rotate: var(--gv-er);
    scale: calc(var(--gv-s) * 0.45);
  }
}
/* The light sweeps across the finish — the pride beat. */
.wr-gv-sheen { opacity: 0.28; translate: 380px 0; }
@keyframes wr-gv-sheen {
  0%, 78% { opacity: 0; translate: -320px 0; }
  86% { opacity: 0.5; }
  100% { opacity: 0.25; translate: 1180px 0; }
}
`;

export function GravelToResin({ hasBackdrop = false }: { hasBackdrop?: boolean } = {}) {
  return (
    <div
      className="wr-gv absolute inset-0"
      style={{ "--wr-gv-h": hasBackdrop ? 0.12 : 1 } as CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: GRAVEL_CSS }} />
      <svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
        <defs>
          <linearGradient id="resin-depth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255, 236, 200, 0.35)" />
            <stop offset="1" stopColor="rgba(70, 50, 32, 0.4)" />
          </linearGradient>
          {/* HARD GUARANTEE: nothing the moment draws leaves the driveway
              band — no pebble over sky, house, or headline (ADR-034). */}
          <clipPath id="driveway-band">
            <rect x="0" y={BAND_TOP} width="1000" height={620 - BAND_TOP} />
          </clipPath>
        </defs>

        <g clipPath="url(#driveway-band)">
          {/* THE MORPH: resin flows in beneath the settling stones */}
          <g className="wr-gv-resin">
            <rect x="12" y="488" width="976" height="112" rx="16" fill="rgba(133, 100, 66, 0.95)" />
            <rect x="12" y="488" width="976" height="112" rx="16" fill="url(#resin-depth)" />
          </g>
          <rect
            className="wr-gv-edge"
            x="12"
            y="504"
            width="976"
            height="10"
            rx="5"
            fill="var(--wr-accent)"
          />

          {/* the gravel courses — every pebble finds its place, then sinks in */}
          {STONES.map((stone) => {
            const tone = PEBBLE_TONES[stone.tone];
            return (
              <g
                key={stone.settleX}
                className="wr-gv-stone"
                style={
                  {
                    "--gv-x": `${stone.x}px`,
                    "--gv-y": `${stone.y}px`,
                    "--gv-r": `${stone.rotate}deg`,
                    "--gv-s": stone.scale,
                    "--gv-ex": `${stone.settleX}px`,
                    "--gv-ey": `${stone.settleY}px`,
                    "--gv-er": `${stone.settleRotate}deg`,
                  } as CSSProperties
                }
              >
                {/* grounding shadow — the pebble sits ON the surface */}
                <path
                  d={PEBBLE_PATHS[stone.shape]}
                  transform="translate(1.2 1.8)"
                  fill="rgba(40, 28, 16, 0.3)"
                />
                <path
                  d={PEBBLE_PATHS[stone.shape]}
                  fill={tone.fill}
                  stroke={tone.edge}
                  strokeWidth="0.8"
                />
                {/* the sun catches the top edge — a hint, not a gloss */}
                <ellipse cx="-3" cy="-4" rx="3.5" ry="2" fill="rgba(255, 240, 214, 0.28)" />
              </g>
            );
          })}

          {/* the light sweeps across the finish — the pride beat */}
          <rect
            className="wr-gv-sheen"
            y="470"
            width="300"
            height="132"
            rx="14"
            fill="rgba(255, 246, 224, 0.55)"
            transform="skewX(-18)"
          />
        </g>
      </svg>
    </div>
  );
}
