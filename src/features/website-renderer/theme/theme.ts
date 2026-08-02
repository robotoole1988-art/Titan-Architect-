/**
 * Renderer theme layer — design tokens as CSS custom properties.
 *
 * A theme is a named token set (colour roles, accent, surfaces) selected by
 * the blueprint's `designSystem.themeRef` (emitted deterministically by the
 * builder as `titan-<archetype>`).
 *
 * The archetype fixes the emotional REGISTER; the business picks a VARIATION
 * within it (ADR-063). This file used to say "the renderer never invents
 * colour per business — it realises the archetype's emotional register", and
 * that principle held right up until it was measured: five roofers in three
 * towns produced one identical site. An emergency site is still storm-dark
 * and urgent — it is simply no longer the same storm-dark as the roofer down
 * the road. The register is the archetype's; the shade is the business's.
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

/**
 * "Golden Hour" — the project/premium archetypes (ADR-029). These trades sell
 * aspiration: premium home transformation at golden hour. Warm limestone
 * light (the first LIGHT theme), espresso editorial ink, generous whitespace,
 * ONE confident burnt-bronze accent. Scene tones are golden-hour stone so
 * every art-directed media frame carries the mood without photography.
 */
const TITAN_PREMIUM: RendererTheme = {
  ref: "titan-premium",
  name: "Golden Hour",
  vars: {
    ...SCALE_VARS,
    "--wr-bg": "#f6f2ea",
    "--wr-bg-raised": "#efe8db",
    "--wr-storm-1": "#e8d5b5",
    "--wr-storm-2": "#c9a97e",
    "--wr-ink": "#241f18",
    "--wr-ink-muted": "rgba(62, 52, 39, 0.72)",
    "--wr-ink-faint": "rgba(62, 52, 39, 0.46)",
    "--wr-line": "rgba(90, 74, 54, 0.15)",
    "--wr-line-strong": "rgba(90, 74, 54, 0.3)",
    "--wr-surface": "rgba(38, 30, 20, 0.04)",
    "--wr-surface-raised": "rgba(38, 30, 20, 0.07)",
    "--wr-accent": "#b4602f",
    "--wr-accent-strong": "#9c4e22",
    "--wr-accent-ink": "#fdf6ec",
    "--wr-accent-glow": "rgba(180, 96, 47, 0.24)",
    "--wr-calm": "#7d8b74",
    "--wr-ok": "#3f7d54",
  },
};

/**
 * "Quiet Confidence" — the care/trust archetype (ADR-043). Trust-led trades
 * (dentists, healthcare, vets, solicitors, accountants) close on credibility
 * and reassurance, not urgency or luxury. A calm, clean, cool register: soft
 * sage-grey paper with near-white cards (light and breathing room), a deep
 * forest-slate ink (warm, human, authoritative), and ONE calm eucalyptus accent
 * for trust — never amber, never bronze. Headings take a serif (Fraunces via
 * --wr-font-display override) for quiet, established credibility; the body stays
 * the humanist Instrument Sans. Scene tones are sage → eucalyptus so every media
 * frame carries the calm mood without photography.
 */
const TITAN_CARE: RendererTheme = {
  ref: "titan-care",
  name: "Quiet Confidence",
  vars: {
    ...SCALE_VARS,
    "--wr-bg": "#eef3ef",
    "--wr-bg-raised": "#f9fbf9",
    "--wr-storm-1": "#dbe8df",
    "--wr-storm-2": "#b7d0c2",
    "--wr-ink": "#1a2b27",
    "--wr-ink-muted": "rgba(26, 43, 39, 0.7)",
    "--wr-ink-faint": "rgba(26, 43, 39, 0.46)",
    "--wr-line": "rgba(26, 61, 50, 0.14)",
    "--wr-line-strong": "rgba(26, 61, 50, 0.26)",
    "--wr-surface": "rgba(26, 61, 50, 0.035)",
    "--wr-surface-raised": "rgba(26, 61, 50, 0.06)",
    "--wr-accent": "#2f6f5b",
    "--wr-accent-strong": "#245a49",
    "--wr-accent-ink": "#f4f9f5",
    "--wr-accent-glow": "rgba(47, 111, 91, 0.22)",
    "--wr-calm": "#4f7f96",
    "--wr-ok": "#3f7d54",
    // Headings speak with the quiet credibility of a serif; body stays humanist.
    "--wr-font-display": "var(--wr-font-serif, 'Fraunces', Georgia, 'Times New Roman', serif)",
  },
};

