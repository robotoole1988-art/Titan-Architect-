"use client";

/**
 * SIGNATURE MOMENT: Storm Cloud → New Roof (ADR-032, roofing).
 *
 * Act I → Act III in one held scroll: the storm mass over the property
 * gathers itself and BECOMES the roofline — the threat literally turns into
 * the protection. Pure SVG path interpolation (both states authored with
 * identical command structure); rain dissolves as the roof completes; the
 * property reveals beneath; one amber porch light comes on last.
 *
 * Reduced motion renders the DESIGNED STILL: the finished roof, calm sky.
 */

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

/* Both paths: M + 6 cubic segments + Z — identical structure, so framer
   interpolates them number-for-number.

   Craft rule (ADR-034 pass): the storm lives in the SKY, right of the
   composition — it never sits over the headline column (left). As it
   morphs it descends onto the house and becomes the roofline: the threat
   literally settles into the protection. */
const CLOUD_MASS =
  "M 380,300 C 430,190 560,130 670,160 C 780,190 830,110 910,140 C 990,170 1010,240 990,320 C 970,400 860,420 760,400 C 660,380 500,420 440,390 C 380,360 330,410 380,300 Z";
const ROOF_MASS =
  "M 160,400 C 240,330 400,205 500,140 C 600,205 760,330 840,400 C 858,416 854,432 834,432 C 722,432 611,432 500,432 C 389,432 278,432 166,432 C 146,432 142,416 160,400 Z";

const CLOUD_WISP =
  "M 560,120 C 610,95 700,90 750,110 C 800,130 810,160 770,172 C 730,184 660,180 610,170 C 560,160 510,145 560,120 Z";
const RIDGE_CAP =
  "M 468,150 C 478,142 522,142 532,150 C 542,158 542,166 532,166 C 522,166 478,166 468,166 C 458,166 458,158 468,150 Z";

// Rain falls UNDER the storm mass only (right of the headline column).
const RAIN = Array.from({ length: 22 }, (_, index) => ({
  x: 400 + ((index * 137) % 540),
  delay: (index * 53) % 180,
  length: 26 + ((index * 29) % 22),
}));

export function StormCloudNewRoof({ hasBackdrop = false }: { hasBackdrop?: boolean } = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // A gentle spring so the morph feels weather-slow, never mechanical.
  const progress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 20,
    mass: 0.6,
  });

  const mass = useTransform(progress, [0.05, 0.75], [CLOUD_MASS, ROOF_MASS]);
  const wisp = useTransform(progress, [0.15, 0.8], [CLOUD_WISP, RIDGE_CAP]);
  // A slow vertical drift while the mass is still weather — clouds move.
  const massDrift = useTransform(progress, [0, 0.35, 0.75], [0, 10, 0]);
  const rainOpacity = useTransform(progress, [0, 0.45], [0.5, 0]);
  const houseOpacity = useTransform(progress, [0.55, 0.85], [0, 1]);
  const houseRise = useTransform(progress, [0.55, 0.85], [26, 0]);
  const stormTint = useTransform(progress, [0.15, 0.85], [0.72, 0]);
  const porchLight = useTransform(progress, [0.86, 0.97], [0, 0.9]);
  // A held flash at the storm's peak — Act I punctuation, gone by mid-morph.
  // Capped so it never white-outs the headline (ADR-034 discipline).
  const flash = useTransform(progress, [0.08, 0.14, 0.2, 0.3], [0, 0.38, 0.08, 0]);
  const ridgeGlow = useTransform(progress, [0.78, 0.95], [0, 0.95]);

  const house = (
    <g>
      {/* the protected home, revealed as the roof completes */}
      <rect x="270" y="350" width="460" height="230" rx="4" fill="rgba(19, 30, 47, 0.92)" />
      <rect x="322" y="402" width="86" height="70" rx="3" fill="rgba(127, 180, 232, 0.16)" stroke="rgba(127, 180, 232, 0.28)" strokeWidth="2" />
      <rect x="592" y="402" width="86" height="70" rx="3" fill="rgba(127, 180, 232, 0.16)" stroke="rgba(127, 180, 232, 0.28)" strokeWidth="2" />
      <rect x="462" y="440" width="76" height="140" rx="3" fill="rgba(30, 44, 66, 1)" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="2" />
    </g>
  );

  if (reduced) {
    // The designed still: the finished roof under a calm sky.
    return (
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 1000 620"
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full"
        >
          {!hasBackdrop && house}
          {!hasBackdrop && <path d={ROOF_MASS} fill="rgba(15, 26, 42, 1)" />}
          <path d={RIDGE_CAP} fill="var(--wr-accent)" opacity="0.7" />
          <circle cx="500" cy="470" r="7" fill="var(--wr-accent)" opacity="0.9" />
        </svg>
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute inset-0">
      <svg
        viewBox="0 0 1000 620"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
      >
        <defs>
          {/* lit top, heavy belly — volumetric weather */}
          <linearGradient id="storm-mass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a4f6d" />
            <stop offset="0.55" stopColor="#1c2c46" />
            <stop offset="1" stopColor="#0f1a2a" />
          </linearGradient>
        </defs>
        {/* Act I atmosphere: a storm-heavy tint that lifts as the roof forms */}
        <motion.rect
          x="0"
          y="0"
          width="1000"
          height="620"
          fill="rgba(8, 12, 20, 1)"
          style={{ opacity: stormTint }}
        />
        <motion.rect
          x="0"
          y="0"
          width="1000"
          height="620"
          fill="rgba(214, 230, 250, 1)"
          style={{ opacity: flash }}
        />

        {!hasBackdrop && (
      <motion.g style={{ opacity: houseOpacity, y: houseRise }}>{house}</motion.g>
    )}

        {/* rain — dissolves as the threat becomes the protection */}
        <motion.g
          stroke="rgba(148, 178, 214, 0.55)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ opacity: rainOpacity }}
        >
          {RAIN.map((drop) => (
            <line
              key={drop.x}
              x1={drop.x}
              y1={180 + drop.delay}
              x2={drop.x - 8}
              y2={180 + drop.delay + drop.length}
            />
          ))}
        </motion.g>

        {/* THE MORPH: the storm mass becomes the roofline. The vertical
            gradient gives the mass a lit top and a heavy belly — weather,
            not a smudge; the same light reads as sky on the finished roof. */}
        <motion.path d={mass} fill="url(#storm-mass)" style={{ y: massDrift }} />
        <motion.path d={wisp} fill="rgba(45, 66, 94, 0.85)" />

        {/* completion: the ridge catches the light; the porch light comes on */}
        <motion.path d={RIDGE_CAP} fill="var(--wr-accent)" style={{ opacity: ridgeGlow }} />
        <motion.circle cx="500" cy="470" r="7" fill="var(--wr-accent)" style={{ opacity: porchLight }} />
        <motion.circle cx="500" cy="470" r="16" fill="var(--wr-accent-glow)" style={{ opacity: porchLight }} />
      </svg>
    </div>
  );
}
