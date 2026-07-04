import { describe, expect, it } from "vitest";
import { WORKBOOK_ORDER } from "@/core/market-intelligence";
import {
  TRADE_TAXONOMY,
  UNCLASSIFIED_TRADE_ID,
  getTradeDefinition,
  matchTradeId,
  tradeServices,
} from "@/core/trade-taxonomy";
import { createSeededMarketDataProvider } from "@/core/market-intelligence";

describe("trade taxonomy (ADR-026)", () => {
  it("defines the twenty founder trades with ids matching the market tradeKeys", () => {
    expect(TRADE_TAXONOMY).toHaveLength(35);
    const ids = TRADE_TAXONOMY.map((trade) => trade.id);
    expect(new Set(ids).size).toBe(35);
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

describe("taxonomy expansion — the 15 v2-workbook trades", () => {
  const NEW_IDS = [
    "electricians",
    "builders-general",
    "extensions-renovations",
    "windows-doors",
    "conservatories",
    "dentists-private",
    "solicitors",
    "car-detailing",
    "brickwork",
    "swimming-pools",
    "tarmac-surfacing",
    "artificial-grass",
    "chimney-fireplaces",
    "damp-proofing",
    "hvac-air-conditioning",
  ];

  it("adds all fifteen with services and matchers", () => {
    for (const id of NEW_IDS) {
      const trade = getTradeDefinition(id);
      expect(trade, id).toBeDefined();
      expect(trade!.services.length, id).toBeGreaterThanOrEqual(4);
      expect(trade!.matchers.length, id).toBeGreaterThanOrEqual(1);
    }
  });

  it("keeps ONE id space: every taxonomy id resolves a seeded benchmark", async () => {
    const provider = createSeededMarketDataProvider();
    for (const trade of TRADE_TAXONOMY) {
      const benchmark = await provider.getBenchmark(trade.id);
      expect(benchmark.tradeKey, trade.id).toBe(trade.id);
    }
  });

  it("matches obvious free text to the new trades", () => {
    expect(matchTradeId("Electrician")).toBe("electricians");
    expect(matchTradeId("Double Glazing installer")).toBe("windows-doors");
    expect(matchTradeId("swimming pool builder")).toBe("swimming-pools");
    expect(matchTradeId("damp proofing specialist")).toBe("damp-proofing");
    expect(matchTradeId("air conditioning")).toBe("hvac-air-conditioning");
  });
});
