-- ============================================================================
-- ROLLBACK: Revert `plans.tier_slug` + feature flag columns
-- Companion to: 2026_07_01_plans_tier_slug.sql
--
-- When to run: ONLY if Patch 13a misbehaves in production. After rolling back,
-- the codebase will go back to deriving tier from price ranges (the legacy
-- behavior in lib/auth/session.ts).
--
-- This drops the NEW columns. Existing subscriptions are NOT touched —
-- users stay on the same plan_id; we only lose the metadata enrichment.
--
-- SAFETY: idempotent — running this twice is a no-op (DROP COLUMN IF EXISTS).
-- ============================================================================

BEGIN;

-- 1. Drop the CHECK constraint first (must come before dropping the column)
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_tier_slug_check;

-- 2. Drop columns added by the forward migration
ALTER TABLE plans DROP COLUMN IF EXISTS tier_slug;
ALTER TABLE plans DROP COLUMN IF EXISTS is_trial;
ALTER TABLE plans DROP COLUMN IF EXISTS price_yearly;
ALTER TABLE plans DROP COLUMN IF EXISTS has_academy_access;
ALTER TABLE plans DROP COLUMN IF EXISTS has_lab_download;
ALTER TABLE plans DROP COLUMN IF EXISTS has_personal_sandbox;
ALTER TABLE plans DROP COLUMN IF EXISTS has_chatbot_service;
ALTER TABLE plans DROP COLUMN IF EXISTS has_team_inbox;
ALTER TABLE plans DROP COLUMN IF EXISTS has_advanced_automation;
ALTER TABLE plans DROP COLUMN IF EXISTS has_detailed_analytics;
ALTER TABLE plans DROP COLUMN IF EXISTS has_analytics_export;
ALTER TABLE plans DROP COLUMN IF EXISTS has_api_access;
ALTER TABLE plans DROP COLUMN IF EXISTS has_custom_branding;
ALTER TABLE plans DROP COLUMN IF EXISTS api_rate_limit_per_min;
ALTER TABLE plans DROP COLUMN IF EXISTS max_webhooks;
ALTER TABLE plans DROP COLUMN IF EXISTS max_auto_replies;
ALTER TABLE plans DROP COLUMN IF EXISTS max_team_members;

-- 3. Verify rollback succeeded
DO $$
DECLARE
  col_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM   information_schema.columns
  WHERE  table_schema = 'public'
     AND table_name = 'plans'
     AND column_name = 'tier_slug';

  IF col_count > 0 THEN
    RAISE EXCEPTION 'Rollback verification failed: tier_slug column still exists';
  END IF;

  RAISE NOTICE 'Rollback verification: PASSED. plans columns restored to pre-13a state.';
END $$;

COMMIT;
