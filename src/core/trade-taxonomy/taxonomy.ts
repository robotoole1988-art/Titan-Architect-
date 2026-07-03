/**
 * The canonical trade taxonomy (ADR-026): the founder's twenty trades, each
 * with a services vocabulary. Ids are IDENTICAL to the market-intelligence
 * tradeKeys — one id space across the platform. Services are richly seeded
 * for the priority trades (roofing, driveways & paving, landscaping,
 * plumbing & heating, solar); solid defaults elsewhere — the founder refines.
 */

export interface TradeDefinition {
  /** Canonical id — matches market-intelligence tradeKey. */
  id: string;
  label: string;
  services: ReadonlyArray<string>;
  /** Legacy free-text matchers (substring, lowercase) for old records. */
  matchers: ReadonlyArray<string>;
}

export type TradeId = string;

/** The flag value for records whose trade could not be classified. */
export const UNCLASSIFIED_TRADE_ID = "unclassified";

/** Workbook display order — the dropdown order everywhere. */
export const TRADE_TAXONOMY: ReadonlyArray<TradeDefinition> = [
  {
    id: "roofing",
    label: "Roofing",
    matchers: ["roof", "guttering", "fascia", "soffit", "chimney"],
    services: [
      "Roof repairs",
      "Full re-roofs",
      "Flat roofing (EPDM/GRP)",
      "Storm damage response",
      "Chimney repairs & repointing",
      "Guttering, fascias & soffits",
      "Leadwork",
      "Drone roof surveys",
      "Insurance claim work",
      "Moss removal & treatment",
    ],
  },
  {
    id: "plumbing-heating-emergency",
    label: "Plumbing & Heating (emergency)",
    matchers: ["plumb", "heating", "gas", "drain", "leak"],
    services: [
      "Emergency plumbing (24/7)",
      "Leak detection & repair",
      "Boiler repair",
      "Boiler servicing",
      "Central heating repairs",
      "Radiators & thermostats",
      "Burst pipes",
      "Drain unblocking",
      "Landlord gas safety (CP12)",
      "Bathroom plumbing",
    ],
  },
  {
    id: "boiler-installation",
    label: "Boiler Installation",
    matchers: ["boiler"],
    services: [
      "Combi boiler installation",
      "System boiler installation",
      "Boiler replacement",
      "Smart thermostat installation",
      "Power flushing",
      "Extended warranties & service plans",
    ],
  },
  {
    id: "driveways-paving",
    label: "Driveways & Paving",
    matchers: ["drive", "paving", "patio", "resin", "block pav"],
    services: [
      "Block paving driveways",
      "Resin-bound driveways",
      "Tarmac driveways",
      "Gravel driveways",
      "Patios & paths",
      "Dropped kerbs",
      "Drainage & soakaways",
      "Driveway cleaning & sealing",
      "Garden walls & edging",
      "Porcelain paving",
    ],
  },
  {
    id: "landscaping",
    label: "Landscaping",
    matchers: ["landscap", "garden design", "turf", "fencing"],
    services: [
      "Garden design",
      "Turfing & lawns",
      "Artificial grass",
      "Fencing & gates",
      "Decking",
      "Patios & paving",
      "Planting schemes",
      "Garden maintenance",
      "Water features",
      "Outdoor lighting",
    ],
  },
  {
    id: "tree-surgery",
    label: "Tree Surgery",
    matchers: ["tree"],
    services: [
      "Tree felling & removal",
      "Crown reduction & pruning",
      "Stump grinding",
      "Hedge cutting",
      "Storm damage clearance",
      "Tree surveys & reports",
    ],
  },
  {
    id: "solar-pv",
    label: "Solar PV",
    matchers: ["solar"],
    services: [
      "Solar PV installation",
      "Battery storage installation",
      "EV charger installation",
      "Solar servicing & maintenance",
      "Panel cleaning",
      "Inverter replacement",
      "Pigeon/bird proofing",
      "Monitoring setup",
      "System upgrades & extensions",
    ],
  },
  {
    id: "battery-storage",
    label: "Battery Storage",
    matchers: ["battery"],
    services: [
      "Home battery installation",
      "Retrofit to existing solar",
      "EPS/backup configuration",
      "Smart tariff optimisation",
      "System monitoring",
    ],
  },
  {
    id: "ev-charger-installation",
    label: "EV Charger Installation",
    matchers: ["ev charg", "ev-charg", "electric vehicle", "car charg", "evse"],
    services: [
      "Home EV charger installation",
      "Workplace charging",
      "Charger repairs & upgrades",
      "Smart charger setup",
      "Grant paperwork support",
    ],
  },
  {
    id: "scaffolding",
    label: "Scaffolding",
    matchers: ["scaffold"],
    services: [
      "Domestic scaffolding",
      "Commercial scaffolding",
      "Access towers",
      "Temporary roofs",
      "Chimney scaffolds",
      "Scaffold inspections",
    ],
  },
  {
    id: "carpet-cleaning",
    label: "Carpet Cleaning",
    matchers: ["carpet"],
    services: [
      "Carpet deep cleaning",
      "Upholstery cleaning",
      "Rug cleaning",
      "Stain & odour removal",
      "End-of-tenancy cleans",
      "Commercial carpet care",
    ],
  },
  {
    id: "domestic-commercial-cleaning",
    label: "Domestic/Commercial Cleaning",
    matchers: ["cleaning", "cleaner"],
    services: [
      "Regular domestic cleaning",
      "Deep cleans",
      "End-of-tenancy cleaning",
      "Office & commercial cleaning",
      "After-builders cleans",
      "Oven cleaning",
    ],
  },
  {
    id: "exterior-cleaning",
    label: "Exterior Cleaning (jet wash/render)",
    matchers: ["jet wash", "pressure wash", "render clean", "exterior clean", "gutter clean"],
    services: [
      "Driveway & patio jet washing",
      "Render cleaning (soft wash)",
      "Roof cleaning & moss removal",
      "Gutter clearing",
      "Conservatory & fascia cleaning",
      "Graffiti removal",
    ],
  },
  {
    id: "painting-decorating",
    label: "Painting & Decorating",
    matchers: ["paint", "decorat"],
    services: [
      "Interior painting",
      "Exterior painting",
      "Wallpapering",
      "Plaster repairs & prep",
      "Woodwork & trim",
      "Commercial decorating",
    ],
  },
  {
    id: "mobile-mechanic",
    label: "Mobile Mechanic",
    matchers: ["mobile mechanic"],
    services: [
      "Roadside diagnostics",
      "Brakes & discs",
      "Battery replacement",
      "Servicing at home",
      "Pre-purchase inspections",
      "Non-start callouts",
    ],
  },
  {
    id: "garage-repairs",
    label: "Garage — Clutch/Cambelt/Wetbelt",
    matchers: ["clutch", "cambelt", "wetbelt", "gearbox"],
    services: [
      "Clutch replacement",
      "Cambelt/timing belt replacement",
      "Wetbelt replacement",
      "Gearbox repairs",
      "Diagnostics",
      "Flywheel replacement",
    ],
  },
  {
    id: "mot-servicing",
    label: "MOT & Servicing",
    matchers: ["mot", "car service", "servicing"],
    services: [
      "MOT tests",
      "Interim & full servicing",
      "Brake checks",
      "Tyres & tracking",
      "Air-con regas",
      "Courtesy car / collection",
    ],
  },
  {
    id: "house-clearance",
    label: "House Clearance",
    matchers: ["house clear", "clearance"],
    services: [
      "Full house clearances",
      "Probate clearances",
      "Hoarder clearances",
      "Furniture removal",
      "Donation & recycling handling",
    ],
  },
  {
    id: "garage-clearance",
    label: "Garage Clearance",
    matchers: ["garage clearance"],
    services: [
      "Single/double garage clearances",
      "Shed clearances",
      "Loft clearances",
      "Same-day collection",
    ],
  },
  {
    id: "waste-removal",
    label: "Waste Removal (man & van)",
    matchers: ["waste", "rubbish", "man and van", "man & van"],
    services: [
      "Household waste collection",
      "Garden waste removal",
      "Builders' waste",
      "Appliance & furniture disposal",
      "Commercial waste contracts",
      "Licensed disposal & transfer notes",
    ],
  },
];

const BY_ID = new Map(TRADE_TAXONOMY.map((trade) => [trade.id, trade]));

export function getTradeDefinition(id: string): TradeDefinition | undefined {
  return BY_ID.get(id);
}

export function tradeServices(id: string): ReadonlyArray<string> {
  return BY_ID.get(id)?.services ?? [];
}

/**
 * Confidently match legacy free-text trades to a taxonomy id; null when not
 * confident — callers flag the record unclassified rather than guessing.
 */
export function matchTradeId(freeText: string): string | null {
  const lower = freeText.trim().toLowerCase();
  if (!lower) return null;
  const exact = TRADE_TAXONOMY.find((trade) => trade.label.toLowerCase() === lower);
  if (exact) return exact.id;
  for (const trade of TRADE_TAXONOMY) {
    if (trade.matchers.some((matcher) => lower.includes(matcher))) {
      return trade.id;
    }
  }
  return null;
}
