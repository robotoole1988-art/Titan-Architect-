import { describe, expect, it } from "vitest";
import { parseCommand, validateParsedCommand } from "@/core/command-mode";
import { fixtureGraph } from "../brain-orchestrator/fixture";

/**
 * ADR-052 §"natural commands": imperative phrasings resolve through the
 * ADR-048 validated seam. Conservative: ambiguity is a question, unknowns
 * fall through to Ask the Brain (null), and nothing here executes anything.
 */

const graph = fixtureGraph();

describe("parseCommand", () => {
  it('resolves "create a task to chase <business>" to create_next_action', () => {
    const outcome = parseCommand("create a task to chase Rapid Roofing", graph);
    expect(outcome).toEqual({
      kind: "command",
      actionId: "create_next_action",
      params: { businessId: "b-roof", text: "chase Rapid Roofing" },
    });
    if (outcome?.kind === "command") {
      expect(validateParsedCommand(outcome, graph)).toEqual([]);
    }
  });

  it("resolves the business even with trailing context after the name", () => {
    const outcome = parseCommand(
      "create a task to chase Rapid Roofing about the gutter quote",
      graph,
    );
    expect(outcome).toEqual({
      kind: "command",
      actionId: "create_next_action",
      params: { businessId: "b-roof", text: "chase Rapid Roofing about the gutter quote" },
    });
  });

  it("resolves a partial name with trailing context (the real-world phrasing)", () => {
    // "Northern" uniquely identifies Northern Signs even mid-sentence.
    const outcome = parseCommand(
      "create a task to call Northern about the signage refresh",
      graph,
    );
    expect(outcome).toEqual({
      kind: "command",
      actionId: "create_next_action",
      params: { businessId: "b-signs", text: "call Northern about the signage refresh" },
    });
  });

  it("resolves a note with its text intact", () => {
    const outcome = parseCommand(
      "add a note to Rapid Roofing: prefers calls after 5pm",
      graph,
    );
    expect(outcome).toEqual({
      kind: "command",
      actionId: "append_business_note",
      params: { businessId: "b-roof", note: "prefers calls after 5pm" },
    });
  });

  it("resolves a follow-up draft to the business's LATEST enquiry", () => {
    const outcome = parseCommand("draft a follow-up for Rapid Roofing", graph);
    // e-breach (10:30) is newer than e-handled (09:00).
    expect(outcome).toEqual({
      kind: "command",
      actionId: "draft_follow_up",
      params: { enquiryId: "e-breach" },
    });
  });

  it("is honest when there is nothing to follow up", () => {
    const outcome = parseCommand("draft a follow-up for Northern Signs", graph);
    expect(outcome?.kind).toBe("invalid");
    if (outcome?.kind === "invalid") {
      expect(outcome.problems[0]).toContain("no enquiries");
    }
  });

  it("an ambiguous business name comes back as a question, never a guess", () => {
    // "Co" matches both Slow Deal Co and Building Co.
    const outcome = parseCommand("add a note to Co: hello", graph);
    expect(outcome?.kind).toBe("ambiguous");
    if (outcome?.kind === "ambiguous") {
      expect(outcome.candidates.map((candidate) => candidate.name).sort()).toEqual([
        "Building Co",
        "Slow Deal Co",
      ]);
    }
  });

  it("unknown businesses fall through to Ask the Brain (null)", () => {
    expect(parseCommand("create a task to chase Bright Smile", graph)).toBeNull();
  });

  it("questions are not commands", () => {
    expect(parseCommand("what's in the pipeline", graph)).toBeNull();
    expect(parseCommand("show enquiries for Rapid Roofing", graph)).toBeNull();
    expect(parseCommand("which sites got the most visits", graph)).toBeNull();
  });
});
