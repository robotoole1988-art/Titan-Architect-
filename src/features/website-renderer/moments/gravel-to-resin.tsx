"use client";

/**
 * SIGNATURE MOMENT: Gravel → Resin (ADR-032, driveways).
 *
 * The trade's whole promise in one scroll: loose, scattered gravel gathers,
 * settles, and melts into a single seamless resin surface — then the light
 * sweeps across the finish. Deterministic stone field (no randomness), pure
 * vector, golden-hour palette from the theme's own variables.
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

/** Deterministic scatter — index maths, never Math.random (ADR-021 spirit). */
const STONES = Array.from({ length: 26 }, (_, index) => {
  const x = 60 + ((index * 173) % 880);
  return {
    x,
    y: 340 + ((index * 97) % 200),
    r: 11 + ((index * 31) % 13),
    settleX: 40 + index * 36.8, // even spread along the finished surface
    tone: index % 3,
  };
});

const STONE_FILLS = [
  "rgba(140, 118, 88, 0.9)",
  "rgba(112, 94, 70, 0.9)",
  "rgba(163, 138, 104, 0.9)",
];

function Stone({
  stone,
  progress,
}: {
  stone: (typeof STONES)[number];
  progress: MotionValue<number>;
}) {
  // Each stone rolls to its place, settles onto the surface line, and
  // dissolves INTO the resin as it seals.
  const x = useTransform(progress, [0.08, 0.55], [stone.x, stone.settleX]);
  const y = useTransform(progress, [0.08, 0.55], [stone.y, 520]);
  const r = useTransform(progress, [0.45, 0.72], [stone.r, stone.r * 0.45]);
  const opacity = useTransform(progress, [0.55, 0.78], [0.95, 0]);
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={r}
      style={{ opacity }}
      fill={STONE_FILLS[stone.tone]}
    />
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
  const sheenOpacity = useTransform(progress, [0.78, 0.86, 1], [0, 0.5, 0.25]);

  const resinSurface = (
    <>
      {/* the finished surface — one seamless plane */}
      <rect x="12" y="488" width="976" height="112" rx="16" fill="rgba(133, 100, 66, 0.95)" />
      <rect x="12" y="488" width="976" height="112" rx="16" fill="url(#resin-depth)" />
      {/* the crisp edging course that frames a premium job */}
      <rect x="0" y="478" width="1000" height="12" rx="6" fill="var(--wr-accent)" opacity="0.55" />
    </>
  );

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
          {!hasBackdrop && resinSurface}
          {!hasBackdrop && (
            <rect x="380" y="500" width="240" height="88" rx="14" fill="rgba(255, 244, 220, 0.28)" transform="skewX(-18)" />
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
        </defs>

        {/* THE MORPH: resin flows in beneath the settling stones */}
        <motion.g
          style={{
            opacity: useTransform(() => resinOpacity.get() * surfaceHandOff.get()),
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

        {/* the gravel field — every stone finds its place, then melts in */}
        {STONES.map((stone) => (
          <Stone key={stone.settleX} stone={stone} progress={progress} />
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
      </svg>
    </div>
  );
}
