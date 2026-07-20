-- RLS lockdown v1 (ADR-054): deny-by-default on EVERY table before the app
-- goes public. Audit finding (2026-07-20): RLS was disabled everywhere, so
-- the anon key could read every table via PostgREST — latent (no client
-- ships that key today) but Supabase Auth will ship it, so this gate blocks
-- production exposure.
--
-- Posture: RLS ON, ZERO policies. The anon and authenticated roles reach
-- NOTHING via PostgREST — stricter than "only what public pages need",
-- because public pages read nothing client-side: every public read/write
-- (published sites, enquiry submit, metrics beacon, media streaming) is
-- server-mediated through the service role, which bypasses RLS by design.
-- Supabase Auth itself lives in the `auth` schema and is unaffected.
--
-- Apply with `npx supabase db push` (never hand-apply — see docs/MIGRATIONS.md).

alter table businesses          enable row level security;
alter table business_artifacts  enable row level security;
alter table business_activity   enable row level security;
alter table builds              enable row level security;
alter table build_items         enable row level security;
alter table publications        enable row level security;
alter table site_domains        enable row level security;
alter table enquiries           enable row level security;
alter table site_metrics        enable row level security;
alter table media_assets        enable row level security;
alter table observations        enable row level security;
alter table knowledge_records   enable row level security;
alter table business_reviews    enable row level security;
