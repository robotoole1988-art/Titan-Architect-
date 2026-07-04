# Signature Moments — the TITAN Morph & Cinema Library

> **Protected founder creative document.** This is the creative canon for
> TITAN's cinematic web experiences — the founder's morph library and the
> laws that govern it. Like the [Founder Manifesto](../founder/FOUNDER-MANIFESTO.md),
> it is edited by the founder; engineering builds FROM it, never over it.
> Nothing here is a build commitment until it appears in a milestone spec
> (see [Status & Roadmap](#status--roadmap)).

---

## The Laws

1. **A signature moment is a scroll-driven morph where one thing naturally
   becomes another** — the visitor should never consciously notice the
   transition.
2. **ONE signature moment per site — the opening act.** Everything else is
   supporting cast.
3. **Performance is law: Lighthouse ≥90.** SVG/canvas vector morphs, never
   video files ([ADR-022](../architecture/adr-022-website-renderer.md),
   [ADR-029](../architecture/adr-029-premium-primitive-set.md)).
4. **Reduced-motion always resolves to a designed still.**
5. **Every moment tells the trade's story. Decoration gets cut.**
6. **Intelligence composes crafted moments, never free-generates** (registry
   law, [ADR-021](../architecture/adr-021-section-primitive-registry.md)).
   The Experience Engine will eventually select and parameterise moments per
   business — brand colours, house style — from this library.

---

## The Five Cinematic Systems

1. **The Three-Act Scroll** — every site is structured as film: **Act I**
   the problem's atmosphere (storm, stain, clutter) → **Act II** the craft
   (process, precision, care) → **Act III** the pride (result, family,
   status). The signature morph bridges Act I to Act III.
2. **Continuity Transitions** — between pages, one element survives and
   morphs (the hero's roofline becomes the next page's header rule). The
   site feels like one continuous place.
3. **Trade-Metaphor Progress** — the scroll indicator IS the trade: a pipe
   filling, a battery charging, a roof completing course by course.
4. **Micro-Morph Vocabulary** — buttons, icons, form fields speak the
   trade's language: the call button ripples like a droplet on the
   plumber's site, sparks softly on the electrician's.
5. **The Living Atmosphere** — sites subtly aware of time and weather: dusk
   visitors see golden hour; a real storm inbound shifts a roofer's site
   into emergency mode. See [The Living Website](../founder/IDEAS.md#the-living-website)
   in the founder ideas register.

---

## The Morph Catalogue (Founder)

### 🏠 Roofing — *Story: protection from the elements*
- **Storm Cloud → New Roof** — dark clouds morph into the roof shape before
  revealing the property.
- **Water Leak → Roof Tile** — a falling droplet becomes a perfectly
  aligned tile.
- **Lightning → Company Logo.**
- **Old Roof → New Roof** — the roof reconstructs itself on scroll.
- **Broken Roof → Shield** — safety symbolism.

### 🌳 Landscaping — *Story: transformation*
- **Seed → Tree.**
- **Dead Garden → Luxury Garden** — leaves fall, everything blooms.
- **Water Drop → Pond.**
- **Stone → Patio** — stones connect themselves.
- **Flower Bud → Garden** — flower opens, garden reveals.

### 🚗 Driveways — *Story: arrival, first impressions*
- **Gravel → Resin** — loose gravel melts into luxury resin.
- **Car Reflection** — reflection in paintwork becomes the driveway.
- **House Outline** — wireframe fills, driveway appears beneath.
- **Rain** — wet surface dries into premium finish.

### ⚡ Electricians — *Story: power, precision*
- **Lightning → Circuit Board.**
- **Light Bulb → Smart Home** — filament morphs into a house.
- **Plug → Home** — plug unfolds into the floorplan.
- **Circuit Paths** — current becomes navigation lines.

### 🚰 Plumbing — *Story: flow, reliability*
- **Droplet → Tap.**
- **Water Pipe** — pipe grows across screen; transitions become page
  dividers.
- **Water Ripple → Bathroom.**
- **Leak → Flow** — broken pipe repairs itself.

### 🧱 Builders — *Story: creation*
- **Blueprint → Building** — wireframe fills with materials.
- **Brick → House.**
- **Steel Beam → Structure.**
- **Planning Drawing → Reality.**

### 🌲 Tree Surgeons — *Story: nature cared for*
- **Sapling → Oak.**
- **Autumn Leaves → Logo.**
- **Dangerous Tree → Healthy Canopy.**
- **Log Rings → Navigation circles.**

### 🪟 Windows — *Story: light*
- **Sunrise fills the room.**
- **Old Window** — glass cracks, repairs itself.
- **Condensation clears** revealing the perfect view.

### 🦷 Dentists — *Story: confidence*
- **Smile transformation.**
- **Tooth Outline → Real Tooth.**
- **Sparkle** as navigation transition.

### ⚖ Solicitors — *Story: order from complexity*
- **Scattered papers organise themselves.**
- **Balance scales level** on scroll.
- **Signature ink → Logo.**

### 🚘 Car Detailing
- **Droplets → Polished Paint.**
- **Reflection sharpens** to mirror finish.
- **Foam reveals** pristine car.

### 🧹 Cleaning
- **Dust → Sparkle.**
- **Dirty Room → Luxury Interior.**

### 🏗 Scaffolding
- **Steel Pole → Entire Scaffold.**
- **Blueprint → Construction Site.**

### 🌞 Solar
- **Sun → Solar Panel → Electric Flow → Home.**

### 🏡 Conservatories
- **Rain → Glass Roof → Sunlight.**

### 🧱 Brickwork
- **Brick → Wall → Home.**

### 🏊 Pools
- **Water Ripple → Luxury Pool → Family Enjoying It.**

### 🏠 Extensions
- **Blueprint → Wall Appears → Room Expands.**

### 🛣 Tarmac
- **Loose Stone → Fresh Tarmac → Luxury Entrance.**

### 🌿 Artificial Grass
- **Brown Ground → Green Lawn → Children Playing.**

### 🎨 Decorators
- **Paint Splash → Finished Room.**
- **Roller → Entire Wall.**

### 🔥 Chimney
- **Smoke → Warm Fire → Happy Family.**

### 🌧 Damp Proofing
- **Water → Barrier → Dry Wall.**

### 🌬 HVAC
- **Cold Air → Warm Home.**
- **Snowflake → Sun.**

---

## The Morph Catalogue (Strategy Partner additions)

### Roofing
- **Rain on Glass** — rain streaks a pane; droplets merge into the logo,
  wipe away to the finished roof.
- **Tile Cascade** — tiles fly in one by one with scroll, roof completing
  at the CTA.
- **Thermal Shift** — heat-leak glow cools to protected, insulated blue.

### Driveways
- **Headlight Sweep** — night scene, headlights curve across the frontage
  revealing the driveway, dawn breaks to full reveal.
- **Tessellation** — blocks click into herringbone rhythm with scroll.
- **Boundary Ribbon** — aerial line draws the property edge, floods inward
  with finished surface.

### Landscaping
- **The Seasons Wheel** — the site passes spring → summer as you scroll;
  the garden matures with you.
- **The Rill** — a thin water channel runs down the page, leading the eye,
  feeding each section.

### Solar / Battery / EV
- **Sun Arc** — sun crosses the page with scroll; rays resolve into panel
  gridlines.
- **Meter Spin** — electricity meter slows, stops, reverses.
- **Night Proof** — page dims to night — the house stays lit from its
  stored core.
- **The Cable** — EV charging cable draws itself as the scroll progress
  line; battery percentage fills as you read.

### Scaffolding
- **The Assembly** — poles and couplers click into an isometric structure
  as you scroll; the scaffold strikes at the end, revealing the finished
  building — the whole trade in one scroll.

### Plumbing & Heating
- **The Solder Line** — copper pipe as section dividers, joints soldering
  with a glow as you pass.
- **Ignition** — boiler flame lights; a warmth gradient spreads through the
  page.
- **Steam Clear** — condensation fades to the luxury bathroom.

### Carpet / Exterior Cleaning
- **THE MAGIC WIPE** — the visitor drags to clean: a pressure-washer stripe
  across mossed patio, a wand stripe across stained carpet, grime wiping
  off render. One interaction mechanic, skinned per trade — the visitor
  performs the transformation themselves. **Flagship interactive
  primitive.**

### Painting & Decorating
- **Roller Reveal** — every section transition is a roller stroke painting
  the next section in.
- **The Peel** — masking tape strips away to razor-sharp colour edges.

### Mechanics / MOT
- **The Assembly, engine version** — exploded engine parts float into place
  with scroll, torqued home at the CTA.
- **Dashboard Dawn** — warning lights blink off one by one until only a
  green tick remains.
- **The Stamp** — MOT checklist items thunk-stamp as they pass.

### Clearance / Waste
- **The Lift** — a cluttered room's items float up and away one by one,
  light flooding the emptied space.
- **Skip Tetris** — the load packs itself with satisfying precision.

### Tree Surgery
- **Canopy Light** — as branches are pruned, sun shafts break through and
  illuminate each section.
- **The Rings** — tree rings expand as a timeline of the company's years.

---

## Status & Roadmap

| Moment | Status |
| --- | --- |
| Everything above, unless listed below | Concept |
| Roofing — Storm Cloud → New Roof | **v1 — next build** |
| Roofing — Tile Cascade | **v1 — next build** |
| Driveways — Gravel → Resin | **v1 — next build** |
| Driveways — Headlight Sweep | **v1 — next build** |
| The Magic Wipe | **Flagship interactive primitive — v1 candidate** |
