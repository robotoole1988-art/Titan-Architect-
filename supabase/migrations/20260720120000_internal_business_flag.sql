-- Internal-business flag (ADR-049): archive/exclude test data, recoverably.
-- Apply with `npx supabase db push` (docs/MIGRATIONS.md).

-- 1. The flag. Default false — real businesses are untouched.
alter table businesses
  add column if not exists internal boolean not null default false;

-- 2. Backfill the known internal records by EXACT name (the 34 Morph Lab
--    environments created 2026-07-04 by the retired ADR-035/038 lab seam).
--    Nothing is deleted; the records stay visible in the CRM.
update businesses
  set internal = true
  where name = 'TITAN Morph Lab (internal)';
