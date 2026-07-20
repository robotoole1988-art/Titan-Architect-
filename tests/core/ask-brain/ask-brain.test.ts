import { describe, expect, it } from "vitest";
import { buildKnowledgeGraph, createMemoryLearningFeed } from "@/core/memory-spine";
import {
  INTENT_CATALOG,
  askBrain,
  deterministicReasoner,
  parseQuestion,
  runIntent,
  type AskContext,
  type BrainReasoner,
} from "@/core/ask-brain";
import { NOW, fixtureSnapshot } from "../memory-spine/fixture";

/**
 * ADR-048: Ask the Brain v1. Deterministic first — the intent catalog and the
 * pattern parser work with ZERO LLM involvement over the memory-spine fixture.
 * The LLM seam is exercised with stubs only (no live API in CI): valid stub
 * output is accepted, malformed output is rejected, and empty results are
 * narrated honestly by the template, never by the model.
 */

const graph = buildKnowledgeGraph(fixtureSnapshot());

async function contextWithPromises(): Promise<AskContext> {
  const feed = createMemoryLearningFeed();
  await feed.append({
    kind: "promise",
    businessId: "b-summit",
    summary: "Founder promised a revised proposal by Friday.",
    occurredAt: "2026-07-07T10:00:00.000Z",
    source: "test",
  });
  await feed.append({
    kind: "decision",
    businessId: "b-summit",
    summary: "Chose the storm theme.",
    occurredAt: "2026-07-06T10:00:00.000Z",
    source: "test",
  });
  return { graph, observations: await feed.list(), now: NOW };
}

const bareContext: AskContext = { graph, observations: [], now: NOW };

describe("the deterministic intent catalog", () => {
  it("names exactly the six v1 intents", () => {
    expect(INTENT_CATALOG.map((intent) => intent.id).sort()).toEqual([
      "builds_attention",
      "enquiries_for",
      "leads_not_contacted",
      "pipeline_by_stage",
      "recorded_for",
      "top_sites",
    ]);
  });

  it("leads_not_contacted returns real neglected leads with links + provenance", () => {
    const result = runIntent("leads_not_contacted", bareContext, { days: 7 });
    expect(result.isEmpty).toBe(false);
    expect(result.records).toHaveLength(1);
    expect(result.records[0].label).toContain("Kerbside Kings");
    expect(result.records[0].href).toBe("/crm/b-kerbside");
    expect(result.records[0].provenance).toBeTruthy();
    expect(result.summary).toMatch(/8 days/);
  });

  it("builds_attention finds review-waiting and stalled items", () => {
    const result = runIntent("builds_attention", bareContext, {});
    expect(result.isEmpty).toBe(false);
    expect(result.records).toHaveLength(1); // one build, both flags on it
    const record = result.records[0];
    expect(record.label).toContain("Summit");
    expect(record.href).toBe("/crm/b-summit");
    expect(record.detail).toMatch(/review/i); // website waiting on the gate
    expect(record.detail).toMatch(/stalled|5 days/i); // google_ads gone quiet
    // The queued seo item is neither, and must not be reported.
    expect(record.detail).not.toMatch(/seo/i);
  });

  it("enquiries_for returns every enquiry for the business with status", () => {
    const result = runIntent("enquiries_for", bareContext, { businessId: "b-summit" });
    expect(result.records).toHaveLength(3);
    expect(result.records.every((record) => record.href === "/crm/b-summit")).toBe(true);
    expect(result.records.map((record) => record.label).join(" ")).toContain("Jane");
  });

  it("pipeline_by_stage counts the ladder honestly", () => {
    const result = runIntent("pipeline_by_stage", bareContext, {});
    expect(result.summary).toMatch(/lead: 1/i);
    expect(result.summary).toMatch(/qualified: 1/i);
    expect(result.records.map((record) => record.href).sort()).toEqual([
      "/crm/b-bright",
      "/crm/b-kerbside",
      "/crm/b-summit",
    ]);
  });

  it("top_sites ranks live sites by real measured visits", () => {
    const result = runIntent("top_sites", bareContext, { days: 7 });
    expect(result.records).toHaveLength(1); // only Summit has metrics
    expect(result.records[0].href).toBe("/sites/summit-roofing-rescue");
    expect(result.records[0].detail).toMatch(/105/); // 42+51+12 views
    expect(result.records[0].detail).toMatch(/6/); // 2+3+1 form submits
  });

  it("recorded_for surfaces structured observations, filterable to promises", async () => {
    const context = await contextWithPromises();
    const promises = runIntent("recorded_for", context, {
      businessId: "b-summit",
      kind: "promise",
    });
    expect(promises.records).toHaveLength(1);
    expect(promises.records[0].label).toContain("revised proposal");
    const all = runIntent("recorded_for", context, { businessId: "b-summit" });
    expect(all.records).toHaveLength(2);
  });

  it("answers ABSENCE honestly: empty result, isEmpty true, no invention", async () => {
    const context = await contextWithPromises();
    const result = runIntent("recorded_for", context, {
      businessId: "b-kerbside",
      kind: "promise",
    });
    expect(result.isEmpty).toBe(true);
    expect(result.records).toEqual([]);
    expect(result.summary).toMatch(/no|nothing/i);
  });

  it("throws loudly for an unknown intent id", () => {
    expect(() => runIntent("drop_tables", bareContext, {})).toThrow(/unknown intent/i);
  });
});

