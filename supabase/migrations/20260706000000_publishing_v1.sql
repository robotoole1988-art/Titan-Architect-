-- Publishing v1 (ADR-027): publications, custom-domain mapping, enquiries.
-- Apply with the Supabase SQL editor or `supabase db push`.

-- 1. Publications: immutable snapshots pinned to a blueprint version.
create table if not exists publications (
  id uuid primary key,
  business_id uuid not null references businesses (id) on delete cascade,
  slug text not null,
  -- 1-based publication number per business; regenerating a blueprint NEVER
  -- changes a live site — only an explicit, approval-gated republish does.
  version integer not null check (version >= 1),
  blueprint_version integer not null check (blueprint_version >= 1),
  status text not null default 'live'
    check (status in ('live','superseded','unpublished')),
  created_at timestamptz not null default now(),
  status_changed_at timestamptz not null default now(),
  unique (business_id, version)
);

create index if not exists publications_slug_live_idx
  on publications (slug) where status = 'live';
create index if not exists publications_business_idx
  on publications (business_id, version desc);

-- 2. Custom-domain → business mapping (host-header serving, table-driven).
create table if not exists site_domains (
  hostname text primary key,
  business_id uuid not null references businesses (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3. Enquiries from published sites — they belong to the customer's account.
create table if not exists enquiries (
  id uuid primary key,
  business_id uuid not null references businesses (id) on delete cascade,
  publication_id uuid not null,
  name text not null,
  contact text not null,
  message text not null,
  source_page text not null default '/',
  created_at timestamptz not null default now()
);

create index if not exists enquiries_business_idx
  on enquiries (business_id, created_at desc);

-- 4. Activity log learns the new event kinds.
alter table business_activity drop constraint if exists business_activity_kind_check;
alter table business_activity add constraint business_activity_kind_check
  check (kind in (
    'note','stage_change','artifact_generated','build_created',
    'build_item_update','publication','enquiry'
  ));
