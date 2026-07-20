-- Memory Spine v1 (ADR-046): the learning feed + the Knowledge Kernel store.
-- Apply with the Supabase SQL editor or `supabase db push`.
--
-- NOTE: the knowledge GRAPH itself has no table — it is DERIVED from the
-- existing spine tables on read (one source of truth, no sync problem).

-- 1. The learning feed: an APPEND-ONLY log of observations, decisions, and
--    outcomes. Application code exposes append + list only — no update, no
--    delete. This is the substrate future learning distils from.
create table if not exists observations (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  occurred_at timestamptz not null default now(),
  business_id uuid references businesses (id) on delete cascade,
  subject_kind text,
  subject_id text,
  summary text not null,
  payload jsonb,
  outcome jsonb,
  source text not null,
  created_at timestamptz not null default now()
);

create index if not exists observations_business_idx on observations (business_id);
create index if not exists observations_kind_idx on observations (kind);
create index if not exists observations_occurred_idx on observations (occurred_at desc);

-- 2. The Knowledge Kernel store (ADR-010, implemented by ADR-046): one row
--    per DNA record; domain fields ride in jsonb, system metadata in columns.
create table if not exists knowledge_records (
  id uuid primary key default gen_random_uuid(),
  kind text not null
    check (kind in ('trade','location','brand','customer','competitor','marketing')),
  label text not null,
  revision integer not null default 1,
  fields jsonb not null default '{}'::jsonb,
  provenance jsonb,
  confidence real,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_records_kind_idx on knowledge_records (kind);
