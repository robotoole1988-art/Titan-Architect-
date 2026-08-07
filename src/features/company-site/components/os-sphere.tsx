import { buildSphereScene } from "../model/sphere";

/**
 * The OS sphere, rendered (ADR-064) — the approved hero, as inline SVG.
 *
 * Server component, zero JavaScript, no image request: the geometry comes
 * precomputed from `model/sphere.ts` and every visit draws the identical
 * sphere. Motion is CSS only — the orbit highlight travels, the core
 * breathes, the link mesh shimmers — and every keyframe sits behind a
 * `prefers-reduced-motion: no-preference` guard, so the reduced experience
 * is the designed still, not a broken animation (the arrival page's
 * pattern, kept).
 */

const SCENE = buildSphereScene();

const GRADS = ["ts-g0", "ts-g1", "ts-g2"] as const;

function Cloud({ points }: { points: ReadonlyArray<{ x: number; y: number; r: number; o: number; g: 0 | 1 | 2 }> }) {
  return (
    <>
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r * 2}
          opacity={p.o}
          fill={`url(#${GRADS[p.g]})`}
        />
      ))}
    </>
  );
}

export function OsSphere() {
  const s = SCENE;
  return (
    <div aria-hidden="true" className="pointer-events-none select-none">
      <style>{`
@media (prefers-reduced-motion: no-preference) {
  .ts-orbit { animation: ts-orbit 44s linear infinite; transform-origin: ${s.cx}px ${s.cy}px; }
  .ts-core { animation: ts-core 7s ease-in-out infinite alternate; }
  .ts-la { animation: ts-shim 9s ease-in-out infinite alternate; }
  .ts-lb { animation: ts-shim 13s ease-in-out -4s infinite alternate; }
  @keyframes ts-orbit { to { transform: rotate(360deg); } }
  @keyframes ts-core { from { opacity: 0.72; } to { opacity: 1; } }
  @keyframes ts-shim { from { opacity: 0.5; } to { opacity: 0.95; } }
}
`}</style>
      <svg
        viewBox={`0 0 ${s.w} ${s.h}`}
        className="h-auto w-full"
        role="presentation"
        focusable="false"
      >
        <defs>
          <radialGradient id="ts-g0">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#a8dbff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a8dbff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ts-g1">
            <stop offset="0%" stopColor="#dbeaff" />
            <stop offset="35%" stopColor="#5b96ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#5b96ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ts-g2">
            <stop offset="0%" stopColor="#9db9f2" />
            <stop offset="40%" stopColor="#3566e8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3566e8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ts-amb">
            <stop offset="0%" stopColor="#3c60cd" stopOpacity="0.34" />
            <stop offset="55%" stopColor="#16265f" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ts-corg">
            <stop offset="0%" stopColor="#f2f8ff" stopOpacity="0.95" />
            <stop offset="32%" stopColor="#9cc4ff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#9cc4ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ts-floor">
            <stop offset="0%" stopColor="#4678ff" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#2846aa" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ambient room glow */}
        <circle cx={s.cx} cy={s.cy} r={s.s * 2.2} fill="url(#ts-amb)" />

        {/* dais */}
        <ellipse cx={s.cx} cy={s.daisY} rx={s.s * 1.7} ry={s.s * 0.31} fill="url(#ts-floor)" />
        <ellipse cx={s.cx} cy={s.daisY} rx={s.s * 1.5} ry={s.s * 0.27} fill="none" stroke="#78a5ff" strokeOpacity="0.45" strokeWidth="1.2" />
        <ellipse cx={s.cx} cy={s.daisY} rx={s.s * 1.18} ry={s.s * 0.21} fill="none" stroke="#78a5ff" strokeOpacity="0.28" strokeWidth="1" />
        <ellipse cx={s.cx} cy={s.daisY} rx={s.s * 0.88} ry={s.s * 0.16} fill="none" stroke="#78a5ff" strokeOpacity="0.18" strokeWidth="1" />

        {/* the mass — back, mesh, front, core */}
        <g>
          <Cloud points={s.back} />
        </g>
        <path d={s.chords} className="ts-la" stroke="#78aaff" strokeOpacity="0.22" strokeWidth="0.9" fill="none" />
        <path d={s.linksA} className="ts-la" stroke="#7cabff" strokeOpacity="0.42" strokeWidth="1" fill="none" />
        <path d={s.linksB} className="ts-lb" stroke="#7cabff" strokeOpacity="0.34" strokeWidth="1" fill="none" />
        <g>
          <Cloud points={s.front} />
        </g>
        <circle className="ts-core" cx={s.cx} cy={s.cy} r={s.s * 0.52} fill="url(#ts-corg)" />

        {/* tilted orbit ring; the bright arc travels by CSS */}
        <ellipse
          cx={s.cx}
          cy={s.cy}
          rx={s.s * 1.32}
          ry={s.s * 0.375}
          transform={`rotate(-18 ${s.cx} ${s.cy})`}
          fill="none"
          stroke="#82adff"
          strokeOpacity="0.22"
          strokeWidth="1"
        />
        <g className="ts-orbit">
          <ellipse
            cx={s.cx}
            cy={s.cy}
            rx={s.s * 1.32}
            ry={s.s * 0.375}
            transform={`rotate(-18 ${s.cx} ${s.cy})`}
            fill="none"
            stroke="#c3d9ff"
            strokeOpacity="0.55"
            strokeWidth="1.6"
            strokeDasharray="120 1400"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
