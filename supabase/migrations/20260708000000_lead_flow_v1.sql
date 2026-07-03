-- Lead Flow v1 (ADR-030): notifications, speed-to-lead lifecycle, metrics.
-- Apply with the Supabase SQL editor or `supabase db push`.

-- 1. Notification recipients + optional GA4 hook on the business.
alter table businesses
  add column if not exists owner_email text,
  add column if not exists ga4_measurement_id text;

-- 2. The speed-to-lead lifecycle on enquiries.
alter table enquiries
  add column if not exists status text not null default 'new'
    check (status in ('new','seen','contacted','qualified','disqualified')),
  add column if not exists seen_at timestamptz,
  add column if not exists contacted_at timestamptz,
  add column if not exists outcome_at timestamptz;

create index if not exists enquiries_status_idx on enquiries (status);

-- 3. First-party measurement: DAILY AGGREGATES only (no per-visitor rows).
create table if not exists site_metrics (
  business_id uuid not null references businesses (id) on delete cascade,
  path text not null,
  date date not null,
  views integer not null default 0,
  form_starts integer not null default 0,
  form_submits integer not null default 0,
  primary key (business_id, path, date)
);
