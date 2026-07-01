<div align="center">

# TITAN Architect

**The internal operating system for designing, managing, and evolving the TITAN ecosystem.**

</div>

---

> [!IMPORTANT]
> ## 📜 Read this first: the [**TITAN Founder Manifesto**](docs/founder/FOUNDER-MANIFESTO.md)
>
> The [Founder Manifesto](docs/founder/FOUNDER-MANIFESTO.md) is the **constitution of TITAN** — its mission, vision, principles, and non-negotiable standards. **Every contributor, human or AI, must read it in full before contributing.** It governs every decision made in this repository.

---

## What is TITAN?

TITAN is building the world's most advanced **AI Growth Operating System for local businesses** — helping them become the dominant company in their local market. See the [Manifesto](docs/founder/FOUNDER-MANIFESTO.md) for the full vision.

**TITAN Architect** is the internal platform where TITAN itself is designed, documented, and coordinated.

## Documentation

| Area | Where |
| --- | --- |
| 📜 **Founder Manifesto** (the constitution) | [`docs/founder/FOUNDER-MANIFESTO.md`](docs/founder/FOUNDER-MANIFESTO.md) |
| 🔭 **Product Vision** (what we're building) | [`docs/founder/VISION.md`](docs/founder/VISION.md) |
| 🏛️ **Architecture Charter** (binding structural rules) | [`docs/architecture/architecture-charter.md`](docs/architecture/architecture-charter.md) |
| 🧭 **Architecture Decision Records (ADRs)** | [`docs/architecture/`](docs/architecture/README.md) |
| 📄 **Product Requirement Documents (PRDs)** | [`docs/prd/`](docs/prd/README.md) |

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS + shadcn/ui · dark theme by default.

Architecture boundaries are enforced automatically (ESLint) and every change runs through CI (lint · type-check · build).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Quality gates:

```bash
npm run lint       # code quality + architecture boundaries
npm run typecheck  # tsc --noEmit
npm run build      # production build
```
