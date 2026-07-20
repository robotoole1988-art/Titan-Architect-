# ADR-054 — Go-live infrastructure v1: production hosting + real founder auth

- **Status:** Accepted (deploy step pending founder's Vercel credentials)
- **Date:** 2026-07-20
- **Implements:** ADR-004's auth seam, for real; takes ADR-027's hostname
  serving to a production host
- **Builds on:** ADR-023 (spine + Supabase adapter), ADR-027 (publications,
  slug + hostname middleware), ADR-030 (enquiries/notifications/metrics),
  ADR-042/050/051/052 (the internal surfaces now behind the gate)

## Context

Everything ran on localhost. Auth was a placeholder login page; the
hostname middleware had never met a production host; Supabase free tier
auto-pauses and has taken the demos down before. This milestone makes TITAN
deployable and safe in front of a pilot client. Two guardrails governed the
work: **no spending decisions by the agent** (prices are presented; Robert
clicks), and **no secrets in chat, ever** (.env.local + dashboards only).

## Decision

### 1. Real authentication — founder-only Supabase Auth (magic link)

- **Magic link only. No password exists anywhere on the platform.** The
  founder user was created with `email_confirm` and no password; sign-in
  is a one-time emailed link.
- **The allowlist is enforced twice**: before any OTP is sent (a
  non-founder address gets an honest refusal, not an email) and again at
  the callback (a valid session for any other email is signed out on the
  spot). No allowlist configured → nobody passes.
- **The browser never runs supabase-js.** Sign-in is a server action, the
  session lives in httpOnly cookies (@supabase/ssr), and the anon key
  never ships in a client bundle.
- **Enforcement is layered**: `src/middleware.ts` gates every internal
  route (redirect → /login), and the `(app)` root layout re-checks the
  session server-side — ADR-004's promised enforcement point, delivered.
- **Public stays cookieless.** `/sites/*`, `/api/*` (enquiries, metrics,
  media, keepalive) and customer-domain requests never touch auth — the
  middleware's host branch returns before any session code runs, and no
  Set-Cookie is ever emitted on those paths (verified). The published
  sites' no-tracking-cookies claim stands: visitor browsers never receive
  any cookie; the founder's own session cookie is not tracking, and in
  production the app host is a different origin from customer domains.
- Pure rules (`isFounderEmail`, `isProtectedAppPath`) live in
  `core/auth` and are unit-tested, including deny-by-default and
  look-alike-path cases.

### 2. RLS audit — the blocking gate (passed 2026-07-20)

Empirical probe with the anon key via PostgREST, before and after:

| Table | Before (RLS off) | After (RLS on, zero policies) |
| --- | --- | --- |
| businesses | **readable** | no rows, insert 401 |
| business_artifacts (deals, blueprints…) | **readable** | no rows |
| business_activity | **readable** | no rows |
| builds / build_items | **readable** | no rows |
| publications / site_domains | **readable** | no rows |
| enquiries | exposed (RLS off) | no rows, insert 401 |
| site_metrics | **readable** | no rows |
| media_assets | exposed (RLS off) | no rows |
| observations (the Brain's memory) | **readable** | no rows |
| knowledge_records | exposed (RLS off) | no rows |
| business_reviews | **readable** | no rows |

Migration `20260720210000_rls_lockdown_v1.sql`: RLS enabled on every
table, **zero policies** — stricter than "only what public pages need",
because public pages read nothing client-side: every public read/write is
server-mediated through the service role (which bypasses RLS by design).
The exposure was latent (no client shipped the anon key), but Supabase
Auth would have shipped it; hence the gate. GBP for the future: any policy
additions arrive as reviewed migrations, never dashboard clicks.

### 3–6. Vercel deploy, domains, resilience, discipline

- **Deploy**: production from `main` only, previews per branch (Vercel Git
  integration); config in `vercel.json`; the runbook (docs/DEPLOYMENT.md)
  documents every env var and where Robert sets it. **Blocked, by design,
  on Robert's inputs**: a Vercel account (Hobby is free but licensed for
  non-commercial use — Pro at ~$20/mo is the move when the pilot client
  goes live) and a `VERCEL_TOKEN` in `.env.local`.
- **Domains**: hostname middleware already resolves custom domains
  (ADR-027); the runbook has the attach checklist (Vercel domain add, DNS
  A/CNAME, automatic SSL). Proven with `*.vercel.app` at deploy time; a
  real client domain executes when Robert supplies one.
- **Supabase resilience**: `/api/keepalive` (a trivial spine read, boolean
  response) + a daily Vercel cron keeps the free tier from idle-pausing.
  The durable fix is **Supabase Pro (~$25/mo: no pausing, daily backups,
  PITR add-on)** — a founder decision for when the pilot signs. Free-tier
  backup honesty: there are NO automatic backups; the runbook documents
  `supabase db dump` as the interim and the restore path.
- **Rollback**: Vercel instant rollback (promote a previous deployment),
  documented in the runbook.

## Consequences

- The internal OS is no longer reachable without Robert's email inbox;
  the public sites remain exactly as public and as cookieless as before.
- A latent full-database exposure via the anon key is closed before the
  key ever ships.
- Supabase's built-in auth mailer has tight rate limits (a few OTPs per
  hour) — fine for one founder; revisit only if auth ever widens
  (client accounts are a future milestone with its own ADR).
- The middleware now calls Supabase (`getUser`) per protected request —
  correct-first; optimise to local JWT verification if latency ever
  warrants.
- Incidental fix shipped with the gate: the OS shell's user menu was
  broken from birth (Base UI `GroupLabel` outside a `Group`) — it had
  never been click-tested. It now opens, shows the real session, and
  signs out.
