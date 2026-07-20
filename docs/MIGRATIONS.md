# Applying database migrations

Every schema change is a SQL file in [`supabase/migrations/`](../supabase/migrations/),
named `YYYYMMDDHHMMSS_short_name.sql`, written idempotently (`create table if
not exists`, `add column if not exists`) and shipped in the same PR as the code
that needs it.

**Applying is ONE command — never the SQL editor:**

```sh
npx supabase db push
```

The CLI reads `SUPABASE_ACCESS_TOKEN` from the environment (it lives in
`.env.local`, which is git-ignored — export it first, e.g.
`export SUPABASE_ACCESS_TOKEN="$(grep '^SUPABASE_ACCESS_TOKEN=' .env.local | cut -d= -f2-)"`),
connects via a token-derived login role (no database password needed), and
applies exactly the migrations the remote hasn't recorded yet.

## One-time setup (already done on this machine)

```sh
npx supabase link --project-ref lichjseiaegyjyeitbxj
```

The linked ref is stored in `supabase/.temp/` (git-ignored). It MUST be
`lichjseiaegyjyeitbxj` — the project `.env.local`'s `SUPABASE_URL` points at.
Verify with `cat supabase/.temp/project-ref` before pushing from a new machine.

## Useful commands

```sh
npx supabase migration list   # local vs remote applied state
npx supabase db push --dry-run
```

## History note (why some early bookkeeping was repaired)

Migrations up to `20260709` were originally applied by hand in the SQL editor;
`20260710_media_v1` gained its bookkeeping row when `db push` re-ran it as an
idempotent no-op alongside `20260711_memory_spine_v1` (ADR-046) — the first
push through this workflow. From here on, hand-applying SQL is an error: it
leaves the remote bookkeeping stale and later pushes re-run whatever it missed.

## Gotchas

- **Paused project**: free-tier Supabase auto-pauses after ~a week idle; every
  command fails with `LegacyProjectPausedError` until an admin restores it from
  the dashboard. The published demo sites are down while paused, too.
- **Token**: `SUPABASE_ACCESS_TOKEN` is a personal access token
  (supabase.com → Account → Access Tokens). It is a secret: `.env.local` only,
  never in chat, never committed, rotate if exposed.
