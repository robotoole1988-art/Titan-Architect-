# Deploying TITAN (ADR-054)

Production runs on Vercel; data and auth run on the existing Supabase
project (`lichjseiaegyjyeitbxj`). Deploys go **from `main` only**; every
branch gets a preview URL automatically once the Git integration is on.

## One-time setup (Robert)

1. **Vercel account** — the free **Hobby** tier deploys fine, but its
   licence is **non-commercial**: when the pilot client goes live, move to
   **Pro (~$20/month)**. Nothing here buys anything — both moves are your
   click.
2. **Token for CLI deploys** — Vercel dashboard → Settings → Tokens →
   create; put it in `.env.local` as `VERCEL_TOKEN=…`. Never in chat,
   never committed (`.env.local` is git-ignored).
3. **Link the repo** — `npx vercel link` (uses the token), then in the
   Vercel project settings connect the GitHub repo `Titan-Architect-`:
   production branch `main`, previews for all other branches.

## Environment variables

Set in **Vercel → Project → Settings → Environment Variables** (values
come from `.env.local` / the Supabase dashboard — copy them there, not
through chat):

| Variable | What it is | Scope |
| --- | --- | --- |
| `SUPABASE_URL` | The project's API URL | Production + Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side data access (bypasses RLS) — **server-only, never expose** | Production + Preview |
| `SUPABASE_ANON_KEY` | Auth flows only (server-side; RLS denies it all data) | Production + Preview |
| `TITAN_FOUNDER_EMAIL` | The auth allowlist (exactly one address) | Production + Preview |
| `TITAN_APP_HOST` | The app's own hostname (e.g. `titan-architect.vercel.app`) — anything else is treated as a customer domain | Production |
| `TITAN_APP_ORIGIN` | `https://` + the app host — used in emails/links | Production |
| `RESEND_API_KEY`, `RESEND_FROM` | Enquiry notification email (ADR-030) | Production |
| `ANTHROPIC_API_KEY` | Brain narration (ADR-048) — optional; deterministic fallback without it | Production |
| `REPLICATE_API_TOKEN`, `FAL_KEY` | Media generation (ADR-033/039) — optional | Production |

Not needed on Vercel: `SUPABASE_ACCESS_TOKEN` (CLI migrations run from
this machine), `VERCEL_TOKEN` (lives only in `.env.local`).

**After the first deploy**, update Supabase auth config to the production
URL (Dashboard → Auth → URL Configuration, or the management API): site
URL `https://<app-host>`, and add
`https://<app-host>/auth/callback` to the redirect allowlist (the
`https://*.vercel.app/auth/callback` wildcard already covers previews).

## Deploying

- **Production**: merge to `main` → Vercel builds and promotes
  automatically. CI (lint/typecheck/test/build) must already be green —
  branch protection enforces the same checks Vercel will run.
- **Preview**: push any branch → Vercel comments a preview URL.
- **CLI (from this machine)**: `npx vercel deploy --prebuilt --prod`
  (reads `VERCEL_TOKEN` from the environment).
- **Status**: Vercel dashboard → Deployments (build logs, serving state).

## Rollback (instant)

Vercel dashboard → Deployments → pick the last good production deployment
→ **⋯ → Promote to Production**. Serving switches in seconds; no rebuild.
(CLI: `npx vercel rollback`.)

## Custom domains (per client site)

The hostname middleware (ADR-027) already resolves any custom domain to
the client's published site — attaching one is pure infrastructure:

1. Vercel → Project → Settings → Domains → Add → `www.clientdomain.co.uk`
   (and the apex if wanted).
2. At the registrar, set the DNS Vercel shows: apex `A → 76.76.21.21`,
   `www` `CNAME → cname.vercel-dns.com`.
3. SSL: automatic (Let's Encrypt) once DNS propagates — nothing to do.
4. In TITAN, map the hostname to the business (site_domains — the
   `addDomain` seam), publish if not already live.
5. Verify: `https://www.clientdomain.co.uk` serves the site;
   `/{area}` pages, enquiry form, and JSON-LD all present; no cookies set.

The `*.vercel.app` URL is proven at deploy time; run this checklist for
real when the pilot's domain arrives.

## Supabase resilience

- **Keep-alive (running)**: `vercel.json` cron hits `/api/keepalive`
  daily at 06:00 UTC — one trivial read, keeps the free tier from its
  ~7-day idle pause. (Hobby allows daily crons; that cadence is plenty.)
- **The honest limits of free**: NO automatic backups, and pausing can
  still happen around platform maintenance. **Supabase Pro (~$25/month)**
  removes pausing and adds daily backups (7-day retention; PITR is an
  add-on) — recommended the day the pilot signs. Your click, not mine.
- **Interim backup**: from this machine,
  `npx supabase db dump -f backup-$(date +%F).sql` (schema + data,
  uses the linked project). Store outside the repo.
- **Restore**: create/clean a project, `psql $DATABASE_URL < backup.sql`
  (or Supabase Dashboard → SQL editor for small dumps), re-run
  `npx supabase db push` to confirm migration bookkeeping, re-point
  `SUPABASE_URL`/keys if the project changed.

## Secrets discipline

`.env.local` (git-ignored) and the Vercel/Supabase dashboards are the
ONLY places secrets live. Nothing in the repo, nothing in chat, ever. If
a key leaks: rotate in the issuing dashboard, update `.env.local` +
Vercel, redeploy.
