-- CRM v1 (ADR-024): lost lifecycle states, the activity log, and Builds.
-- Apply with the Supabase SQL editor or `supabase db push`.

-- 1. Lifecycle gains the two lost states (terminal but reopenable).
alter table businesses drop constraint if exists businesses_stage_check;
alter table businesses add constraint businesses_stage_check
  check (stage in (
    'lead','qualified','proposed','won','building','review','live','account',
    'not_interested','not_going_ahead'
  ));

-- 2. Timestamped activity log per business (notes + automatic entries).
create table if not exists business_activity (
  id uuid primary key,
  business_id uuid not null references businesses (id) on delete cascade,
  kind text not null check (kind in (
    'note','stage_change','artifact_generated','build_created','build_item_update'
  )),
  message text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists business_activity_lookup_idx
  on business_activity (business_id, created_at desc);

-- 3. Builds: the production run created exactly once when a business is won.
create table if not exists builds (
  id uuid primary key,
  business_id uuid not null unique references businesses (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists build_items (
  id uuid primary key,
  build_id uuid not null references builds (id) on delete cascade,
  kind text not null check (kind in (
    'website','google_ads','lsa','seo','gbp','meta_ads','ai_search'
  )),
  status text not null default 'queued' check (status in (
    'queued','building','ai_check','review','approved','live'
  )),
  -- True while the founder runs the item by hand (no automation department yet).
  manual boolean not null default true,
  -- Latest reviewer note (e.g. why an item was sent back).
  note text,
  updated_at timestamptz not null default now(),
  unique (build_id, kind)
);

create index if not exists build_items_status_idx
  on build_items (status);

-- The review gate (live only from approved, approved only from review) is
-- enforced in the application core (assertBuildItemTransition, ADR-024).
