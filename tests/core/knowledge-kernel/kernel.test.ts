import { describe, expect, it } from "vitest";
import {
  createKnowledgeKernel,
  createMemoryKnowledgeStore,
  type KnowledgeKernel,
} from "@/core/knowledge-kernel";

/**
 * ADR-046 implements ADR-010: the Knowledge Kernel contract, real. These tests
 * exercise the kernel through its PUBLIC interface only, on the memory store —
 * the Supabase store implements the same store seam.
 */

function kernel(): KnowledgeKernel {
  return createKnowledgeKernel(createMemoryKnowledgeStore());
}

const tradeDraft = {
  label: "Roofing",
  slug: "roofing",
  services: ["repairs", "replacement"],
  vocabulary: ["ridge", "flashing"],
  provenance: { source: "manual", capturedAt: "2026-07-08T10:00:00.000Z" },
} as const;

describe("knowledge kernel (ADR-010, implemented)", () => {
  it("put assigns system metadata: id, kind, revision 1, timestamps", async () => {
    const k = kernel();
    const record = await k.put("trade", { ...tradeDraft });
    expect(record.id).toBeTruthy();
    expect(record.kind).toBe("trade");
    expect(record.revision).toBe(1);
    expect(record.createdAt).toBeTruthy();
    expect(record.updatedAt).toBe(record.createdAt);
    expect(record.slug).toBe("roofing");
    expect(record.provenance?.source).toBe("manual");
  });

  it("get returns the typed record; null for the unknown", async () => {
    const k = kernel();
    const record = await k.put("trade", { ...tradeDraft });
    const fetched = await k.get("trade", record.id);
    expect(fetched?.services).toEqual(["repairs", "replacement"]);
    expect(await k.get("trade", "missing")).toBeNull();
    // Kind is part of identity: a trade id is not visible as a brand.
    expect(await k.get("brand", record.id)).toBeNull();
  });

  it("update patches fields, bumps revision, preserves createdAt", async () => {
    const k = kernel();
    const record = await k.put("trade", { ...tradeDraft });
    const updated = await k.update("trade", record.id, {
      services: ["repairs", "replacement", "surveys"],
    });
    expect(updated.revision).toBe(2);
    expect(updated.services).toContain("surveys");
    expect(updated.vocabulary).toEqual(["ridge", "flashing"]); // untouched fields survive
    expect(updated.createdAt).toBe(record.createdAt);
    expect(updated.updatedAt >= record.updatedAt).toBe(true);
  });

  it("remove deletes; updating the missing record throws", async () => {
    const k = kernel();
    const record = await k.put("trade", { ...tradeDraft });
    await k.remove("trade", record.id);
    expect(await k.get("trade", record.id)).toBeNull();
    await expect(
      k.update("trade", record.id, { label: "gone" }),
    ).rejects.toThrow(/not found/i);
  });

  it("query: label search, field filters, limit + cursor pagination", async () => {
    const k = kernel();
    await k.put("location", { label: "Leeds", area: "Leeds", country: "UK" });
    await k.put("location", { label: "Leeds North", area: "Leeds", country: "UK" });
    await k.put("location", { label: "Manchester", area: "Manchester", country: "UK" });

    const search = await k.query("location", { search: "leeds" });
    expect(search.total).toBe(2);

    const where = await k.query("location", { where: { area: "Manchester" } });
    expect(where.records.map((r) => r.label)).toEqual(["Manchester"]);

    const pageOne = await k.query("location", { limit: 2 });
    expect(pageOne.records).toHaveLength(2);
    expect(pageOne.total).toBe(3);
    expect(pageOne.nextCursor).toBeTruthy();
    const pageTwo = await k.query("location", { limit: 2, cursor: pageOne.nextCursor });
    expect(pageTwo.records).toHaveLength(1);
    expect(pageTwo.nextCursor).toBeUndefined();
    // Pages never overlap.
    const ids = [...pageOne.records, ...pageTwo.records].map((r) => r.id);
    expect(new Set(ids).size).toBe(3);
  });

  it("collection() is an ergonomic handle over the same data", async () => {
    const k = kernel();
    const trades = k.collection("trade");
    const record = await trades.put({ ...tradeDraft });
    expect((await k.get("trade", record.id))?.label).toBe("Roofing");
    const queried = await trades.query();
    expect(queried.total).toBe(1);
    await trades.remove(record.id);
    expect(await trades.get(record.id)).toBeNull();
  });

  it("kinds are isolated collections", async () => {
    const k = kernel();
    await k.put("trade", { ...tradeDraft });
    const brands = await k.query("brand");
    expect(brands.total).toBe(0);
  });
});