describe("the deterministic parser (zero LLM)", () => {
  it("parses the canonical phrasings", () => {
    expect(parseQuestion("Which customers haven't been contacted in 10 days?", graph)).toEqual({
      kind: "intent",
      intentId: "leads_not_contacted",
      params: { days: 10 },
    });
    expect(parseQuestion("who hasn't been contacted in a week", graph)).toEqual({
      kind: "intent",
      intentId: "leads_not_contacted",
      params: { days: 7 },
    });
    expect(parseQuestion("Which builds are stalled?", graph)).toMatchObject({
      intentId: "builds_attention",
    });
    expect(parseQuestion("builds waiting on review", graph)).toMatchObject({
      intentId: "builds_attention",
    });
    expect(parseQuestion("What's the pipeline by stage?", graph)).toMatchObject({
      intentId: "pipeline_by_stage",
    });
    expect(parseQuestion("Which sites got the most visits this week?", graph)).toMatchObject({
      intentId: "top_sites",
    });
  });

  it("resolves business names conservatively", () => {
    expect(parseQuestion("Show enquiries for Summit", graph)).toEqual({
      kind: "intent",
      intentId: "enquiries_for",
      params: { businessId: "b-summit" },
    });
    expect(parseQuestion("what did we promise Smile?", graph)).toEqual({
      kind: "intent",
      intentId: "recorded_for",
      params: { businessId: "b-bright", kind: "promise" },
    });
    expect(parseQuestion("what did we record for Kerbside", graph)).toEqual({
      kind: "intent",
      intentId: "recorded_for",
      params: { businessId: "b-kerbside" },
    });
  });

  it("returns AMBIGUITY as a question, never a guess", () => {
    const twins = buildKnowledgeGraph({
      ...fixtureSnapshot(),
      businesses: [
        { ...fixtureSnapshot().businesses[0], id: "b-1", name: "Acme Roofing" },
        { ...fixtureSnapshot().businesses[1], id: "b-2", name: "Acme Plumbing" },
      ],
    });
    const outcome = parseQuestion("show enquiries for Acme", twins);
    expect(outcome).toMatchObject({ kind: "ambiguous", intentId: "enquiries_for" });
    expect(
      (outcome as { candidates: ReadonlyArray<{ name: string }> }).candidates.map(
        (candidate) => candidate.name,
      ),
    ).toEqual(["Acme Roofing", "Acme Plumbing"]);
  });

  it("returns null for questions it cannot map — no keyword lottery", () => {
    expect(parseQuestion("what is the meaning of life?", graph)).toBeNull();
    expect(parseQuestion("delete all my customers", graph)).toBeNull();
  });
});

describe("the ask engine (LLM behind the seam, stubs only)", () => {
  it("deterministic parse → HIGH confidence, template answer, evidence attached", async () => {
    const answer = await askBrain(
      "Which customers haven't been contacted in 7 days?",
      bareContext,
      deterministicReasoner,
    );
    expect(answer.confidence).toBe("high");
    expect(answer.intentId).toBe("leads_not_contacted");
    expect(answer.records).toHaveLength(1);
    expect(answer.answer).toContain("Kerbside Kings");
    expect(answer.derivation).toMatch(/deterministic/i);
  });

  it("unmapped phrasing → the LLM parses; a VALID intent runs at MEDIUM confidence", async () => {
    const stub: BrainReasoner = {
      async parseIntent() {
        return { intentId: "pipeline_by_stage", params: {} };
      },
      async composeAnswer({ result }) {
        return `Narrated: ${result.records.length} businesses on the board.`;
      },
    };
    const answer = await askBrain("how's the board looking?", bareContext, stub);
    expect(answer.confidence).toBe("medium");
    expect(answer.intentId).toBe("pipeline_by_stage");
    expect(answer.answer).toContain("Narrated: 3");
    expect(answer.derivation).toMatch(/llm/i);
  });

  it("REJECTS malformed LLM output and says so honestly at LOW confidence", async () => {
    const hostile: BrainReasoner = {
      async parseIntent() {
        return { intentId: "drop_tables", params: { cascade: true } };
      },
      async composeAnswer() {
        return "I deleted everything (this must never be shown).";
      },
    };
    const answer = await askBrain("do something weird", bareContext, hostile);
    expect(answer.confidence).toBe("low");
    expect(answer.intentId).toBeUndefined();
    expect(answer.isEmpty).toBe(true);
    expect(answer.answer).not.toContain("deleted");
    // The honest miss lists what the Brain CAN answer.
    expect(answer.answer).toMatch(/can answer|try asking/i);
  });

  it("EMPTY results are narrated by the honest template — the LLM is never invited", async () => {
    let composeCalled = false;
    const stub: BrainReasoner = {
      async parseIntent() {
        return { intentId: "recorded_for", params: { businessId: "b-kerbside", kind: "promise" } };
      },
      async composeAnswer() {
        composeCalled = true;
        return "There are definitely three promises (fabricated).";
      },
    };
    const answer = await askBrain("promises for kerbside?", bareContext, stub);
    expect(answer.isEmpty).toBe(true);
    expect(composeCalled).toBe(false);
    expect(answer.answer).not.toContain("three promises");
    expect(answer.answer).toMatch(/no|nothing/i);
  });

  it("ambiguity comes back as a clarifying answer with candidate links", async () => {
    const twins = buildKnowledgeGraph({
      ...fixtureSnapshot(),
      businesses: [
        { ...fixtureSnapshot().businesses[0], id: "b-1", name: "Acme Roofing" },
        { ...fixtureSnapshot().businesses[1], id: "b-2", name: "Acme Plumbing" },
      ],
    });
    const answer = await askBrain(
      "show enquiries for Acme",
      { graph: twins, observations: [], now: NOW },
      deterministicReasoner,
    );
    expect(answer.answer).toMatch(/which/i);
    expect(answer.records.map((record) => record.href).sort()).toEqual(["/crm/b-1", "/crm/b-2"]);
  });
});
