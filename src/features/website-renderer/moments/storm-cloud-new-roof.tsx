/**
 * SIGNATURE MOMENT: Storm Cloud → New Roof (ADR-032, roofing).
 *
 * Act I → Act III in one held scroll: the storm mass over the property
 * gathers itself and BECOMES the roofline — the threat literally turns into
 * the protection. Pure SVG path interpolation (both states authored with
 * identical command structure); rain dissolves as the roof completes; the
 * property reveals beneath; one amber porch light comes on last.
 *
 * v2 (the JS diet): the whole cinematic is a CSS scroll-driven animation —
 * a named view timeline on the moment layer drives per-element keyframes,
 * including the `d: path()` morph. ZERO JavaScript. The element markup is
 * authored at the FINISHED state (the designed still), so browsers without
 * scroll-driven animation support — and prefers-reduced-motion — simply see
 * the calm ending: the finished roof, porch light on.
 */

/* Both paths: M + 6 cubic segments + Z — identical structure, so the CSS
   `d` interpolation morphs them number-for-number.

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

/**
 * The choreography. Every element is authored at its END state; keyframes
 * (progress fractions from the original scroll mapping) run only where
 * scroll-driven animations AND `d` interpolation are supported.
 */
const STORM_CSS = `
.wr-sm { view-timeline: --wr-sm block; }
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) and (d: path("M 0,0 L 1,1 Z")) {
    .wr-sm-tint, .wr-sm-flash, .wr-sm-house, .wr-sm-rain, .wr-sm-mass,
    .wr-sm-wisp, .wr-sm-ridge, .wr-sm-porch {
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --wr-sm;
      animation-range: exit 0% exit 100%;
    }
    .wr-sm-tint { animation-name: wr-sm-tint; }
    .wr-sm-flash { animation-name: wr-sm-flash; }
    .wr-sm-house { animation-name: wr-sm-house; }
    .wr-sm-rain { animation-name: wr-sm-rain; }
    .wr-sm-mass { animation-name: wr-sm-mass; }
    .wr-sm-wisp { animation-name: wr-sm-wisp; }
    .wr-sm-ridge { animation-name: wr-sm-ridge; }
    .wr-sm-porch { animation-name: wr-sm-porch; }
  }
}
/* Act I atmosphere: a storm-heavy tint that lifts as the roof forms. */
.wr-sm-tint { opacity: 0; }
@keyframes wr-sm-tint {
  0%, 15% { opacity: 0.72; }
  85%, 100% { opacity: 0; }
}
/* A held flash at the storm's peak — Act I punctuation, gone by mid-morph.
   Capped so it never white-outs the headline (ADR-034 discipline). */
.wr-sm-flash { opacity: 0; }
@keyframes wr-sm-flash {
  0%, 8% { opacity: 0; }
  14% { opacity: 0.38; }
  20% { opacity: 0.08; }
  30%, 100% { opacity: 0; }
}
/* The protected home, revealed as the roof completes. */
@keyframes wr-sm-house {
  0%, 55% { opacity: 0; translate: 0 26px; }
  85%, 100% { opacity: 1; translate: 0 0; }
}
/* Rain — dissolves as the threat becomes the protection. */
.wr-sm-rain { opacity: 0; }
@keyframes wr-sm-rain {
  0% { opacity: 0.5; }
  45%, 100% { opacity: 0; }
}
/* THE MORPH: the storm mass becomes the roofline (with a slow drift while
   it is still weather — clouds move). */
@keyframes wr-sm-mass {
  0%, 5% { d: path("${CLOUD_MASS}"); translate: 0 0; }
  35% { translate: 0 10px; }
  75%, 100% { d: path("${ROOF_MASS}"); translate: 0 0; }
}
@keyframes wr-sm-wisp {
  0%, 15% { d: path("${CLOUD_WISP}"); }
  80%, 100% { d: path("${RIDGE_CAP}"); }
}
/* Completion: the ridge catches the light; the porch light comes on. */
@keyframes wr-sm-ridge {
  0%, 78% { opacity: 0; }
  95%, 100% { opacity: 0.95; }
}
@keyframes wr-sm-porch {
  0%, 86% { opacity: 0; }
  97%, 100% { opacity: 0.9; }
}
`;

export function StormCloudNewRoof({ hasBackdrop = false }: { hasBackdrop?: boolean } = {}) {
  return (
    <div className="wr-sm absolute inset-0">
      <style dangerouslySetInnerHTML={{ __html: STORM_CSS }} />
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
        <rect className="wr-sm-tint" x="0" y="0" width="1000" height="620" fill="rgba(8, 12, 20, 1)" />
        <rect className="wr-sm-flash" x="0" y="0" width="1000" height="620" fill="rgba(214, 230, 250, 1)" />

        {!hasBackdrop && (
          <g className="wr-sm-house">
            {/* the protected home, revealed as the roof completes */}
            <rect x="270" y="350" width="460" height="230" rx="4" fill="rgba(19, 30, 47, 0.92)" />
            <rect x="322" y="402" width="86" height="70" rx="3" fill="rgba(127, 180, 232, 0.16)" stroke="rgba(127, 180, 232, 0.28)" strokeWidth="2" />
            <rect x="592" y="402" width="86" height="70" rx="3" fill="rgba(127, 180, 232, 0.16)" stroke="rgba(127, 180, 232, 0.28)" strokeWidth="2" />
            <rect x="462" y="440" width="76" height="140" rx="3" fill="rgba(30, 44, 66, 1)" stroke="rgba(148, 163, 184, 0.2)" strokeWidth="2" />
          </g>
        )}

        {/* rain — dissolves as the threat becomes the protection */}
        <g
          className="wr-sm-rain"
          stroke="rgba(148, 178, 214, 0.55)"
          strokeWidth="2"
          strokeLinecap="round"
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
        </g>

        {/* THE MORPH: the storm mass becomes the roofline. The vertical
            gradient gives the mass a lit top and a heavy belly — weather,
            not a smudge; the same light reads as sky on the finished roof. */}
        <path className="wr-sm-mass" d={ROOF_MASS} fill="url(#storm-mass)" />
        <path className="wr-sm-wisp" d={RIDGE_CAP} fill="rgba(45, 66, 94, 0.85)" />

        {/* completion: the ridge catches the light; the porch light comes on */}
        <path className="wr-sm-ridge" d={RIDGE_CAP} fill="var(--wr-accent)" />
        <circle className="wr-sm-porch" cx="500" cy="470" r="7" fill="var(--wr-accent)" />
        <circle className="wr-sm-porch" cx="500" cy="470" r="16" fill="var(--wr-accent-glow)" />
      </svg>
    </div>
  );
}
