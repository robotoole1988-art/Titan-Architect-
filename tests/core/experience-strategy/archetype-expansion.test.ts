import { describe, expect, it } from "vitest";
import { classifyArchetype } from "@/core/experience-strategy";

describe("archetypes for the taxonomy expansion (v2 workbook)", () => {
  it("classifies the new trades into sensible buying modes", () => {
    expect(classifyArchetype("electricians")).toBe("emergency");
    expect(classifyArchetype("windows & doors (double glazing)")).toBe("project");
    expect(classifyArchetype("conservatories")).toBe("project");
    expect(classifyArchetype("dentists (private)")).toBe("care");
    expect(classifyArchetype("car detailing")).toBe("premium");
    expect(classifyArchetype("swimming pools")).toBe("premium");
    expect(classifyArchetype("tarmac & surfacing")).toBe("project");
    expect(classifyArchetype("artificial grass")).toBe("project");
    expect(classifyArchetype("chimney & fireplaces")).toBe("project");
    expect(classifyArchetype("damp proofing")).toBe("emergency");
    expect(classifyArchetype("hvac / air conditioning")).toBe("emergency");
    // Emergency glaziers still classify emergency; double glazing must not.
    expect(classifyArchetype("emergency glazier")).toBe("emergency");
  });
});
