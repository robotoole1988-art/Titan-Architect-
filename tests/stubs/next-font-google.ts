/**
 * Vitest stub for next/font/google — next/font only works inside the Next.js
 * build (it compiles font loading via SWC). Tests exercise the renderer's
 * markup, not font loading; components reference --wr-font-* CSS variables.
 */

interface FontStub {
  variable: string;
  className: string;
  style: Record<string, never>;
}

function fontStub(): FontStub {
  return { variable: "", className: "", style: {} };
}

export const Bricolage_Grotesque = fontStub;
export const Instrument_Sans = fontStub;
export const Spline_Sans_Mono = fontStub;
export const Fraunces = fontStub;
