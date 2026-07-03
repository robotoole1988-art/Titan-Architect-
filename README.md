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
npm test           # vitest (contract + engine + renderer suites)
```

## Durable persistence in 5 minutes (Supabase)

Out of the box TITAN runs on a **zero-setup in-memory store**: everything
works, but data lasts only until the dev server restarts. To make businesses,
strategies, and blueprints durable (synced across devices, backed up):

1. Create a free project at [supabase.com](https://supabase.com) (any region).
2. Open the project's **SQL Editor**, paste the contents of
   [`supabase/migrations/20260703010000_business_spine.sql`](./supabase/migrations/20260703010000_business_spine.sql),
   and run it once.
3. Copy `.env.example` to `.env.local` and fill in both values from
   **Project Settings → API**:
   - `SUPABASE_URL` — the Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — the `service_role` secret (server-side
     only; it never reaches the browser — ADR-023)
4. Restart `npm run dev`. The `/businesses` page footer switches from
   “in-memory” to “Supabase (durable)”.

That's it — a business saved today is still there after a restart and from any
other machine. (`supabase db push` with the Supabase CLI applies the same
migration if you prefer the CLI.)
