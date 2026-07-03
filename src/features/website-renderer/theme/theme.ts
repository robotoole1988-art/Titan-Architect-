/**
 * Renderer theme layer — design tokens as CSS custom properties.
 *
 * A theme is a named token set (colour roles, accent, surfaces) selected by
 * the blueprint's `designSystem.themeRef` (emitted deterministically by the
 * builder as `titan-<archetype>`). The renderer never invents colour per
 * business — it realises the archetype's emotional register.
 *
 * The fluid type scale and spacing are shared across themes; fonts are
 * supplied by the preview page via next/font variables (--wr-font-*), so this
 * module stays importable outside a Next build (tests).
 */

export interface RendererTheme {
  /** Matches blueprint.designSystem.themeRef, e.g. "titan-emergency". */
  readonly ref: string;
  readonly name: string;
  /** CSS custom properties applied to the rendered page root. */
  readonly vars: Readonly<Record<string, string>>;
}

/** Shared scale tokens (fluid, mobile-first). */
const SCALE_VARS: Record<string, string> = {
  // Type scale — clamp(min, fluid, max)
  "--wr-text-xs": "0.75rem",
  "--wr-text-sm": "0.875rem",
  "--wr-text-base": "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)",
  "--wr-text-lg": "clamp(1.125rem, 1.05rem + 0.4vw, 1.3rem)",
  "--wr-text-xl": "clamp(1.35rem, 1.2rem + 0.8vw, 1.75rem)",
  "--wr-text-2xl": "clamp(1.7rem, 1.4rem + 1.5vw, 2.4rem)",
  "--wr-text-3xl": "clamp(2.1rem, 1.6rem + 2.6vw, 3.4rem)",
  "--wr-text-display": "clamp(2.6rem, 1.8rem + 4.4vw, 5rem)",
  // Spacing rhythm
  "--wr-space-section": "clamp(4.5rem, 3rem + 6vw, 8.5rem)",
  "--wr-space-gutter": "clamp(1.25rem, 4vw, 3rem)",
  "--wr-measure": "38rem",
  "--wr-radius": "1.25rem",
  "--wr-radius-lg": "2rem",
};

/**
 * "Calm in the storm" — the emergency archetype. A storm-dark cinematic
 * ground, steadying slate blues, and ONE high-visibility amber signal reserved
 * for the call to action. High contrast, legible at arm's length in a hurry.
 */
const TITAN_EMERGENCY: RendererTheme = {
  ref: "titan-emergency",
  name: "Calm in the Storm",
  vars: {
    ...SCALE_VARS,
    "--wr-bg": "#080b12",
    "--wr-bg-raised": "#0d1320",
    "--wr-storm-1": "#16233a",
    "--wr-storm-2": "#0b1a2e",
    "--wr-ink": "#f2f5fa",
    "--wr-ink-muted": "rgba(200, 212, 229, 0.68)",
    "--wr-ink-faint": "rgba(200, 212, 229, 0.42)",
    "--wr-line": "rgba(148, 163, 184, 0.16)",
    "--wr-line-strong": "rgba(148, 163, 184, 0.3)",
    "--wr-surface": "rgba(255, 255, 255, 0.035)",
    "--wr-surface-raised": "rgba(255, 255, 255, 0.06)",
    "--wr-accent": "#ffb224",
    "--wr-accent-strong": "#ff9d0a",
    "--wr-accent-ink": "#1d1302",
    "--wr-accent-glow": "rgba(255, 178, 36, 0.28)",
    "--wr-calm": "#7fb4e8",
    "--wr-ok": "#4ade80",
  },
};

/** Restrained fallback for archetypes without a crafted theme yet. */
const TITAN_DEFAULT: RendererTheme = {
  ref: "titan-general",
  name: "TITAN Default",
  vars: {
    ...SCALE_VARS,
    "--wr-bg": "#0b0d10",
    "--wr-bg-raised": "#11141a",
    "--wr-storm-1": "#1a2230",
    "--wr-storm-2": "#121a26",
    "--wr-ink": "#f3f4f6",
    "--wr-ink-muted": "rgba(209, 213, 219, 0.68)",
    "--wr-ink-faint": "rgba(209, 213, 219, 0.42)",
    "--wr-line": "rgba(156, 163, 175, 0.16)",
    "--wr-line-strong": "rgba(156, 163, 175, 0.3)",
    "--wr-surface": "rgba(255, 255, 255, 0.035)",
    "--wr-surface-raised": "rgba(255, 255, 255, 0.06)",
    "--wr-accent": "#e8b45a",
    "--wr-accent-strong": "#dfa63f",
    "--wr-accent-ink": "#1c1403",
    "--wr-accent-glow": "rgba(232, 180, 90, 0.25)",
    "--wr-calm": "#9db8d6",
    "--wr-ok": "#4ade80",
  },
};

const THEMES: Readonly<Record<string, RendererTheme>> = {
  [TITAN_EMERGENCY.ref]: TITAN_EMERGENCY,
  [TITAN_DEFAULT.ref]: TITAN_DEFAULT,
};

/** Resolve a blueprint themeRef to a theme; unknown refs use the default. */
export function resolveTheme(themeRef: string | undefined): RendererTheme {
  return (themeRef && THEMES[themeRef]) || TITAN_DEFAULT;
}
