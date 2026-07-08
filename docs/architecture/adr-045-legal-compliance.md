# ADR-045: The legal & compliance layer — Privacy, Terms, and the cookieless truth

- **Status:** Accepted
- **Date:** 2026-07-08
- **Deciders:** Robert O'Toole
- **Tags:** publishing, renderer, primitives, legal, compliance, privacy, seo

## Context

Public trade sites collect personal data through the enquiry form (name, phone,
email), which under **UK GDPR** requires a **privacy notice** — a hard blocker
for any site going live. A Phase-0 audit of the renderer confirmed the gaps and,
importantly, the cookie truth:

- **No legal primitives** exist (no privacy / terms / legal / cookie primitive
  in the registry or the component map).
- A **footer exists** (`SiteFooter`) with the business NAP, real contact, and
  area nav — but in **public mode it carries no legal links**, only `© year`.
- **Cookies: verified zero.** The public `/sites/*` path sets **no** cookies
  (no `Set-Cookie` on the page, its JS assets, `/api/metrics`, or the media
  proxy; no `document.cookie` / `localStorage`), and the measurement beacon is
  explicitly cookieless — "no cookies, no identifiers", daily aggregates only
  (ADR-030). No auth cookies reach public serving (the Supabase read path uses
  the service-role client, not an SSR cookie client).

## Decision

Ship a **crafted, registry-keyed legal layer** rendered per published site,
populated from **real business data** with honest placeholders where data is
missing — never fabricated registration or business details.

### Two legal primitives (ADR-021 registry law)

- **`legal.privacy-policy`** — what the enquiry form collects (name, phone,
  email), why (to respond to the enquiry), the **lawful basis** (legitimate
  interests / consent for a contact request), **retention**, the **data-subject
  rights** (access, rectification, erasure, objection, complaint to the ICO),
  the **controller contact**, that **the site operates on the business's
  behalf** (TITAN as processor), and the **cookie statement** — first-party
  measurement, **no cookies, no third-party trackers**.
- **`legal.legal-notice`** — business identity, service terms, a liability
  limitation, **governing law: England & Wales**, and contact.

Both carry a plain **"standard baseline, not legal advice"** disclaimer. The
crafted component holds the standard UK legal *scaffolding* (section headings,
the rights enumeration, the disclaimer); the business specifics ride in from
content slots. No free-generated legal prose beyond the templated primitive.

### Legal pages, not a new route family

Each is a **page in the blueprint collection** (`type: "legal"`,
`suggestedUrl: "/privacy"` / `"/terms"`), composed of its primitive. They serve
through the **existing `[area]` route** (which resolves a page by
`suggestedUrl`), land in the **sitemap** (which already iterates every page),
and are **indexable** by default. They are added to `pages.pages` but **not to
`navigation.items`** (legal belongs in the footer, not the header nav), and are
**excluded from the anti-doorway check** (that guards *area* pages only,
ADR-028). Generated for **every** site — legal is universal, not archetype-scoped.

### Cookies: done right, not by reflex

Because the site genuinely sets **no non-essential cookies**, **no consent
banner or cookie wall is required**. Instead: a short **"No tracking cookies"**
line in the footer (every page) and a cookie section in the privacy notice. This
is both correct and a premium-UX win — no intrusive banner the site doesn't need.

### Footer

`SiteFooter` gains, in public mode, a bottom bar with **Privacy** and **Terms**
links (a `legalNav` resolved through the same `pageHref` seam as the area nav,
so it works for slug and hostname serving), the **no-cookie** statement, and the
copyright — alongside the NAP already present. Themed by CSS variables, so it is
correct across all five looks (storm, Golden Hour, care, technical, default).

### Contact reaches the primitive

The privacy notice must name a controller contact. `contact` (the real Business
contact, already resolved at serve time for the chrome) is plumbed into
`PrimitiveSectionProps` so the legal primitives can show a real email/phone —
or an honest "[contact to be confirmed]" placeholder when absent.

## Consequences

**Positive** — sites become genuinely go-live-legal; the cookieless architecture
pays off as a cleaner UX than competitors' banners; legal is crafted + registered
like everything else and republishes with the site.

**Negative / watch-list** — the templated notices are a sensible UK baseline, not
bespoke legal advice (stated plainly on every page); a business with unusual
processing would need a solicitor's review. Existing published demos must be
**republished** to gain the pages (blueprints are immutable snapshots, ADR-027).

## Out of scope

No free-generated legal text beyond the crafted templated primitives; no
fabricated registration/company numbers or business details; no cookie banner
(none is required); no per-jurisdiction variants beyond England & Wales.

## Verification (measured)

All four live demos were republished (regenerated blueprint → new immutable
snapshot) and verified on a production server:

- **Routes.** `/privacy` and `/terms` return `200` on all four sites
  (summit-roofing-rescue, kerbside-kings, bright-smile-dental,
  voltway-renewables). Each resolves to the crafted primitive
  (`data-primitive="legal.privacy-policy"` / `legal.legal-notice`), never the
  placeholder.
- **Content.** The "baseline, not legal advice" disclaimer, the honest
  "no tracking cookies" statement, the UK-GDPR rights list, and
  "law of England & Wales" all render. Real controller contact where the
  business has one; the honest `[contact details to be confirmed]` placeholder
  where it doesn't (Summit) — never fabricated.
- **Footer-reachable.** Privacy + Terms links and the no-cookie statement appear
  in the footer of every page — home, area pages, and the legal pages
  themselves — never in the header nav.
- **SEO.** Both legal URLs are in each site's `sitemap.xml`; pages carry
  `robots: index, follow`. Anti-doorway is unaffected (legal pages are excluded
  from the differentiation policy, enforced by tests).
- **Theming.** The pages inherit each site's theme (verified storm/emergency and
  the titan-care light theme) — on-brand across archetypes.
- **Lighthouse (production, `/privacy`).** Desktop **100 / 95 / 100 / 100**
  (perf/a11y/best/SEO), LCP 0.7 s, CLS 0. Mobile **perf 89–90** (three runs:
  89, 89, 90), a11y 95, best 100, SEO 100, CLS 0. The text-only legal page sits
  at the same CPU-render-bound mobile ceiling documented in the ADR-036
  addendum — the bottleneck is the shared renderer runtime/hydration, not page
  content — and does not regress below the media-heavy hero pages.
- **Gates.** Lint, type-check, 376 tests, and production build all green.
