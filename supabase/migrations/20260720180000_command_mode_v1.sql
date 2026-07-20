-- Command Mode v1 (ADR-052): the email_draft artifact kind.
-- Apply with `npx supabase db push` (never hand-apply — see docs/MIGRATIONS.md).
--
-- The approval queue itself needs NO schema: it is event-sourced over the
-- observations table (ADR-046), whose `kind` is open text by design.

alter table business_artifacts drop constraint if exists business_artifacts_kind_check;
alter table business_artifacts add constraint business_artifacts_kind_check
  check (kind in ('strategy','blueprint','deal','campaign_plan','email_draft'));
