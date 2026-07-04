"use client";

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
 * Reduced motion renders the DESIGNED STILL: the finished resin, mid-sheen.
 */

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

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

function Pebble({
  stone,
  progress,
}: {
  stone: (typeof STONES)[number];
  progress: MotionValue<number>;
}) {
  // Tumble → gather → sink flush: each pebble rolls to its course, squares
  // up, then shrinks INTO the resin as it seals over.
  const x = useTransform(progress, [0.08, 0.55], [stone.x, stone.settleX]);
  const y = useTransform(progress, [0.08, 0.55], [stone.y, stone.settleY]);
  const rotate = useTransform(
    progress,
    [0.08, 0.55],
    [stone.rotate, stone.settleRotate],
  );
  const scale = useTransform(
    progress,
    [0.08, 0.55, 0.72],
    [stone.scale, stone.scale, stone.scale * 0.45],
  );
  const opacity = useTransform(progress, [0.55, 0.78], [1, 0]);
  const tone = PEBBLE_TONES[stone.tone];
  return (
    <motion.g style={{ x, y, rotate, scale, opacity }}>
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
    </motion.g>
  );
}

export function GravelToResin({ hasBackdrop = false }: { hasBackdrop?: boolean } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 22,
    mass: 0.5,
  });

  // The resin pour: a smooth surface that flows in as the stones settle.
  const resinScale = useTransform(progress, [0.42, 0.8], [0, 1]);
  const resinOpacity = useTransform(progress, [0.42, 0.7], [0, 1]);
  const edgeOpacity = useTransform(progress, [0.72, 0.9], [0, 0.85]);
  const sheenX = useTransform(progress, [0.78, 1], [-320, 1180]);
  // With a real photo beneath, the drawn surface hands off to the
  // photograph at the end — the morph resolves INTO the real driveway.
  const surfaceHandOff = useTransform(
    progress,
    [0.8, 0.98],
    [1, hasBackdrop ? 0.12 : 1],
  );
  const surfaceOpacity = useTransform(
    () => resinOpacity.get() * surfaceHandOff.get(),
  );
  const sheenOpacity = useTransform(progress, [0.78, 0.86, 1], [0, 0.5, 0.25]);

  if (reduced) {
    // The designed still: the finished resin catching the light.
    return (
      <div ref={ref} className="absolute inset-0">
        <svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMax slice" className="h-full w-full">
          <defs>
            <linearGradient id="resin-depth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(255, 236, 200, 0.35)" />
              <stop offset="1" stopColor="rgba(70, 50, 32, 0.4)" />
            </linearGradient>
          </defs>
          {!hasBackdrop && (
            <>
              <rect x="12" y="488" width="976" height="112" rx="16" fill="rgba(133, 100, 66, 0.95)" />
              <rect x="12" y="488" width="976" height="112" rx="16" fill="url(#resin-depth)" />
              <rect x="0" y="478" width="1000" height="12" rx="6" fill="var(--wr-accent)" opacity="0.55" />
              <rect x="380" y="500" width="240" height="88" rx="14" fill="rgba(255, 244, 220, 0.28)" transform="skewX(-18)" />
            </>
          )}
        </svg>
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute inset-0">
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
          <motion.g
            style={{
              opacity: surfaceOpacity,
              scaleX: resinScale,
              transformBox: "fill-box",
              transformOrigin: "50% 50%",
            }}
          >
            <rect x="12" y="488" width="976" height="112" rx="16" fill="rgba(133, 100, 66, 0.95)" />
            <rect x="12" y="488" width="976" height="112" rx="16" fill="url(#resin-depth)" />
          </motion.g>
          <motion.rect
            x="12"
            y="504"
            width="976"
            height="10"
            rx="5"
            fill="var(--wr-accent)"
            style={{ opacity: edgeOpacity }}
          />

          {/* the gravel courses — every pebble finds its place, then sinks in */}
          {STONES.map((stone) => (
            <Pebble key={stone.settleX} stone={stone} progress={progress} />
          ))}

          {/* the light sweeps across the finish — the pride beat */}
          <motion.rect
            y="470"
            width="300"
            height="132"
            rx="14"
            fill="rgba(255, 246, 224, 0.55)"
            transform="skewX(-18)"
            style={{ x: sheenX, opacity: sheenOpacity }}
          />
        </g>
      </svg>
    </div>
  );
}
