-- ============================================================================
-- Migration: Enable pgvector extension
-- Date:      2026-07-04
-- Patch:     PR #2 (Milestone A' — Foundations)
--
-- WHY: pgvector adds vector similarity search to PostgreSQL. This unlocks
--      Retrieval-Augmented Generation (RAG) for the Knowledge Base module
--      (Milestone D) and Agent Memory (Milestone C+). Enabling the extension
--      now — long before we build KB or Memory — means those future
--      milestones don't have to schedule a separate Supabase step.
--
-- WHAT:
--      CREATE EXTENSION IF NOT EXISTS vector;
--
--      That's it. One statement. No tables. No functions. No policies.
--      No data changes.
--
-- SAFETY:
--   1. IDEMPOTENT — `IF NOT EXISTS` guard. Running this twice is a no-op.
--   2. ATOMIC — one statement in one transaction.
--   3. NON-BREAKING — does not touch existing tables, columns, rows,
--      indexes, functions, triggers, or policies. Zero effect on any query.
--   4. NON-BLOCKING — extension creation is fast (< 1 second) and does not
--      lock any user tables. No downtime.
--   5. VERIFIABLE — the assertion block at the end confirms the extension
--      is installed. If it fails, the transaction rolls back.
--
-- ROLLBACK:
--      DROP EXTENSION IF EXISTS vector;
--
--      Rolling back is safe today because no schema depends on the extension.
--      Once tables use `vector` columns (Milestone C+), rollback becomes
--      breaking and requires dropping those columns first.
-- ============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Enable pgvector
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS vector;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Verification — asserts that pg_extension now includes 'vector'.
--    If the assertion fails, the whole transaction rolls back.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  ext_installed BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) INTO ext_installed;

  IF NOT ext_installed THEN
    RAISE EXCEPTION
      'Migration verification failed: pgvector extension is not installed';
  END IF;

  RAISE NOTICE 'Migration verification: PASSED. pgvector extension is active.';
END $$;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Post-migration check — run this manually after COMMIT to confirm.
--    Not part of the transaction.
-- ─────────────────────────────────────────────────────────────────────────────

-- SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
--
-- Expected output: one row, extname = 'vector', extversion = something like
-- '0.7.0' or newer (depends on Supabase's current version).
