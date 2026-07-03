-- Experience v2 (ADR-028): coverage areas drive per-area landing pages.
-- Apply with the Supabase SQL editor or `supabase db push`.

alter table businesses
  add column if not exists coverage_areas jsonb not null default '[]'::jsonb;
