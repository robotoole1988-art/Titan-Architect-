-- CRM v1.1 (ADR-026): trade taxonomy ids + deal artifacts.
-- Apply with the Supabase SQL editor or `supabase db push`.

-- 1. Canonical taxonomy id on the Business (null = unclassified/legacy).
alter table businesses add column if not exists trade_id text;

-- 2. Deals join the versioned artifact kinds.
alter table business_artifacts drop constraint if exists business_artifacts_kind_check;
alter table business_artifacts add constraint business_artifacts_kind_check
  check (kind in ('strategy','blueprint','deal'));

-- 3. One-time backfill: map existing free-text trades to taxonomy ids where
--    the match is CONFIDENT (mirrors core/trade-taxonomy matchers, conservative
--    subset). Unmatched rows stay null — flagged unclassified in the UI.
update businesses set trade_id = 'roofing'
  where trade_id is null and (trade ilike '%roof%' or trade ilike '%gutter%' or trade ilike '%fascia%' or trade ilike '%chimney%');
update businesses set trade_id = 'boiler-installation'
  where trade_id is null and trade ilike '%boiler%';
update businesses set trade_id = 'plumbing-heating-emergency'
  where trade_id is null and (trade ilike '%plumb%' or trade ilike '%heating%' or trade ilike '%drain%');
update businesses set trade_id = 'driveways-paving'
  where trade_id is null and (trade ilike '%drive%' or trade ilike '%paving%' or trade ilike '%patio%' or trade ilike '%resin%');
update businesses set trade_id = 'landscaping'
  where trade_id is null and (trade ilike '%landscap%' or trade ilike '%turf%' or trade ilike '%fencing%');
update businesses set trade_id = 'tree-surgery'
  where trade_id is null and trade ilike '%tree%';
update businesses set trade_id = 'solar-pv'
  where trade_id is null and trade ilike '%solar%';
update businesses set trade_id = 'battery-storage'
  where trade_id is null and trade ilike '%battery%';
update businesses set trade_id = 'ev-charger-installation'
  where trade_id is null and (trade ilike '%ev charg%' or trade ilike '%electric vehicle%');
update businesses set trade_id = 'scaffolding'
  where trade_id is null and trade ilike '%scaffold%';
update businesses set trade_id = 'carpet-cleaning'
  where trade_id is null and trade ilike '%carpet%';
update businesses set trade_id = 'exterior-cleaning'
  where trade_id is null and (trade ilike '%jet wash%' or trade ilike '%pressure wash%' or trade ilike '%exterior clean%');
update businesses set trade_id = 'garage-clearance'
  where trade_id is null and trade ilike '%garage clearance%';
update businesses set trade_id = 'house-clearance'
  where trade_id is null and trade ilike '%clearance%';
update businesses set trade_id = 'waste-removal'
  where trade_id is null and (trade ilike '%waste%' or trade ilike '%rubbish%');
update businesses set trade_id = 'mobile-mechanic'
  where trade_id is null and trade ilike '%mobile mechanic%';
update businesses set trade_id = 'garage-repairs'
  where trade_id is null and (trade ilike '%clutch%' or trade ilike '%cambelt%' or trade ilike '%wetbelt%');
update businesses set trade_id = 'painting-decorating'
  where trade_id is null and (trade ilike '%paint%' or trade ilike '%decorat%');
update businesses set trade_id = 'domestic-commercial-cleaning'
  where trade_id is null and (trade ilike '%cleaning%' or trade ilike '%cleaner%');
