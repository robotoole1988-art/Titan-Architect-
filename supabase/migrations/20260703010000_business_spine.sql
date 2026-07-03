-- Business Spine (ADR-023): the Business record + versioned pipeline artifacts.
-- Apply with the Supabase SQL editor or `supabase db push`.

create table if not exists businesses (
  id uuid primary key,
  name text not null,
  trade text not null,
  location text not null,
  contact jsonb,
  services text,
  target_customer text,
  goal text,
  budget text,
  urgency text,
  current_website_url text,
  -- Lifecycle: lead → qualified → proposed → won → building → review → live → account
  stage text not null default 'lead'
    check (stage in ('lead','qualified','proposed','won','building','review','live','account')),
  -- Append-only [{ "stage": "...", "enteredAt": "ISO-8601" }]
  stage_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists businesses_created_at_idx
  on businesses (created_at desc);

create table if not exists business_artifacts (
  id uuid primary key,
  business_id uuid not null references businesses (id) on delete cascade,
  kind text not null check (kind in ('strategy','blueprint')),
  -- 1-based, incremented per (business, kind); regeneration NEVER overwrites.
  version integer not null check (version >= 1),
  payload jsonb not null,
  meta jsonb,
  created_at timestamptz not null default now(),
  unique (business_id, kind, version)
);

create index if not exists business_artifacts_lookup_idx
  on business_artifacts (business_id, kind, version desc);

-- No RLS yet: the app talks to Postgres exclusively through the server-side
-- service-role key (ADR-023). Row-level security arrives with user accounts.
