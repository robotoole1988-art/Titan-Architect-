"use client";

/**
 * Live updating, honestly (ADR-057): the pulse strip stays current by
 * re-running the real server queries — router.refresh() on a quiet 60s
 * cadence, paused while the tab is hidden. No client-side counters ever
 * tick a number the server didn't measure.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_MS = 60_000;

export function PulseRefresh() {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!document.hidden) router.refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [router]);
  return null;
}
