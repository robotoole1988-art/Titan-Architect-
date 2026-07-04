-- Media Pipeline v1 (ADR-033): generated media records + review gate.
-- ALSO create a public Storage bucket named "media" in the dashboard
-- (Storage → New bucket → "media", public) — assets upload there.

create table if not exists media_assets (
  id uuid primary key,
  business_id uuid not null references businesses (id) on delete cascade,
  slot_ref text not null,
  brief text not null,
  modality text not null check (modality in ('image','video')),
  url text not null,
  lqip text,
  poster_url text,
  duration_seconds numeric,
  width integer,
  height integer,
  status text not null default 'review'
    check (status in ('review','approved','rejected')),
  provenance jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists media_assets_business_idx
  on media_assets (business_id, created_at desc);
create index if not exists media_assets_approved_idx
  on media_assets (business_id, slot_ref) where status = 'approved';
