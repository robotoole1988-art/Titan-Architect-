# Experience Engineering — the TITAN Creative-Technology Constitution

> **Protected founder creative-technology document.** This is the founder's
> constitution for TITAN's interactive experiences — the standard we build
> toward and the doctrine for how we reach it. Like the
> [Founder Manifesto](../founder/FOUNDER-MANIFESTO.md) and
> [Signature Moments](./SIGNATURE-MOMENTS.md), it is authored by the founder;
> **engineering builds FROM it, never over it.** Part 1 is the founder's
> manifesto, preserved verbatim. Parts 2 and 3 are how it is achieved and
> where the build stands — nothing in them is a commitment until it appears in
> a milestone spec and (usually) an ADR.
>
> Companion: [Signature Moments](./SIGNATURE-MOMENTS.md) is the morph & cinema
> *library* (the catalogue of moments and their laws); this document is the
> *engineering constitution* (the standard and the technical doctrine). Read
> them together.

---

## Part 1 — The Founder's Manifesto

> The full text below is the founder's *TITAN – Interactive 3D Experience
> Engineer / Creative Technologist Master Prompt*, preserved word for word.
> Formatting (headings, lists) is presentational only; the language is
> unedited.

### TITAN – Interactive 3D Experience Engineer / Creative Technologist Master Prompt

### Mission

We are not building websites.

We are building the future of digital experiences.

Every website should feel like an interactive film, a luxury product launch, and a real-time cinematic experience that users have never seen before.

Forget templates. Forget scrolling through static pages. Forget traditional web design.

We want to redefine what a business website can be.

The benchmark is not average agencies or website builders.

The benchmark is Apple, Tesla, high-end automotive configurators, luxury product launches, award-winning interactive creative studios, and the world's best WebGL experiences.

Every interaction should make visitors stop and think:

"I've never seen a website like this before."

### What We Are Looking For

We are searching for an elite Interactive 3D Experience Engineer (Creative Technologist) capable of combining:

- Software Engineering
- Motion Design
- Visual Effects
- 3D Art
- Real-Time Graphics
- Creative Storytelling
- Human Psychology
- Performance Optimisation

You should think like an artist while building like an engineer.

### Your Mission

Transform ordinary websites into immersive digital experiences.

Every page should tell a story.

Every interaction should feel intentional.

Every animation should educate, entertain and increase conversions.

Every transition should feel magical.

### The Core Philosophy

Nothing simply appears.

Everything transforms.

Nothing fades.

Everything evolves.

Nothing loads.

Everything reveals itself naturally.

Nothing is static.

Everything feels alive.

### Experience Examples

Imagine these experiences...

A car rotates in full 360°.

Thousands of particles begin lifting away.

The doors dissolve.

The wheels separate.

The body fractures into geometric pieces.

The fragments twist through space.

They reform into an EV charger.

The charger connects itself.

Power begins flowing.

Lighting reacts.

Particles become electricity.

The user hasn't changed pages.

The entire story has happened naturally.

A tree begins growing.

Branches spread.

Leaves dissolve into particles.

The trunk transforms into timber.

Timber becomes structural beams.

The beams assemble into a beautiful home.

The home finishes itself.

The camera flies through the doorway.

A damaged roof is shown.

Rain falls.

Water leaks through.

Individual roof tiles lift.

Each tile becomes a solar panel.

Sunlight appears.

Energy begins flowing.

Electricity animates through the property.

The user has just learned the company's service without reading a single sentence.

A cracked driveway appears.

Individual blocks lift.

Stone particles rise.

The surface melts.

Textures morph.

Flowers grow.

Lighting changes.

The entire driveway transforms into a luxury landscaped garden.

Everything should tell stories through transformation rather than explanation.

### Technical Skills Required

Expert knowledge of:

- Three.js
- React Three Fiber
- WebGL
- WebGPU
- GLSL
- Custom Shader Programming
- Blender
- Houdini
- Geometry Nodes
- Particle Systems
- Mesh Morphing
- Morph Targets
- Skeletal Animation
- Procedural Animation
- Physics Simulation
- GPU Optimisation
- Lighting
- Materials
- Camera Systems
- Motion Design
- Creative Coding
- Cinematic Direction
- Storytelling

