-- ============================================================================
-- Migration: Add tier_slug + feature flags to `plans`
-- Date:      2026-07-01
-- Patch:     13a (Billing Foundation)
--
-- WHY: Today the app derives "what tier am I on?" from price ranges in
--      lib/auth/session.ts. That's brittle — adding a new plan at the wrong
--      price would silently shift users into the wrong tier. After this
--      migration, every tier decision flows through `plans.tier_slug` and
--      the feature flag columns. Code can be simplified accordingly.
--
-- SAFETY:
--   1. IDEMPOTENT — running this twice is a no-op. All ALTER TABLE statements
--      use `IF NOT EXISTS`. All UPDATEs use guards in WHERE clauses.
--   2. ATOMIC      — runs inside a single transaction. Any failure rolls back
--      the entire migration.
--   3. PRESERVES   — existing subscriptions are NEVER touched. Users stay on
--      their current plan; only the metadata on those plans is enriched.
--   4. VERIFIABLE  — the bottom of the file asserts the post-state. If the
--      assertions fail, the whole transaction rolls back.
--
-- ROLLBACK: see `2026_07_01_plans_tier_slug_rollback.sql` in the same folder.
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add new columns to `plans` (all idempotent via IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE plans ADD COLUMN IF NOT EXISTS tier_slug              TEXT;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_trial               BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS price_yearly           NUMERIC;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS has_academy_access     BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS has_lab_download       BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS has_personal_sandbox   BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS has_chatbot_service    BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS has_team_inbox         BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS has_advanced_automation BOOLEAN    NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS has_detailed_analytics BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS has_analytics_export   BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS has_api_access         BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS has_custom_branding    BOOLEAN     NOT NULL DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS api_rate_limit_per_min INTEGER     NOT NULL DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_webhooks           INTEGER;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_auto_replies       INTEGER;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_team_members       INTEGER     NOT NULL DEFAULT 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Backfill `tier_slug` on the 6 existing plans
--    Guard: only updates rows where tier_slug IS NULL (so re-running is safe).
-- ─────────────────────────────────────────────────────────────────────────────

-- تجريبي (Trial) — $0, max_messages_mo=500 — distinguishes it from "مخصص"
UPDATE plans
SET    tier_slug = 'free',
       is_trial = true
WHERE  tier_slug IS NULL
   AND name = 'تجريبي';

-- مخصص (Custom) — $0, special by name
UPDATE plans
SET    tier_slug = 'custom',
       is_trial = false
WHERE  tier_slug IS NULL
   AND name = 'مخصص';

-- 3 أرقام — $20 — closest to Starter
UPDATE plans
SET    tier_slug = 'starter',
       is_trial = false
WHERE  tier_slug IS NULL
   AND name = '3 أرقام';

-- 8 أرقام — $50 — Pro range
UPDATE plans
SET    tier_slug = 'pro',
       is_trial = false
WHERE  tier_slug IS NULL
   AND name = '8 أرقام';

-- 13 رقم — $100 — still Pro (Business starts at 15+ numbers per PRICING.md)
UPDATE plans
SET    tier_slug = 'pro',
       is_trial = false
WHERE  tier_slug IS NULL
   AND name = '13 رقم';

-- 25 رقم — $200 — Business
UPDATE plans
SET    tier_slug = 'business',
       is_trial = false
WHERE  tier_slug IS NULL
   AND name = '25 رقم';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Backfill the feature flag columns by tier_slug
--    Source of truth: config/tiers.ts (PRICING.md FROZEN v1.0).
--    Idempotent — sets values regardless of previous state.
-- ─────────────────────────────────────────────────────────────────────────────

-- Free tier (also covers any plan with tier_slug='free')
UPDATE plans
SET    has_academy_access     = false,
       has_lab_download       = false,
       has_personal_sandbox   = false,
       has_chatbot_service    = false,
       has_team_inbox         = false,
       has_advanced_automation = false,
       has_detailed_analytics = false,
       has_analytics_export   = false,
       has_api_access         = false,
       has_custom_branding    = false,
       api_rate_limit_per_min = 0,
       max_team_members       = 1
WHERE  tier_slug = 'free';

-- Starter tier
UPDATE plans
SET    has_academy_access     = true,
       has_lab_download       = true,
       has_personal_sandbox   = false,
       has_chatbot_service    = false,
       has_team_inbox         = false,
       has_advanced_automation = false,
       has_detailed_analytics = false,
       has_analytics_export   = false,
       has_api_access         = true,
       has_custom_branding    = false,
       api_rate_limit_per_min = 100,
       max_team_members       = 1
WHERE  tier_slug = 'starter';

-- Pro tier
UPDATE plans
SET    has_academy_access     = true,
       has_lab_download       = true,
       has_personal_sandbox   = true,
       has_chatbot_service    = true,
       has_team_inbox         = false,
       has_advanced_automation = true,
       has_detailed_analytics = true,
       has_analytics_export   = false,
       has_api_access         = true,
       has_custom_branding    = false,
       api_rate_limit_per_min = 500,
       max_team_members       = 1
WHERE  tier_slug = 'pro';

-- Business tier
UPDATE plans
SET    has_academy_access     = true,
       has_lab_download       = true,
       has_personal_sandbox   = true,
       has_chatbot_service    = true,
       has_team_inbox         = true,
       has_advanced_automation = true,
       has_detailed_analytics = true,
       has_analytics_export   = true,
       has_api_access         = true,
       has_custom_branding    = true,
       api_rate_limit_per_min = 2000,
       max_team_members       = 5
WHERE  tier_slug = 'business';

-- Custom tier — everything Business gets, plus any human-arranged extras.
-- We default to Business-level flags so a custom-plan user is never
-- accidentally locked out of a feature.
UPDATE plans
SET    has_academy_access     = true,
       has_lab_download       = true,
       has_personal_sandbox   = true,
       has_chatbot_service    = true,
       has_team_inbox         = true,
       has_advanced_automation = true,
       has_detailed_analytics = true,
       has_analytics_export   = true,
       has_api_access         = true,
       has_custom_branding    = true,
       api_rate_limit_per_min = 2000,
       max_team_members       = 5
WHERE  tier_slug = 'custom';

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Enforce tier_slug NOT NULL + CHECK now that every row has one
-- ─────────────────────────────────────────────────────────────────────────────

-- Only add the constraint if it does not already exist (idempotency).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE  table_schema = 'public' AND table_name = 'plans'
       AND constraint_name = 'plans_tier_slug_check'
  ) THEN
    ALTER TABLE plans
      ADD CONSTRAINT plans_tier_slug_check
      CHECK (tier_slug IN ('free', 'starter', 'pro', 'business', 'custom'));
  END IF;
