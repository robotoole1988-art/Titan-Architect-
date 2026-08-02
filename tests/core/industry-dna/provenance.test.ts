import { describe, expect, it } from "vitest";
import { DNA_SECTION_KEYS, sectionHasContent } from "@/core/industry-dna";
import type { IndustryDna } from "@/core/industry-dna";
import { PLATFORM_DNA } from "@/core/industry-dna/data/platform";
import { TRACK_A_DNA } from "@/core/industry-dna/data/track-a";
import { TRACK_B_DNA } from "@/core/industry-dna/data/track-b";
import { TRACK_C_DNA } from "@/core/industry-dna/data/track-c";
import { TRACK_D_DNA } from "@/core/industry-dna/data/track-d";
import { TRACK_E_DNA } from "@/core/industry-dna/data/track-e";
import { TRACK_F_DNA } from "@/core/industry-dna/data/track-f";

/**
 * The provenance gate: a DNA section is SOURCED or it is SILENT.
 *
 * ADR-059 forbids TITAN stating a fact a business cannot back. The
 * knowledge base holds facts TITAN itself asserts — legal MUSTs, price
 * benchmarks, market patterns — so the same law applies to knowledge:
 * every populated section names the research it came from, and an
 * always-learning brain that cannot cite its sources is a liar at scale.
 * This gate is what stops that structurally.
 */

const ALL_RECORDS: ReadonlyArray<[name: string, dna: IndustryDna]> = [
  ["platform", PLATFORM_DNA],
  ...Object.entries(TRACK_A_DNA),
  ...Object.entries(TRACK_B_DNA),
  ...Object.entries(TRACK_C_DNA),
  ...Object.entries(TRACK_D_DNA),
  ...Object.entries(TRACK_E_DNA),
  ...Object.entries(TRACK_F_DNA),
];

describe("the provenance gate — sourced or silent", () => {
  for (const [name, dna] of ALL_RECORDS) {
    it(`${name}: every populated section names its sources`, () => {
      for (const key of DNA_SECTION_KEYS) {
        const section = dna[key];
        if (!sectionHasContent(section)) continue;
        const sources = section.extensions?.sources;
        expect(
          Array.isArray(sources) && sources.length > 0,
          `${name}.${key} holds knowledge but names no source`,
        ).toBe(true);
        for (const source of sources as unknown[]) {
          expect(typeof source, `${name}.${key} source entry`).toBe("string");
          expect(
            String(source).startsWith("docs/research/"),
            `${name}.${key} source "${String(source)}" must point into docs/research/`,
          ).toBe(true);
        }
      }
    });
  }

  it("empty sections carry no sources — silence needs no citation", () => {
    for (const [name, dna] of ALL_RECORDS) {
      for (const key of DNA_SECTION_KEYS) {
        const section = dna[key];
        if (sectionHasContent(section)) continue;
        expect(
          section.extensions?.sources,
          `${name}.${key} is empty but cites sources — either author the section or drop them`,
        ).toBeUndefined();
      }
    }
  });
});
