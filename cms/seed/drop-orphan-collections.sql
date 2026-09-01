-- ============================================================================
-- drop-orphan-collections.sql — remove two obsolete registered collections:
-- `pages_back` and `parent_url`. Nothing references them (no FK constraints, no
-- directus_relations), but they ARE registered collections, so removing them is
-- a real schema change (see the RE-SNAPSHOT step below).
--
--   pages_back  — a 61-row BACKUP of an older `pages` schema (rows dated 2021;
--                 columns like page_builder/sidebar_blocks). Confirm you no longer
--                 need this backup before running.
--   parent_url  — a 1-row scratch collection (single `url` column).
--
-- Run on BOTH local and upgrade (they exist on both). Since they're registered,
-- drop all layers: the table + directus_fields/collections (+ relations/presets/
-- permissions) — a plain DROP TABLE would strand the Directus metadata. One txn.
--
-- !!! BEFORE RUNNING: back up first, and confirm pages_back is disposable. !!!
--
-- AFTER RUNNING:
--   1. Restart Directus (drops them from the admin Data Model).
--   2. RE-SNAPSHOT: these appear in cms/snapshots/current.yaml as collections, so
--      re-run `directus schema snapshot` -> current.yaml and commit the removal.
--   3. Optional: both names also sit in a Flow's collection-watch list
--      (cms/configuration/flows.json) — a harmless stale entry; trim if you like.
-- ============================================================================

BEGIN;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['pages_back', 'parent_url'] LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', t);
    DELETE FROM directus_relations   WHERE many_collection = t OR one_collection = t;
    DELETE FROM directus_fields      WHERE collection = t;
    DELETE FROM directus_presets     WHERE collection = t;
    DELETE FROM directus_permissions WHERE collection = t;
    DELETE FROM directus_collections WHERE collection = t;
  END LOOP;
END $$;

COMMIT;

-- VERIFY (should each return 0 rows):
--   SELECT collection FROM directus_collections WHERE collection IN ('pages_back','parent_url');
--   SELECT tablename  FROM pg_tables           WHERE tablename  IN ('pages_back','parent_url');
-- ============================================================================
