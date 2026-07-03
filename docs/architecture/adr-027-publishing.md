# ADR-027: Publishing — multi-tenant serving, snapshots, and enquiry capture

- **Status:** Accepted
- **Date:** 2026-07-06
- **Deciders:** Robert O'Toole
- **Tags:** architecture, publishing, serving, core, renderer
- **Supersedes:** —
- **Superseded by:** —

## Context

Websites end at an internal preview; the deliverable a customer pays for is a
LIVE site that produces enquiries. Two hard problems hide in "go live":
(1) a regenerated blueprint must never silently change a customer's live
site, and (2) a visitor's enquiry must land against the right customer's
account inside TITAN — closing the loop the whole platform exists for.

## Decision

### Multi-tenant serving from the one app (v1)

Published sites are served by the SAME Next.js app under a chrome-free root
layout (the multiple-root-layouts pattern, ADR-022):

- **By slug:** `/sites/[slug]` — every publication gets a stable, unique slug
  derived from the business name.
- **By hostname:** `src/middleware.ts` rewrites requests whose host is not
  the TITAN app host to an internal host-resolver route. Resolution is
  table-driven (`site_domains`: hostname → business), with a
  `<slug>.localhost` convention for local demos. The README documents the
  real-domain go-live path (DNS A/CNAME to the hosting deployment; on Vercel:
  wildcard + per-customer custom domains attached to the one project — the
  founder provisions hosting when ready).

**Trade-off vs per-client deployments:** one app means one deploy, shared
caching, zero per-client provisioning, and the renderer's performance
discipline applies everywhere — at the cost of shared fate (an app bug
touches every site) and a single scaling unit. At v1's site count this is
overwhelmingly the right trade; per-client deployments (isolated builds from
the same blueprint, likely via the platform API) are v2 when scale or
isolation demands them.

### Publications: immutable, gated snapshots

"Go live" on the website build item creates a **Publication** pinning the
EXACT blueprint artifact version. Regenerating a blueprint changes nothing
live: the served page loads `artifacts.getVersion(businessId, "blueprint",
publication.blueprintVersion)`. **Republish is explicit** and passes the same
founder-approval gate (the website item is staged back to review → approved →
go live → next publication version; the old publication serves until that
moment, then becomes `superseded` — never mutated). Unpublish takes the site
offline (`unpublished`), leaving history intact. The build item tracks
PRODUCTION state; the publication tracks SERVING state — both are shown.

### Serving quality

The public page is the preview pipeline minus chrome: the same Renderer,
lazily-hydrated client bundle, and generated poster. SEO fundamentals come
from the blueprint's SEO aspects via `generateMetadata` (title, description,
OG, canonical), plus per-site `robots.txt` and `sitemap.xml` route handlers.

### Enquiries: a new entity, deliberately not a pipeline lead

A published site's callback form POSTs to a public endpoint
(`/api/enquiries`) which runs the core `processEnquiry` workflow: resolve the
live publication by slug, validate, store the **Enquiry** (name, contact,
message, source page, publication id) against the CUSTOMER'S account, and log
to the activity feed. Enquiries are the customer's sales leads, not TITAN's —
mixing them into the CRM pipeline would conflate two funnels. Anti-spam
basics: a honeypot field (silently dropped — bots believe they succeeded) and
a per-IP sliding-window rate limit (`lib/rate-limit`, in-memory — adequate
per-process, swap for a shared store when serving scales out).
**Notification seam:** enquiry creation is a single workflow function; an
email/SMS notifier plugs in there once a provider is chosen (out of scope).

## Consequences

### Positive
- The chargeable loop closes: approve → live URL → visitor enquiry → the
  customer's account in TITAN, attributed to the publication that produced it.
- Snapshot semantics make republishing safe and auditable; nothing live ever
  changes without the founder's explicit, gated action.
- One serving stack: preview and production cannot drift.

### Negative / Trade-offs
- Shared-fate serving (v1 accepted; per-client deploys are v2).
- Rate limiting is per-process memory; multi-instance hosting needs a shared
  store (noted in code).
- Custom domains are table-driven with no management UI yet — inserts are a
  founder/SQL task documented in the README.

### Neutral
- Migration `20260706000000_publishing_v1.sql`: publications, site_domains,
  enquiries, activity-kind check widened.
- The spine's dev singleton shape version bumped (new repositories).

## Alternatives Considered

- **Per-client static exports/deployments now** — cleaner isolation, but
  provisioning, deploy orchestration, and domain automation for every client
  before the first one pays. Rejected for v1; recorded as v2.
- **Enquiries as CRM pipeline leads** — one funnel would corrupt both: TITAN's
  prospects and a roofer's homeowners are different lifecycles. Rejected.
- **Editable live sites (serve latest blueprint)** — simplest, and exactly the
  silent-mutation failure the snapshot model exists to prevent. Rejected.

## References

- ADR-021/022 (registry + renderer being served), ADR-023 (spine + adapters),
  ADR-024 (the approval gate reused as the publishing gate).
- `src/core/business/{repository,workflows}.ts`, `src/middleware.ts`,
  `src/app/(sites)/`, `src/app/api/enquiries/`, `lib/rate-limit.ts`.
