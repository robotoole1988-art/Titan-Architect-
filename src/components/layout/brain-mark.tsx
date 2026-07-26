/**
 * The Brain mark (ADR-057) — the persistent way home.
 *
 * A small breathing point, top-left on every Operations page, that returns
 * to the Command Centre. Layer 2 always carries the way back to Layer 1.
 */

import Link from "next/link";

export function BrainMark() {
  return (
    <Link
      href="/"
      aria-label="Command Centre"
      data-brain-mark
      className="group flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent/60"
    >
      <span className="relative flex size-3 items-center justify-center">
        <span className="absolute size-3 rounded-full bg-sky-300/25 motion-safe:animate-ping motion-safe:[animation-duration:3s]" />
        <span className="size-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_2px_rgba(125,168,255,0.5)] transition-transform group-hover:scale-125" />
      </span>
    </Link>
  );
}