END $$;

-- NOT NULL is idempotent on its own — Postgres just verifies and keeps it.
ALTER TABLE plans ALTER COLUMN tier_slug SET NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Verification — these queries are part of the transaction. If any of
--    them raise via the RAISE EXCEPTION, the entire migration rolls back.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  null_count    INTEGER;
  bad_count     INTEGER;
  orphan_count  INTEGER;
BEGIN
  -- 5a. No plans should have a NULL tier_slug
  SELECT COUNT(*) INTO null_count FROM plans WHERE tier_slug IS NULL;
  IF null_count > 0 THEN
    RAISE EXCEPTION
      'Migration verification failed: % plan(s) still have NULL tier_slug',
      null_count;
  END IF;

  -- 5b. Every tier_slug must be in the allowed set
  SELECT COUNT(*) INTO bad_count
  FROM   plans
  WHERE  tier_slug NOT IN ('free', 'starter', 'pro', 'business', 'custom');
  IF bad_count > 0 THEN
    RAISE EXCEPTION
      'Migration verification failed: % plan(s) have invalid tier_slug',
      bad_count;
  END IF;

  -- 5c. Every subscription must reference a plan whose tier_slug is set
  SELECT COUNT(*) INTO orphan_count
  FROM   subscriptions s
  LEFT JOIN plans p ON p.id = s.plan_id
  WHERE  p.id IS NULL OR p.tier_slug IS NULL;
  IF orphan_count > 0 THEN
    RAISE EXCEPTION
      'Migration verification failed: % subscription(s) link to a plan with no tier_slug',
      orphan_count;
  END IF;

  RAISE NOTICE 'Migration verification: PASSED. plans=%, subs all linked.',
    (SELECT COUNT(*) FROM plans);
END $$;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Post-migration summary queries — run these manually after COMMIT to
--    see the final state. They are OUTSIDE the transaction so you can run
--    them ad hoc.
-- ─────────────────────────────────────────────────────────────────────────────

-- (a) Count plans per tier
-- SELECT tier_slug, COUNT(*) FROM plans GROUP BY tier_slug ORDER BY tier_slug;

-- (b) Sanity check: every subscription's tier
-- SELECT s.user_id, p.name, p.tier_slug, p.price_monthly
-- FROM   subscriptions s
-- JOIN   plans p ON p.id = s.plan_id;

-- (c) Feature flags by tier
-- SELECT tier_slug,
--        bool_or(has_academy_access)   AS academy,
--        bool_or(has_lab_download)     AS lab_dl,
--        bool_or(has_chatbot_service)  AS chatbot,
--        bool_or(has_api_access)       AS api,
--        max(api_rate_limit_per_min)   AS rate_limit
-- FROM   plans
-- GROUP BY tier_slug
-- ORDER BY tier_slug;
