/**
 * THE FILM SWITCH (founder decision 2026-07-28; Performance Law, media law).
 *
 * Published sites ship IMAGE-ONLY heroes by default: the Ken Burns drift on
 * a top-quality still IS the cinema, at ~1% of the bytes of film. The
 * ambient-film engine (ADR-036) stays fully intact behind this flag so film
 * can be re-enabled deliberately — per deployment today via
 * NEXT_PUBLIC_AMBIENT_FILM=1; per site once the publication record carries a
 * premium-media flag — always within the ≤2.5MB film budget.
 *
 * Default: OFF. Nothing renders, nothing downloads, zero video bytes.
 */
export function ambientFilmEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AMBIENT_FILM === "1";
}
