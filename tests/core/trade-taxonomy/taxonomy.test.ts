import { describe, expect, it } from "vitest";
import { WORKBOOK_ORDER } from "@/core/market-intelligence";
import {
  TRADE_TAXONOMY,
  UNCLASSIFIED_TRADE_ID,
  getTradeDefinition,
  matchTradeId,
  tradeServices,
} from "@/core/trade-taxonomy";

describe("trade taxonomy (ADR-026)", () => {
  it("defines the twenty founder trades with ids matching the market tradeKeys", () => {
    expect(TRADE_TAXONOMY).toHaveLength(20);
    const ids = TRADE_TAXONOMY.map((trade) => trade.id);
    expect(new Set(ids).size).toBe(20);
    // One id space across taxonomy, market intelligence, and pitch mapping.
    expect(ids).toEqual([...WORKBOOK_ORDER]);
  });

  it("seeds rich services for the priority trades", () => {
    for (const id of [
      "roofing",
      "driveways-paving",
      "landscaping",
      "plumbing-heating-emergency",
      "solar-pv",
    ]) {
      expect(tradeServices(id).length, id).toBeGreaterThanOrEqual(8);
    }
  });

  it("gives every trade at least a solid default services list", () => {
    for (const trade of TRADE_TAXONOMY) {
      expect(tradeServices(trade.id).length, trade.id).toBeGreaterThanOrEqual(4);
      expect(new Set(tradeServices(trade.id)).size).toBe(
        tradeServices(trade.id).length,
      );
    }
  });

  it("looks trades up by id", () => {
    expect(getTradeDefinition("roofing")?.label).toBe("Roofing");
    expect(getTradeDefinition("nope")).toBeUndefined();
  });

  it("matches legacy free-text trades to ids where confident", () => {
    expect(matchTradeId("Emergency Roofing & Drainage")).toBe("roofing");
    expect(matchTradeId("Driveways & Patios")).toBe("driveways-paving");
    expect(matchTradeId("Plumbing and Heating")).toBe(
      "plumbing-heating-emergency",
    );
    expect(matchTradeId("solar panel installation")).toBe("solar-pv");
    // Not confidently matchable → null, callers flag unclassified.
    expect(matchTradeId("Alpaca Shearing")).toBeNull();
    expect(UNCLASSIFIED_TRADE_ID).toBe("unclassified");
  });
});
