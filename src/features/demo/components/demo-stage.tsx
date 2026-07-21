"use client";

/**
 * The Reveal stage (ADR-055): Before over After, one founder tap, a
 * film-style hand-over. CSS techniques only — animated clip-path wipe with
 * a soft light edge, a slow push on the Before, a rise-and-settle on the
 * build. Compositor-friendly (transform/opacity/clip-path); mid-range
 * phones stay smooth; reduced motion gets a plain crossfade. The WebGL
 * morph (ADR-041) stays retired.
 */

import { useState, type ReactNode } from "react";
import { Play, RotateCcw } from "lucide-react";

const STAGE_CSS = `
.demo-stage { position: fixed; inset: 0; overflow: hidden; background: #0a0c10; }
.demo-after { position: absolute; inset: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.demo-before {
  position: absolute; inset: 0; z-index: 20; display: grid; place-items: center;
  background: #0f1218;
  transition: none;
}
.demo-stage[data-state="revealing"] .demo-before {
  animation: demo-before-exit 1.7s cubic-bezier(0.7, 0, 0.2, 1) forwards;
}
.demo-stage[data-state="revealed"] .demo-before { display: none; }
@keyframes demo-before-exit {
  0%   { clip-path: inset(0 0 0 0); transform: scale(1); filter: brightness(1) saturate(1); }
  28%  { clip-path: inset(0 0 0 0); transform: scale(1.035); filter: brightness(1.06) saturate(0.9); }
  100% { clip-path: inset(0 0 0 100%); transform: scale(1.06); filter: brightness(0.85) saturate(0.55); }
}
.demo-sweep {
  position: absolute; inset: 0; z-index: 30; pointer-events: none; opacity: 0;
  background: linear-gradient(100deg, transparent 42%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.12) 56%, transparent 64%);
  transform: translateX(-120%) skewX(-6deg); will-change: transform;
}
.demo-stage[data-state="revealing"] .demo-sweep {
  animation: demo-sweep 1.7s cubic-bezier(0.7, 0, 0.2, 1) forwards;
}
@keyframes demo-sweep {
  0% { opacity: 0; transform: translateX(-120%) skewX(-6deg); }
  22% { opacity: 1; }
  100% { opacity: 0; transform: translateX(130%) skewX(-6deg); }
}
.demo-stage[data-state="revealing"] .demo-after .demo-rise {
  animation: demo-rise 1.9s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes demo-rise {
  0% { transform: translateY(26px) scale(0.985); opacity: 0.65; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .demo-stage[data-state="revealing"] .demo-before { animation: demo-crossfade 0.9s ease forwards; }
  .demo-stage[data-state="revealing"] .demo-sweep { animation: none; }
  .demo-stage[data-state="revealing"] .demo-after .demo-rise { animation: none; }
  @keyframes demo-crossfade { to { opacity: 0; } }
}
.demo-controls {
  position: fixed; z-index: 40; inset-inline: 0; bottom: max(1rem, env(safe-area-inset-bottom));
  display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.5rem;
  padding-inline: 1rem; pointer-events: none;
}
.demo-controls > * { pointer-events: auto; }
`;

export function DemoStage({
  before,
  after,
  controls,
}: {
  /** The Before layer (capture card or presence card). */
  before: ReactNode;
  /** The rendered TITAN build. */
  after: ReactNode;
  /** Variant pills + save — always visible to the founder. */
  controls?: ReactNode;
}) {
  const [state, setState] = useState<"before" | "revealing" | "revealed">("before");

  return (
    <div className="demo-stage" data-state={state} data-demo-stage>
      <style dangerouslySetInnerHTML={{ __html: STAGE_CSS }} />
      <div className="demo-after" aria-hidden={state === "before"}>
        <div className="demo-rise">{after}</div>
      </div>
      <div className="demo-before" onAnimationEnd={() => setState("revealed")}>
        {before}
      </div>
      <div className="demo-sweep" aria-hidden />
      <div className="demo-controls">
        {state === "before" ? (
          <button
            type="button"
            onClick={() => setState("revealing")}
            data-demo-reveal
            className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-2xl active:scale-95"
          >
            <Play className="size-4" />
            Reveal
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setState("before")}
              className="flex items-center gap-2 rounded-full border border-white/25 bg-black/50 px-4 py-2 text-xs font-medium text-white backdrop-blur"
            >
              <RotateCcw className="size-3.5" />
              Again
            </button>
            {controls}
          </>
        )}
      </div>
    </div>
  );
}
