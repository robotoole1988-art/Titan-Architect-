-- Ads Intelligence v1 (ADR-031): the campaign_plan artifact kind.
-- Apply with the Supabase SQL editor or `supabase db push`.

alter table business_artifacts drop constraint if exists business_artifacts_kind_check;
alter table business_artifacts add constraint business_artifacts_kind_check
  check (kind in ('strategy','blueprint','deal','campaign_plan'));
