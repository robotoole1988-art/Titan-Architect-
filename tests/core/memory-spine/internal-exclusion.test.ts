import { describe, expect, it } from "vitest";
import { createMemoryBusinessSpine, isInternalBusinessName } from "@/core/business";
import { loadMemorySnapshot } from "@/core/memory-spine";

/**
 * ADR-049: internal/test businesses are flagged at creation and excluded
 * from Brain surfaces (the memory-spine snapshot) by default — while staying
 * fully present in the repositories (CRM-findable, recoverable).
 */

describe("the creation guard", () => {
  it("flags self-declared internal names, conservatively", () => {
    expect(isInternalBusinessName("TITAN Morph Lab (internal)")).toBe(true);
    expect(isInternalBusinessName("Anything (internal)")).toBe(true);
    expect(isInternalBusinessName("Smoke check (test)")).toBe(true);
    // Real trading names never match on bare words.
    expect(isInternalBusinessName("Internal Comfort Heating Ltd")).toBe(false);
    expect(isInternalBusinessName("Test Valley Plumbing")).toBe(false);
    expect(isInternalBusinessName("Summit Roofing Rescue")).toBe(false);
  });

  it("create() applies the guard automatically, and honours an explicit flag", async () => {
    const spine = createMemoryBusinessSpine();
    const lab = await spine.businesses.create({
      name: "TITAN Morph Lab (internal)",
      trade: "Internal — lab",
      location: "—",
    });
    expect(lab.internal).toBe(true);
    const real = await spine.businesses.create({
      name: "Test Valley Plumbing",
      trade: "Plumbing",
      location: "Andover",
    });
    expect(real.internal).toBeUndefined();
    const explicit = await spine.businesses.create({
      name: "Ordinary Name",
      trade: "Roofing",
      location: "Leeds",
      internal: true,
    });
    expect(explicit.internal).toBe(true);
  });
});

describe("Brain-surface exclusion (memory-spine snapshot)", () => {
  it("excludes internal businesses by default; includeInternal restores them", async () => {
    const spine = createMemoryBusinessSpine();
    await spine.businesses.create({ name: "Real Roofing", trade: "Roofing", location: "Leeds" });
    await spine.businesses.create({
      name: "TITAN Morph Lab (internal)",
      trade: "Internal — lab",
      location: "—",
    });

    const snapshot = await loadMemorySnapshot(spine);
    expect(snapshot.businesses.map((business) => business.name)).toEqual(["Real Roofing"]);

    const withInternal = await loadMemorySnapshot(spine, { includeInternal: true });
    expect(withInternal.businesses).toHaveLength(2);

    // The repositories still hold everything — CRM-visible, recoverable.
    expect(await spine.businesses.list()).toHaveLength(2);
  });
});
