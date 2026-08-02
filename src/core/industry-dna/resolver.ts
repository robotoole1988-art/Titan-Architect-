import { TRADE_TAXONOMY, matchTradeId } from "@/core/trade-taxonomy";
import type { DnaSection } from "./common";
import type { IndustryDna } from "./industry-dna";
import { PLATFORM_DNA } from "./data/platform";
import { TRACK_A_DNA } from "./data/track-a";
import { TRACK_B_DNA } from "./data/track-b";
import { TRACK_C_DNA } from "./data/track-c";
import { TRACK_D_DNA } from "./data/track-d";
import { TRACK_E_DNA } from "./data/track-e";
import { TRACK_F_DNA } from "./data/track-f";

/**
 * The Industry DNA resolver: taxonomy id → knowledge.
 *
 * Matching law (ADR-062/066): a trade is identified by its EXACT taxonomy
 * id, or by delegating free text to the taxonomy's own conservative matcher
 * — never by substring logic invented here. `"damp-proofing".includes("roof")`
 * is true; that class of bug does not get a fifth outing.
 *
 * Merge law: the platform layer holds what is true across all trades; the
 * trade record overrides field by field (trade wins, field-level, no list
 * concatenation — concatenation invites duplicated near-copy). Sections
 * neither layer populated stay honestly empty (ADR-034 for knowledge).
 *
 * Provenance law: a populated section carries `extensions.sources` naming
 * the research behind it — enforced by the provenance gate in tests. The
 * brain never knows something it cannot cite.
 */

/** The twelve section keys of an IndustryDna, in specification order. */
export const DNA_SECTION_KEYS = [
  "businessIdentity",
  "services",
  "customerPsychology",
  "website",
  "searchSeo",
  "paidAdvertising",
  "brand",
  "sales",
  "marketIntelligence",
  "operations",
  "businessIntelligence",
  "aiBehaviour",
] as const;

export type DnaSectionKey = (typeof DNA_SECTION_KEYS)[number];

/** Every per-trade record, keyed by canonical taxonomy id. */
const TRADE_DNA: Readonly<Record<string, IndustryDna>> = {
  ...TRACK_A_DNA,
  ...TRACK_B_DNA,
  ...TRACK_C_DNA,
  ...TRACK_D_DNA,
  ...TRACK_E_DNA,
  ...TRACK_F_DNA,
};

/** Does a section hold any knowledge of its own (beyond notes/extensions)? */
export function sectionHasContent(section: DnaSection): boolean {
  return Object.entries(section).some(([key, value]) => {
    if (key === "extensions" || key === "notes") return false;
    if (value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });
}

/** Field-level merge: platform fills what the trade record leaves undefined. */
function mergeSection<T extends DnaSection>(platform: T, trade: T): T {
  const merged: T = { ...platform };
  for (const [key, value] of Object.entries(trade)) {
    // Object.entries erases the field types; the single cast localises that.
    if (value !== undefined && key !== "extensions") {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  const sources = [
    ...((platform.extensions?.sources as string[] | undefined) ?? []),
    ...((trade.extensions?.sources as string[] | undefined) ?? []),
  ];
  if (platform.extensions || trade.extensions) {
    merged.extensions = {
      ...platform.extensions,
      ...trade.extensions,
      ...(sources.length > 0 ? { sources: [...new Set(sources)] } : {}),
    };
  }
  return merged;
}

function mergeDna(platform: IndustryDna, trade: IndustryDna): IndustryDna {
  const merged = {} as Record<DnaSectionKey, DnaSection>;
  for (const key of DNA_SECTION_KEYS) {
    merged[key] = mergeSection(platform[key], trade[key]);
  }
  return merged as unknown as IndustryDna;
}

export interface ResolvedIndustryDna {
  /** The merged knowledge: platform layer + trade record (trade wins). */
  dna: IndustryDna;
  /** The canonical taxonomy id matched, or null → platform knowledge only. */
  matched: string | null;
  /**
   * Sections the TRADE record itself populated — the honest coverage
   * measure for this specific trade (platform knowledge excluded).
   */
  tradeSections: ReadonlyArray<DnaSectionKey>;
}

/**
 * Resolve the Industry DNA for a trade.
 *
 * Accepts a canonical taxonomy id (exact match) or free text (delegated to
 * the taxonomy's conservative matcher). Unknown trades resolve to the
 * platform layer alone with `matched: null` — general knowledge, honestly
 * labelled, exactly like the pitch module's "general" fallback.
 */
export function resolveIndustryDna(tradeIdOrName: string): ResolvedIndustryDna {
  const trimmed = tradeIdOrName.trim();
  const exact = TRADE_TAXONOMY.some((trade) => trade.id === trimmed)
    ? trimmed
    : null;
  const matched = exact ?? matchTradeId(trimmed);
  const record = matched ? TRADE_DNA[matched] : undefined;

  if (!matched || !record) {
    return {
      dna: mergeDna(PLATFORM_DNA, EMPTY_DNA),
      matched: null,
      tradeSections: [],
    };
  }
  return {
    dna: mergeDna(PLATFORM_DNA, record),
    matched,
    tradeSections: DNA_SECTION_KEYS.filter((key) =>
      sectionHasContent(record[key]),
    ),
  };
}

/** Taxonomy ids with a trade-specific DNA record. */
export function industryDnaCoveredTradeIds(): ReadonlyArray<string> {
  return Object.keys(TRADE_DNA);
}

/** Taxonomy ids still WITHOUT a trade-specific record — the honest gap. */
export function industryDnaGapTradeIds(): ReadonlyArray<string> {
  return TRADE_TAXONOMY.filter((trade) => !(trade.id in TRADE_DNA)).map(
    (trade) => trade.id,
  );
}

const EMPTY_DNA: IndustryDna = {
  businessIdentity: {},
  services: {},
  customerPsychology: {},
  website: {},
  searchSeo: {},
  paidAdvertising: {},
  brand: {},
  sales: {},
  marketIntelligence: {},
  operations: {},
  businessIntelligence: {},
  aiBehaviour: {},
};