/**
 * "Live Wire" — the technical/skilled-trades archetype (ADR-044). Skilled and
 * energy-tech installers (electricians, HVAC, solar, battery, EV) sell on
 * capability, certification, and clean workmanship. A modern, precise,
 * ENGINEERED register: a crisp cool-white/blue-grey ground and near-white cards
 * (reliable and clean), a deep ink-navy, and ONE confident electric-blue signal
 * accent (energy & trust) with a supporting energy-teal. Mono labels (kW
 * figures, spec/eyebrow text) read like a spec sheet. Distinct from storm
 * (dark/amber), Golden Hour (warm/bronze), and care (sage/serif): cool, crisp,
 * electric. Scene tones are blueprint blue-grey so media frames read engineered.
 */
const TITAN_TECHNICAL: RendererTheme = {
  ref: "titan-technical",
  name: "Live Wire",
  vars: {
    ...SCALE_VARS,
    "--wr-bg": "#eef2f7",
    "--wr-bg-raised": "#ffffff",
    "--wr-storm-1": "#d9e5f5",
    "--wr-storm-2": "#b3cbec",
    "--wr-ink": "#152131",
    "--wr-ink-muted": "rgba(21, 33, 49, 0.68)",
    "--wr-ink-faint": "rgba(21, 33, 49, 0.44)",
    "--wr-line": "rgba(21, 44, 82, 0.14)",
    "--wr-line-strong": "rgba(21, 44, 82, 0.26)",
    "--wr-surface": "rgba(21, 44, 82, 0.035)",
    "--wr-surface-raised": "rgba(21, 44, 82, 0.06)",
    "--wr-accent": "#1f6feb",
    "--wr-accent-strong": "#1858c4",
    "--wr-accent-ink": "#f1f7ff",
    "--wr-accent-glow": "rgba(31, 111, 235, 0.26)",
    "--wr-calm": "#1f9c95",
    "--wr-ok": "#2f9265",
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

/**
 * ACCENT VARIATIONS (ADR-063) — the business's signature colour, chosen
 * within the archetype's register so the emotional read never changes. Every
 * set here has been picked to sit inside its theme's world: the emergency
 * sets are all high-visibility warm signals, the care sets are all calm and
 * cool, and none of them is amber where amber would read as urgency.
 */
interface AccentSet {
  readonly id: string;
  readonly vars: Readonly<Record<string, string>>;
}

function accent(
  id: string,
  base: string,
  strong: string,
  ink: string,
  glow: string,
): AccentSet {
  return {
    id,
    vars: {
      "--wr-accent": base,
      "--wr-accent-strong": strong,
      "--wr-accent-ink": ink,
      "--wr-accent-glow": glow,
    },
  };
}

const PREMIUM_ACCENTS: ReadonlyArray<AccentSet> = [
  accent("bronze", "#b4602f", "#9c4e22", "#fdf6ec", "rgba(180, 96, 47, 0.24)"),
  accent("terracotta", "#c2532f", "#a94324", "#fdf4ee", "rgba(194, 83, 47, 0.24)"),
  accent("olive-bronze", "#8a6a2f", "#745724", "#fbf7ec", "rgba(138, 106, 47, 0.24)"),
  accent("clay", "#a1483c", "#8a3a30", "#fdf2f0", "rgba(161, 72, 60, 0.24)"),
  accent("umber", "#8c5a3c", "#754930", "#fcf5ef", "rgba(140, 90, 60, 0.24)"),
  accent("brass", "#a97b30", "#8f6626", "#fdf8ec", "rgba(169, 123, 48, 0.24)"),
];

const ACCENTS: Readonly<Record<string, ReadonlyArray<AccentSet>>> = {
  "titan-emergency": [
    accent("amber", "#ffb224", "#ff9d0a", "#1d1302", "rgba(255, 178, 36, 0.28)"),
    accent("signal", "#ff7a2f", "#f2610f", "#1d0e02", "rgba(255, 122, 47, 0.28)"),
    accent("ember", "#f4573c", "#dc4126", "#1f0a05", "rgba(244, 87, 60, 0.28)"),
    accent("hi-vis", "#ffd23f", "#f5bd10", "#201804", "rgba(255, 210, 63, 0.28)"),
    accent("sunset", "#ff9052", "#f57531", "#1f0f04", "rgba(255, 144, 82, 0.28)"),
    accent("beacon", "#ffc65c", "#f9ae2b", "#1e1503", "rgba(255, 198, 92, 0.28)"),
  ],
  "titan-premium": PREMIUM_ACCENTS,
  // titan-project renders the Golden Hour token set under its own ref
  // (THEMES spreads TITAN_PREMIUM with ref: "titan-project"), so it must
  // share the register's accents — without this it silently fell through to
  // the general theme's copper and sage on a warm limestone ground.
  "titan-project": PREMIUM_ACCENTS,
  "titan-care": [
    accent("eucalyptus", "#2f6f5b", "#245a49", "#f4f9f5", "rgba(47, 111, 91, 0.22)"),
    accent("deep-teal", "#2a6a72", "#21555c", "#f2f9fa", "rgba(42, 106, 114, 0.22)"),
    accent("slate-blue", "#3d6688", "#315270", "#f3f7fb", "rgba(61, 102, 136, 0.22)"),
    accent("moss", "#4a7145", "#3a5a36", "#f5f9f4", "rgba(74, 113, 69, 0.22)"),
    accent("harbour", "#356b7d", "#2a5665", "#f2f8fa", "rgba(53, 107, 125, 0.22)"),
    accent("fern", "#3b7a63", "#2e6250", "#f4faf6", "rgba(59, 122, 99, 0.22)"),
  ],
  "titan-technical": [
    accent("electric", "#1f6feb", "#1858c4", "#f1f7ff", "rgba(31, 111, 235, 0.26)"),
    accent("indigo", "#4f46e5", "#4038c9", "#f3f2ff", "rgba(79, 70, 229, 0.26)"),
    accent("cyan", "#0e8f9e", "#0b7481", "#eefbfc", "rgba(14, 143, 158, 0.26)"),
    accent("azure", "#0b63a8", "#094f87", "#eff7fd", "rgba(11, 99, 168, 0.26)"),
    accent("cobalt", "#2b5ce6", "#2149c2", "#f1f5ff", "rgba(43, 92, 230, 0.26)"),
    accent("teal-steel", "#177f8a", "#126671", "#eff9fa", "rgba(23, 127, 138, 0.26)"),
  ],
  "titan-general": [
    accent("gold", "#e8b45a", "#dfa63f", "#1c1403", "rgba(232, 180, 90, 0.25)"),
    accent("copper", "#d08a4e", "#ba7539", "#1b1004", "rgba(208, 138, 78, 0.25)"),
    accent("steel", "#6f9fd0", "#5a87b8", "#08111c", "rgba(111, 159, 208, 0.25)"),
    accent("sage", "#7fae8a", "#689372", "#0a150d", "rgba(127, 174, 138, 0.25)"),
    accent("wheat", "#d9c07a", "#c6aa5d", "#1a1505", "rgba(217, 192, 122, 0.25)"),
    accent("slate", "#8fa3bb", "#7489a3", "#0b1119", "rgba(143, 163, 187, 0.25)"),
  ],
};

/**
 * FORM VARIATIONS (ADR-063) — the geometry of the page. Corner radius and
 * measure change the perceived character of a site more than almost anything
 * else, and cost nothing: they are tokens, not assets. Deliberately NOT font
 * families — those are loaded per build through next/font and varying them
 * per business would multiply the font payload the Performance Law caps
 * (ADR-058).
 */
interface FormSet {
  readonly id: string;
  readonly vars: Readonly<Record<string, string>>;
}

const FORMS: ReadonlyArray<FormSet> = [
  {
    id: "soft",
    vars: { "--wr-radius": "1.25rem", "--wr-radius-lg": "2rem", "--wr-measure": "38rem" },
  },
  {
    id: "sharp",
    vars: { "--wr-radius": "0.35rem", "--wr-radius-lg": "0.6rem", "--wr-measure": "36rem" },
  },
  {
    id: "pill",
    vars: { "--wr-radius": "1.9rem", "--wr-radius-lg": "2.75rem", "--wr-measure": "40rem" },
  },
  {
    id: "square",
    vars: { "--wr-radius": "0rem", "--wr-radius-lg": "0rem", "--wr-measure": "37rem" },
  },
];

/** "accent-3" → index 2. Unknown or absent → 0, the original token set. */
function slotIndex(ref: string | undefined, length: number): number {
  const parsed = Number.parseInt((ref ?? "").split("-")[1] ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > length) return 0;
  return parsed - 1;
}

/** How many variations each layer offers — asserted against core's slots. */
export function accentCountFor(themeRef: string): number {
  return (ACCENTS[themeRef] ?? ACCENTS["titan-general"]).length;
}

export function formCount(): number {
  return FORMS.length;
}

/** The named accent a slot resolves to, for the founder's studio and tests. */
export function accentNameFor(themeRef: string, colourRef: string | undefined): string {
  const accents = ACCENTS[themeRef] ?? ACCENTS["titan-general"];
  return accents[slotIndex(colourRef, accents.length)].id;
}

const THEMES: Readonly<Record<string, RendererTheme>> = {
  [TITAN_EMERGENCY.ref]: TITAN_EMERGENCY,
  [TITAN_PREMIUM.ref]: TITAN_PREMIUM,
  // Two archetypes, one emotional register (ADR-029): project shares the
  // Golden Hour mood, keeping its own ref for data-theme targeting.
  "titan-project": { ...TITAN_PREMIUM, ref: "titan-project" },
  [TITAN_CARE.ref]: TITAN_CARE,
  [TITAN_TECHNICAL.ref]: TITAN_TECHNICAL,
  [TITAN_DEFAULT.ref]: TITAN_DEFAULT,
};

/**
 * Resolve a blueprint themeRef to a theme, overlaid with this business's
 * accent and form variation (ADR-063).
 *
 * Unknown refs fall back to the default theme; unknown variation ids fall
 * back to the first option, so an older blueprint generated before this
 * existed renders exactly as it did — the first entry in each list is the
 * original token set.
 */
export function resolveTheme(
  themeRef: string | undefined,
  identity?: { colourRef?: string; typographyRef?: string },
): RendererTheme {
  const base = (themeRef && THEMES[themeRef]) || TITAN_DEFAULT;
  if (!identity?.colourRef && !identity?.typographyRef) return base;

  const accents = ACCENTS[base.ref] ?? ACCENTS["titan-general"];
  const chosenAccent = accents[slotIndex(identity.colourRef, accents.length)];
  const chosenForm = FORMS[slotIndex(identity.typographyRef, FORMS.length)];

  return {
    ...base,
    vars: { ...base.vars, ...chosenAccent.vars, ...chosenForm.vars },
  };
}
