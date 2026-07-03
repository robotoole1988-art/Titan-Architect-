/**
 * Renderer typography — the premium pairing, self-hosted via next/font.
 *
 * Display: Bricolage Grotesque — characterful, confident, superb at large
 * optical sizes; urgency without shouting. Body: Instrument Sans — warm,
 * highly legible grotesque for copy at arm's length. Annotations: Spline Sans
 * Mono — the "architect's pencil" for slot/media-brief labels.
 *
 * IMPORTANT: next/font only works inside the Next.js build. Only the preview
 * page imports this module; renderPage and the primitives reference the
 * --wr-font-* variables so they stay testable outside Next (ADR-022).
 */

import {
  Bricolage_Grotesque,
  Instrument_Sans,
  Spline_Sans_Mono,
} from "next/font/google";

// Display + body are preloaded so the hero paints ONCE, in its final faces —
// a late swap re-wraps the huge display headline and shifts the centred hero
// (CLS). The mono annotation face is not worth the critical path.
// Preload + display:"optional": the faces are fetched ahead of first paint,
// so virtually every visit renders them from the first frame; on a genuinely
// cold, slow connection the metric-adjusted fallback stands for that view.
// Crucially the huge display headline NEVER swaps mid-view — no re-wrap, no
// layout shift, no late LCP re-candidate.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--wr-font-display",
  weight: "variable",
  display: "optional",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--wr-font-body",
  weight: "variable",
  display: "optional",
});

const mono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--wr-font-mono",
  weight: ["400"],
  // optional + no preload: annotations must never nudge the hero copy with a
  // late swap; the ui-monospace fallback is a fine architect's pencil.
  display: "optional",
  preload: false,
});

/** Class applying all three font variables to a subtree. */
export const rendererFontClass = `${display.variable} ${body.variable} ${mono.variable}`;