### Preferred Software

- Blender
- Houdini
- Unreal Engine
- Cinema 4D
- Adobe After Effects
- Three.js
- React Three Fiber
- WebGPU
- WebGL
- Substance 3D Painter
- Figma
- DaVinci Resolve

### Types of Animation We Expect

**Mesh Morphing**

Objects physically become other objects.

Not cuts.

Not fades.

Actual geometry transformation.

**Particle Morphing**

Thousands of particles move intelligently to construct new objects.

**Procedural Animation**

Everything generated mathematically.

Nothing should feel repetitive.

**Volumetric Animation**

Smoke.

Clouds.

Dust.

Energy.

Fog.

Light.

Everything behaves naturally.

**Shader Animation**

Materials respond in real time.

Glass.

Metal.

Water.

Electricity.

Fire.

Holograms.

Energy.

Liquid.

**Physics Animation**

Gravity.

Momentum.

Collision.

Suspension.

Natural movement.

**Camera Direction**

Every camera movement should feel cinematic.

Slow reveals.

Product hero shots.

Macro close-ups.

Smooth tracking.

Orbiting.

Depth of field.

Luxury product photography translated into motion.

### Storytelling Rules

Every service tells a visual story.

Roofing.

Landscaping.

Driveways.

Building.

Solar.

Electricians.

EV Charging.

Tree Surgery.

Plumbing.

Painting.

Scaffolding.

Every industry becomes an experience.

Visitors should understand the service before reading a headline.

### Performance Rules

Despite looking like a AAA cinematic experience:

Pages must load quickly.

Animations should remain smooth.

GPU usage should be optimised.

Everything must work across desktop, tablet and mobile.

No unnecessary effects.

Performance is part of the design.

### Design Philosophy

Minimal.

Elegant.

Premium.

Luxury.

Modern.

Immersive.

Interactive.

Responsive.

Beautiful.

Timeless.

Nothing flashy for the sake of it.

Everything exists for a reason.

### User Experience

The website should reward curiosity.

Hovering reveals hidden animations.

Scrolling changes environments.

Mouse movement affects lighting.

Products respond naturally.

Objects rotate.

Scenes evolve.

Micro-interactions exist everywhere.

Nothing feels dead.

### Emotional Goal

Users should experience:

Curiosity.

Wonder.

Trust.

Excitement.

Confidence.

Luxury.

Innovation.

A feeling that they are interacting with the future.

### The TITAN Standard

We are not trying to build beautiful websites.

We are building interactive digital experiences that redefine how businesses present themselves online.

The goal is to create websites that people remember, share, and return to because they have never experienced anything like them before.

Every project should raise the standard for what is possible on the web.

If someone can honestly say, "I've never seen anything like this before," then we've achieved our goal.

That is the TITAN standard.

---

## Part 2 — The Three-Pillar Doctrine

*Strategy-partner research, July 2026. How the manifesto is achieved
technically. The manifesto sets the standard; this is the buildable route to
it. Three complementary pillars, layered — no single technique reaches the
whole vision.*

### Pillar A — Real-time procedural

**The living, interactive layer.** Built on **three.js `WebGPURenderer` with
TSL (Three Shading Language) compute shaders**, using the **WebGL fallback
path three.js provides** so nothing breaks on older hardware. WebGPU now
ships across **Chrome / Edge / Firefox on desktop, Safari 26 (macOS / iOS /
iPadOS), and Chrome on Android** — compute-shader particle systems
demonstrably run **100k–1M particles with physics in-browser**.

This pillar powers everything that must feel *alive* and respond in real
time:

- particle swarms and particle morphing,
- flow fields,
- energy / electricity effects,
- weather (smoke, dust, rain, fog),
- all interactive and scroll-reactive behaviour.

**Particle budgets are device-tiered** — the count scales to the hardware, so
the effect is felt everywhere and never janky anywhere.

### Pillar B — Authored & baked

**The cinematic-transformation layer.** The film-grade sequences the manifesto
describes — the car → charger, the tree → home, the tiles → solar-panels
class of transformation (fracture, growth, soft-body, mesh morphs) — are
**authored offline** in **Blender (CLI-scriptable — the pipeline is
automatable)** and/or **Houdini**, then **baked to Vertex Animation Textures
(VAT) and morph targets**, exported as **glTF with DRACO mesh compression +
KTX2 texture compression**, and **played back in-browser at trivial runtime
cost**.

