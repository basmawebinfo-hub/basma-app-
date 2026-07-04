# Supabase migrations

A holding folder for SQL files that change the production schema.

Until we wire up the Supabase CLI to apply them automatically, you run each
file manually from the SQL Editor in the Supabase Dashboard:

1. Open https://supabase.com/dashboard/project/pclmudzbvybvqeczjxzv/sql/new
2. Paste the entire file contents
3. Click "Run"
4. Check the Notices panel for the verification messages
5. After it succeeds, move the file to a `_applied/` subfolder (manual) so it
   is clear what is still pending

## Files

| File | Status | Date | Purpose |
|------|--------|------|---------|
| `add_webhook_instance_id.sql` | applied | 2026-06 | Add instance_id to webhook_configs |
| `2026_07_01_plans_tier_slug.sql` | applied | 2026-07-01 | Patch 13a — adds tier_slug + feature flags to plans |
| `2026_07_01_plans_tier_slug_rollback.sql` | n/a | 2026-07-01 | Companion rollback for Patch 13a |
| `2026_07_04_enable_pgvector.sql` | PENDING | 2026-07-04 | PR #2 — enables pgvector extension (no schema change) |

## Running Patch 13a — Step by step

1. Open Supabase SQL Editor (link above).
2. (Recommended) Take a snapshot of the `plans` table first:
   ```sql
   SELECT * FROM plans;
   ```
   Copy the result for safekeeping.
3. Paste the entire contents of `2026_07_01_plans_tier_slug.sql`.
4. Click "Run". You should see:
   ```
   NOTICE: Migration verification: PASSED. plans=6, subs all linked.
   ```
5. Sanity-check with the queries at the bottom of the migration file.
6. If something looks wrong, run the rollback file immediately.


## Running PR #2 — Enable pgvector — Step by step

1. Open Supabase SQL Editor:
   https://supabase.com/dashboard/project/pclmudzbvybvqeczjxzv/sql/new
2. Paste the entire contents of `2026_07_04_enable_pgvector.sql`.
3. Click "Run". You should see:
   ```
   NOTICE: Migration verification: PASSED. pgvector extension is active.
   ```
4. Verify with the manual check at the bottom of the migration file:
   ```sql
   SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
   ```
   Expected: one row with `extname = 'vector'`.
5. Update this README: change the status of `2026_07_04_enable_pgvector.sql`
   from `PENDING` to `applied`.

### What this migration does NOT change

- No existing table, column, row, index, function, trigger, or policy
- No application behavior — the app doesn't call the extension yet
- No downtime — extension creation is < 1 second and non-blocking

### Why now (before Knowledge Base or Memory ship)

Enabling the extension is Milestone A'-1 groundwork. The KB module and Agent
Memory tiers will use `vector`-typed columns when they ship (Milestones C/D).
By enabling pgvector now, those milestones don't need to schedule a
separate Supabase step.
