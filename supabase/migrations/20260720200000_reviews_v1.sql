-- Verified reviews v1 (ADR-053): real customer reviews with a verification
-- attestation. HONESTY LAW: rendering and JSON-LD read only rows where the
-- who/how/when attestation trio is present. `source` is modelled so GBP API
-- ingestion can slot in later (source='google' + source_ref) — no GBP now.
-- Apply with `npx supabase db push` (never hand-apply — see docs/MIGRATIONS.md).

create table if not exists business_reviews (
  id uuid primary key,
  business_id uuid not null references businesses (id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  reviewed_at date not null,
  source text not null check (source in ('direct','google','other')),
  source_ref text,
  verified_by text,
  verification_method text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  -- The attestation is all-or-nothing: who, how, and when together.
  constraint business_reviews_attestation_complete check (
    (verified_by is null and verification_method is null and verified_at is null)
    or
    (verified_by is not null and verification_method is not null and verified_at is not null)
  )
);

create index if not exists business_reviews_business_idx
  on business_reviews (business_id, reviewed_at desc);
