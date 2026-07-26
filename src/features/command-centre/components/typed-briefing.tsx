"use client";

/**
 * The typed briefing (ADR-057) — the Brain speaks first, in type.
 *
 * Sentences arrive character by character with a soft caret, exactly the v5
 * choreography. prefers-reduced-motion (or JS unavailable) renders the full
 * text immediately — the room degrades to stillness, never to absence.
 */

import { useEffect, useMemo, useState } from "react";

const CHAR_MS = 16;
const LINE_GAP_MS = 380;

/** Total typing time — the server uses this to stage later sections. */
export function typingDurationMs(lines: readonly string[]): number {
  const chars = lines.reduce((sum, line) => sum + line.length, 0);
  return chars * CHAR_MS + lines.length * LINE_GAP_MS;
}

export function TypedBriefing({ lines }: { lines: readonly string[] }) {
  const fullText = useMemo(() => lines.join("\n"), [lines]);
  const [visibleChars, setVisibleChars] = useState<number | null>(null);

  useEffect(() => {
    // Reduced motion: no timer ever starts; the server-rendered full text
    // stands. Otherwise all state updates happen inside timer callbacks —
    // the brief pre-tick frame is hidden under the room's 2.2s fade-in.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let position = 0;
    let timer: number;
    function tick(): void {
      setVisibleChars(position);
      if (position >= fullText.length) return;
      const gap = position > 0 && fullText[position - 1] === "\n" ? LINE_GAP_MS : CHAR_MS;
      position += 1;
      timer = window.setTimeout(tick, gap);
    }
    timer = window.setTimeout(tick, 500);
    return () => window.clearTimeout(timer);
  }, [fullText]);

  // Server render + no-JS fallback: the complete briefing, no caret.
  const shown = visibleChars === null ? fullText : fullText.slice(0, visibleChars);
  const typing = visibleChars !== null && visibleChars < fullText.length;

  return (
    <p
      data-briefing-speech
      aria-label={fullText}
      className="min-h-[5.5rem] whitespace-pre-line text-[17px] font-light leading-[1.72] text-[#dbe2ec]"
    >
      <span aria-hidden="true">{shown}</span>
      {typing && (
        <span className="ml-0.5 inline-block h-[1.05em] w-px translate-y-0.5 animate-pulse bg-[#7fa8ff]" />
      )}
    </p>
  );
}
