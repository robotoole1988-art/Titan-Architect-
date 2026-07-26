/**
 * Typing cadence (ADR-057) — server-safe on purpose.
 *
 * The page (a server component) computes the staged-reveal delays from the
 * same constants the client typing effect uses. This module carries no
 * "use client" directive so both sides may import it; the M2 verification
 * failure ("Attempted to call typingDurationMs() from the server but it is
 * on the client") is the reason it lives here and not in the component.
 */

export const CHAR_MS = 16;
export const LINE_GAP_MS = 380;

/** Total typing time — the server uses this to stage later sections. */
export function typingDurationMs(lines: readonly string[]): number {
  const chars = lines.reduce((sum, line) => sum + line.length, 0);
  return chars * CHAR_MS + lines.length * LINE_GAP_MS;
}
