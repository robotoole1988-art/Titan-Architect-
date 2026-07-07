import { describe, expect, it } from "vitest";
import { classifyArchetype } from "@/core/experience-strategy";

describe("archetypes for the taxonomy expansion (v2 workbook)", () => {
  it("classifies the new trades into sensible buying modes", () => {
    expect(classifyArchetype("windows & doors (double glazing)")).toBe("project");
    expect(classifyArchetype("conservatories")).toBe("project");
    expect(classifyArchetype("dentists (private)")).toBe("care");
    expect(classifyArchetype("car detailing")).toBe("premium");
    expect(classifyArchetype("swimming pools")).toBe("premium");
    expect(classifyArchetype("tarmac & surfacing")).toBe("project");
    expect(classifyArchetype("artificial grass")).toBe("project");
    expect(classifyArchetype("chimney & fireplaces")).toBe("project");
    expect(classifyArchetype("damp proofing")).toBe("emergency");
    // Emergency glaziers still classify emergency; double glazing must not.
    expect(classifyArchetype("emergency glazier")).toBe("emergency");
  });

  it("maps trust-led professional services into the care cluster (ADR-043)", () => {
    expect(classifyArchetype("solicitors")).toBe("care");
    expect(classifyArchetype("conveyancing solicitors")).toBe("care");
    expect(classifyArchetype("accountants")).toBe("care");
    expect(classifyArchetype("chartered accountancy")).toBe("care");
    expect(classifyArchetype("veterinary practice")).toBe("care");
  });

  it("maps skilled / energy-tech installers into the technical cluster (ADR-044)", () => {
    expect(classifyArchetype("electricians")).toBe("technical");
    expect(classifyArchetype("hvac / air conditioning")).toBe("technical");
    expect(classifyArchetype("boiler installation")).toBe("technical");
    expect(classifyArchetype("solar pv")).toBe("technical");
    expect(classifyArchetype("battery storage")).toBe("technical");
    expect(classifyArchetype("ev charger installation")).toBe("technical");
    // Genuine 999-jobs STAY emergency — the split is deliberate.
    expect(classifyArchetype("plumbing & heating (emergency)")).toBe("emergency");
    expect(classifyArchetype("damp proofing")).toBe("emergency");
  });
});
