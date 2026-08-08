import { buildTradeArt, type TradeArtKind } from "../model/trade-art";

/**
 * Trade-card artwork, rendered (ADR-064) — drawn light, as inline SVG.
 *
 * Server component, zero JavaScript, no image request: the imagery the
 * founder asked for (2026-08-07), built the way the sphere was built.
 * Each card's geometry comes precomputed from `model/trade-art.ts` and
 * every visit draws the identical picture.
 *
 * The tint is the card's own glow colour, so the artwork belongs to the
 * card it decorates rather than arriving as a sticker. `aria-hidden`
 * throughout: these are pictures beside the words, never the words.
 */

const SCENES = Object.fromEntries(
  (["roofing", "landscaping", "driveways", "solar", "motor", "network"] as const).map(
    (k) => [k, buildTradeArt(k)],
  ),
) as Record<TradeArtKind, ReturnType<typeof buildTradeArt>>;

/** Palette-group opacity for point fills, deep to bright. */
const GROUP_FILL = ["#dbe9ff", "#9cc4ff", "#5b82d6"] as const;

export function TradeArt({
  kind,
  tint,
}: {
  kind: TradeArtKind;
  /** the card's highlight colour for bright strokes, e.g. "#8fb2ff" */
  tint: string;
}) {
  const s = SCENES[kind];
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${s.w} ${s.h}`}
      className="pointer-events-none absolute inset-x-0 top-0 h-[62%] w-full select-none opacity-80 transition-opacity duration-300 group-hover:opacity-100"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
    >
      {s.strokes.map((p, i) => (
        <path
          key={i}
          d={p.d}
          stroke={p.bright ? tint : "#7fa4e8"}
          strokeOpacity={p.o}
          strokeWidth={p.w}
          strokeLinecap="round"
        />
      ))}
      {s.points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.r}
          fill={GROUP_FILL[p.g]}
          fillOpacity={p.o}
        />
      ))}
    </svg>
  );
}