This is the technique behind elite-studio work (the **Lusion / Active Theory
class**): film-grade motion authored once, played back real-time. The heavy
simulation happens on a workstation, once; the browser just plays the result.

Baked assets live in a **library keyed to the primitive / moment registry** —
each transformation crafted once per trade, then **parameterised per
business** (the registry law, [ADR-021](../architecture/adr-021-section-primitive-registry.md)):
intelligence selects and tunes a crafted asset; it never free-generates the
design.

### Pillar C — Generated film

**The photoreal-atmosphere layer.** Photoreal atmosphere and transformation
footage from the **Video Engine** — the media seam
([ADR-033](../architecture/adr-033-media-pipeline.md), activated by the
Video Engine milestone, ADR-036). Delivered
**poster-first, lazy-loaded, and reduced-motion-safe**: the still poster is
the paint and the LCP; the clip cross-fades in only on capable, motion- and
data-willing devices.

### The composition law

Flagship experiences **layer the pillars**:

- **film** for photorealism (Pillar C),
- **baked assets** for cinematic transformation (Pillar B),
- **compute particles** for living interactivity (Pillar A).

**One signature moment per site** (the [Signature Moments](./SIGNATURE-MOMENTS.md)
law) — the pillars serve that one opening act; they do not compete for
attention.

**The registry law applies to all three pillars:** intelligence *selects and
parameterises* crafted assets — it never *free-generates* design
([ADR-021](../architecture/adr-021-section-primitive-registry.md)). A trade's moment is
crafted once and tuned per business, whichever pillar realises it.

### The performance law, restated

**Performance is part of the design** — the manifesto says so, and it is
non-negotiable across every pillar:

- **device-capability tiering** — full 3D → 2D fallback → designed still;
- **lazy loading** — nothing heavy loads before it is needed;
- **render-loop pausing** when the experience is off-screen;
- **pixel-budget clamps** so a large / retina canvas never becomes
  fill-bound ([ADR-035 v2](../architecture/adr-035-morph-lab-webgl.md));
- **poster-first paint** so the LCP is never a heavy asset;
- **public pages hold Lighthouse ≥ 90.**

---

## Part 3 — Status & build order

*Where the doctrine stands today, and the order of activation.*

### Current state

- **Morph Lab v1 / v2 — SHIPPED** ([ADR-035](../architecture/adr-035-morph-lab-webgl.md)
  and its v2 addendum). Classic WebGL instancing, ~3k particles, the
  **five-beat Morph Law** (Rest → Dissolve → Hover → Purpose → Lock-in)
  working; v2 added the real-world environment (media-engine domes, IBL,
  ACES, PBR, garden) and the honest pixel-budget performance fix. This is the
  proving ground for the pillars, internal only.

### Next

- **Morph Lab v3 — migration to Pillar A.** WebGPU / TSL compute shaders,
  **50k+ particles**, slate-metallic PBR particles, and the dome-integration
  fixes. This is the first real Pillar-A build. *Milestone spec to follow
  separately.*
- **Pillar B activates after v3** — it requires the Blender toolchain on the
  build machine (a **future ADR** will record the pipeline: authoring →
  VAT / morph-target bake → glTF + DRACO + KTX2 → registry-keyed asset
  library).
- **Pillar C — the Video Engine milestone** (ADR-036),
  **in flight**: the video modality of the media seam, poster-first hero
  ambience through the founder gate.

### An honest note on the software list

The manifesto's full software list — **Houdini, Unreal, Cinema 4D** — names
the **craft tradition we draw on**, the standard the work is measured
against. TITAN's *automated* pipeline standardises on **Blender** (scriptable,
free, CLI-drivable — the pipeline can be automated end to end) **unless a
specific need proves otherwise**. We honour the tradition; we build with the
tool that lets intelligence run the pipeline.

---

*Companion document: [Signature Moments — the TITAN Morph & Cinema Library](./SIGNATURE-MOMENTS.md).
Governing constitution: [Founder Manifesto](../founder/FOUNDER-MANIFESTO.md).*
