"use client";

/**
 * AmbientFilm (ADR-036): the hero ambience clip, LCP-safe.
 *
 * The still poster (a sibling CinematicImage) is the LCP and is ALWAYS
 * present. This layer is CLIENT-ONLY: it returns null during SSR and the
 * initial render, so no <video> ever reaches the server markup. After first
 * idle — and only on a capable device that is not prefers-reduced-motion,
 * not Save-Data, not a slow/low-memory device — the muted looping clip
 * lazy-loads and cross-fades in over the poster. Everyone else keeps the
 * still forever.
 */

import { useEffect, useRef, useState } from "react";
import type { ResolvedMediaAsset } from "../model/types";

const AMBIENT_FILM_CSS = `
.wr-film { opacity: 0; transition: opacity 1.4s ease-in-out; will-change: opacity; }
.wr-film[data-playing="true"] { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .wr-film { display: none; } }
`;

interface NavigatorLike {
  connection?: { saveData?: boolean; effectiveType?: string };
  deviceMemory?: number;
}

export function AmbientFilm({
  film,
  className = "",
}: {
  film: ResolvedMediaAsset;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nav = navigator as Navigator & NavigatorLike;
    const saveData = nav.connection?.saveData === true;
    const slow = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
    const lowMem = typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
    // Reduced-motion / reduced-data / low-tier: the still poster stays.
    if (reduceMotion || saveData || slow || lowMem) return;

    let idleId: number | undefined;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    const start = () => setMounted(true);
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    // Lazy: only after first idle, so the LCP (the poster) is untouched.
    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(start, { timeout: 2500 });
    } else {
      timerId = setTimeout(start, 1200);
    }
    return () => {
      if (idleId !== undefined) win.cancelIdleCallback?.(idleId);
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: AMBIENT_FILM_CSS }} />
      <video
        ref={videoRef}
        className={`wr-film absolute inset-0 h-full w-full object-cover ${className}`}
        data-playing={playing}
        src={film.url}
        poster={film.posterUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        onCanPlay={() => {
          videoRef.current?.play().catch(() => {});
          setPlaying(true);
        }}
      />
    </>
  );
}
