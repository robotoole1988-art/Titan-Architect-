# ADR-044: The technical/skilled-trades archetype — an 8th buying mode + theme

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Robert O'Toole
- **Tags:** experience, renderer, primitives, theme, archetype, strategy, taxonomy
- **Supersedes:** —
- **Superseded by:** —

## Context

TITAN has four crafted looks — storm/emergency (roofing), Golden Hour/premium
(driveways), Quiet Confidence/care (trust trades, ADR-043). The largest
uncovered chunk of the 35-trade taxonomy is the **skilled / energy-tech
cluster**: electricians, HVAC/air-con, boiler installation, solar PV, battery
storage, EV chargers. They sell on **capability, certification, and clean
workmanship** — modern, precise, future-proof — not urgency or luxury.

Exploration of the seven existing archetypes showed **no coherent home** for
this cluster:

- `emergency` (crafted) already absorbed the electrical/heating installers via
  keyword (`electric`, `hvac`, `boiler`), dressing planned solar/EV/heat-pump
  installs in the **storm/urgency** theme — wrong register for a considered,
  certified purchase.
- `general` (uncrafted fallback, highest coverage ~9) is a grab-bag — tree
  surgery, mechanics, clearance **and** solar/EV — not a cluster.
- `recurring` (uncrafted, ~4) is cleaning/gardening; `event` is empty.

So "build the highest-coverage uncrafted archetype" and "give the skilled
cluster its own archetype" pointed in different directions. The founder's call:
**create a dedicated 8th archetype** and pull the coherent cluster into it,
leaving genuinely-emergency response (emergency plumbing & heating, damp, drains,
locksmith, pest) on the storm theme.

## Decision

**Add `technical` as the 8th `TradeArchetype`** — the considered, credentials-led
buying mode for skilled/energy-tech installers — with its own crafted theme,
strategy intelligence, imagery brief, and section sequence. Registry law holds
(ADR-021): the archetype **composes** existing crafted primitives; nothing is
free-generated.

### Strategy mapping (re-map, deliberately)

The care-style keyword classifier gains a `technical` entry checked **before**
`emergency`, and the moved keywords leave `emergency`:

- → `technical`: **electric, solar, battery, ev charger / ev-charger, hvac,
  air con / air conditioning, boiler, heat pump, renewable, underfloor heating**.
- `emergency` keeps the true 999-jobs: **plumb, heating, gas, locksmith, drain,
  damp, pest, glazier, emergency glazing, lock**.

Net effect: Electricians, HVAC/Air-Con, Boiler Installation, Solar PV, Battery
Storage, EV Charger Installation → **technical**; "Plumbing & Heating
(emergency)", Damp Proofing → **emergency** (unchanged).

### The theme — "Live Wire" (`titan-technical`)

A modern, precise, **engineered** register, distinct from the other four: a
crisp cool-white/graphite ground (reliable and clean), a deep ink-navy, and ONE
confident **electric-blue** signal accent (energy/trust) with a supporting
energy-teal. Mono-forward labels (kW figures, spec/eyebrow text) read as a
spec sheet. It reuses the grotesque display — the palette + mono carry the
technical identity; it is neither storm-dark-amber, Golden-Hour-warm-bronze, nor
care-sage-serif.

### The primitive sequence

The cluster's primitives already exist and are crafted (ADR-022/029/043) — the
archetype curates them into a **capability-led** sequence and gains `technical`
affinity where relevant:

hero (split-editorial) → **credential band** (the certifications — NICEIC, MCS,
Gas Safe, F-Gas — the capability proof) → service explorer (the install offer) →
process journey (survey → fixed quote → clean install → certificate handover) →
**portfolio showcase** (real installs, workmanship) → review wall → service area
→ reassurance FAQ → lead capture (fixed-quote / survey flow). Area pages follow
the shared anti-doorway landing sequence (ADR-028).

### Accreditations + close rates

`accreditationsFor` gains the real bodies: solar/battery/EV/renewable/heat-pump
→ **MCS certified** (+ NICEIC); HVAC/air-con → **F-Gas / REFCOM**; boiler stays
**Gas Safe**; electricians stay **NICEIC / Part P**. The exhaustive
`Record<TradeArchetype>` tables (`CLOSE_RATE_BY_ARCHETYPE`, ads
`INTENT_MODIFIERS`) gain a `technical` key (considered install: modest close
rate; cost/installers/quote intent).

### The Flux imagery brief

Every technical media slot briefs the media engine for **real UK tradespeople at
work** — a clean modern install (a solar array, an EV charger, a consumer unit,
a heat pump), precise and tidy workmanship in natural light. Authentic, **no
stock**. Generating the photos remains a gated, later step (no images generated
here).

## Consequences

**Positive** — the biggest uncovered cluster gets a coherent, sellable identity;
planned energy-tech installs stop wearing the storm theme; the platform proves
the archetype system extends cleanly to an 8th mode.

**Negative / watch-list** — a handful of electricians/plumbers do urgent
callouts too; those businesses can be pinned to `emergency` per-record later if
the founder wants (the classifier is a default, not a cage). The technical
strategy copy is install-framed; a pure break-fix electrician reads slightly
off until per-record overrides land.

## Out of scope

No free-generation; no new external services; no changes to the storm, Golden
Hour, or care themes; no image generation (brief only, gated later); no
fabricated reviews or credentials.

## Verification

- `classifyArchetype` maps the cluster → `technical`; emergency plumbing/damp
  stay `emergency`.
- `resolveTheme("titan-technical")` returns the crafted theme (not the default).
- A technical blueprint composes the technical sequence with **zero**
  placeholders and `themeRef: titan-technical`.
- One demo (a solar/EV installer) generates end-to-end — homepage + unique area
  pages, JSON-LD, anti-doorway passing — screenshotted per section for the
  founder's premium/not-cheap judgment before it ships.
- Lighthouse ≥ 90 on a production build. Gates + CI green.
