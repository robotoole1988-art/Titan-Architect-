/**
 * The canonical trade taxonomy (ADR-026): the founder's thirty-five trades (v2 workbook), each
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
  // ---- v2 expansion (TITAN-CPL-Benchmarks-v2, 35 trades) ----
  {
    id: "electricians",
    label: "Electricians",
    matchers: ["electric", "sparky", "rewir", "fuse board", "eicr"],
    services: [
      "Emergency electrician (24/7)",
      "Full & partial rewires",
      "Fuse board (consumer unit) upgrades",
      "EICR safety certificates",
      "EV charger wiring",
      "Lighting design & installation",
      "Smart home & security wiring",
      "Landlord electrical certificates",
    ],
  },
  {
    id: "builders-general",
    label: "Builders (General)",
    matchers: ["builder", "building contractor", "general build"],
    services: [
      "New builds",
      "Structural alterations",
      "Garage conversions",
      "Groundworks & foundations",
      "Project management",
      "Insurance & remedial work",
    ],
  },
  {
    id: "extensions-renovations",
    label: "Extensions & Renovations",
    matchers: ["extension", "renovation", "refurb", "loft conversion"],
    services: [
      "Single-storey extensions",
      "Double-storey extensions",
      "Loft conversions",
      "Full house renovations",
      "Kitchen & bathroom refits",
      "Open-plan conversions & steels",
      "Planning & building regs support",
      "Design & build packages",
    ],
  },
  {
    id: "windows-doors",
    label: "Windows & Doors (Double Glazing)",
    matchers: ["double glazing", "upvc", "window", "glazing", "bifold", "composite door"],
    services: [
      "uPVC windows",
      "Aluminium windows",
      "Composite front doors",
      "Bifold & sliding doors",
      "Sash window replacement",
      "Misted/failed unit replacement",
      "French doors & patio doors",
      "Trickle vents & building regs compliance",
    ],
  },
  {
    id: "conservatories",
    label: "Conservatories",
    matchers: ["conservator", "orangery"],
    services: [
      "New conservatories",
      "Orangeries",
      "Solid conservatory roof conversions",
      "Conservatory refurbishment",
      "Glazed extensions",
    ],
  },
  {
    id: "dentists-private",
    label: "Dentists (Private)",
    matchers: ["dentist", "dental", "implant", "invisalign"],
    services: [
      "New patient examinations",
      "Hygiene appointments",
      "Dental implants",
      "Invisalign & orthodontics",
      "Teeth whitening",
      "Veneers & cosmetic dentistry",
      "Emergency dental care",
    ],
  },
  {
    id: "solicitors",
    label: "Solicitors",
    matchers: ["solicitor", "law firm", "legal", "conveyanc"],
    services: [
      "Residential conveyancing",
      "Family law",
      "Wills, trusts & probate",
      "Personal injury",
      "Employment law",
      "Litigation & disputes",
    ],
  },
  {
    id: "car-detailing",
    label: "Car Detailing",
    matchers: ["detailing", "valeting", "ceramic coating"],
    services: [
      "Full detail (interior + exterior)",
      "Ceramic coating",
      "Paint correction",
      "Interior deep clean",
      "Mobile valeting",
      "New-car protection packages",
    ],
  },
  {
    id: "brickwork",
    label: "Brickwork",
    matchers: ["brick", "repointing", "masonry"],
    services: [
      "Garden & boundary walls",
      "Repointing",
      "Structural brickwork",
      "Chimney rebuilds",
      "Porches & piers",
    ],
  },
  {
    id: "swimming-pools",
    label: "Swimming Pools",
    matchers: ["swimming pool", "pool build", "pool install"],
    services: [
      "New pool design & build",
      "Indoor pools",
      "Pool refurbishment",
      "Liners & covers",
      "Heating & filtration",
      "Servicing & maintenance plans",
    ],
  },
  {
    id: "tarmac-surfacing",
    label: "Tarmac & Surfacing",
    matchers: ["tarmac", "surfacing", "asphalt"],
    services: [
      "Tarmac driveways",
      "Car parks & forecourts",
      "Roadways & access lanes",
      "Resurfacing & overlays",
      "Line marking",
    ],
  },
  {
    id: "artificial-grass",
    label: "Artificial Grass",
    matchers: ["artificial grass", "astro turf", "astroturf", "fake grass"],
    services: [
      "Artificial lawn installation",
      "Pet-friendly turf",
      "Play areas & schools",
      "Putting greens",
      "Roof terraces & balconies",
    ],
  },
  {
    id: "chimney-fireplaces",
    label: "Chimney & Fireplaces",
    matchers: ["fireplace", "log burner", "wood burner", "stove install", "chimney sweep"],
    services: [
      "Log burner & stove installation",
      "Chimney sweeping",
      "Flue lining",
      "Fireplace renovation",
      "HETAS certification",
    ],
  },
  {
    id: "damp-proofing",
    label: "Damp Proofing",
    // "damp proofing" (two words) must out-rank roofing's "roof", which
    // hides inside the word "proofing" — the substring trap.
    matchers: ["damp proofing", "damp proof", "rising damp", "damp", "condensation control", "basement tanking"],
    services: [
      "Rising damp treatment",
      "Penetrating damp repairs",
      "Condensation & mould control",
      "Basement tanking & waterproofing",
      "Timber & woodworm treatment",
      "Damp surveys",
    ],
  },
  {
    id: "hvac-air-conditioning",
    label: "HVAC / Air Conditioning",
    matchers: ["hvac", "air con", "aircon", "heat pump", "ventilation"],
    services: [
      "Air conditioning installation",
      "Air source heat pumps",
      "AC servicing & regas",
      "Commercial HVAC",
      "Ventilation & MVHR",
      "F-Gas compliance",
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
  // The most SPECIFIC matcher wins — more words beat fewer ("swimming pool
  // builder" is a pool trade, not a general builder). Equal specificity
  // falls back to taxonomy order ("Emergency Roofing & Drainage" stays
  // roofing: "roof" and "drain" tie, roofing comes first).
  let best: { id: string; words: number } | null = null;
  for (const trade of TRADE_TAXONOMY) {
    for (const matcher of trade.matchers) {
      const words = matcher.trim().split(/\s+/).length;
      if (lower.includes(matcher) && (!best || words > best.words)) {
        best = { id: trade.id, words };
      }
    }
  }
  return best?.id ?? null;
}
