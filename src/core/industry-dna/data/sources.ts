/**
 * Knowledge provenance (the honesty laws applied to knowledge itself).
 *
 * ADR-059 forbids TITAN stating a fact a business cannot back. The knowledge
 * base holds facts TITAN itself asserts — legal MUSTs, market patterns,
 * price benchmarks — so the same discipline applies one level up: a DNA
 * section is SOURCED or it is silent. Every populated section names the
 * research document (and section) it came from, and the provenance gate in
 * tests/core/industry-dna enforces it. The brain never gets to know
 * something it cannot cite.
 */

/** The research dossiers behind the knowledge base, by repo path. */
export const RESEARCH_DOCS = {
  vol1: "docs/research/2026-07-26-site-excellence-dossier.md",
  vol2: "docs/research/2026-07-26-trade-playbooks-vol2.md",
  vol3: "docs/research/2026-07-26-design-and-acquisition-dossier-vol3.md",
} as const;

/** A source reference: document path plus the section it came from. */
export function vol2(section: string): string {
  return `${RESEARCH_DOCS.vol2} § ${section}`;
}

export function vol1(section: string): string {
  return `${RESEARCH_DOCS.vol1} § ${section}`;
}

export function vol3(section: string): string {
  return `${RESEARCH_DOCS.vol3} § ${section}`;
}

/** Shorthand for a section's provenance bag. */
export function sourced(...sources: string[]): { sources: string[] } {
  return { sources };
}
