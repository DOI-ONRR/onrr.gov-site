-- ============================================================================
-- drop-orphan-collections.sql — remove two PK-less orphan collections that
-- Directus registered but the schema snapshot ignores: `pages_back` and
-- `parent_url`. Nothing references them (no FK constraints, no directus_relations).
--
--   pages_back  — a 61-row BACKUP copy of an older `pages` schema. Confirm you no
--                 longer need this backup before running.
--   parent_url  — a 1-row scratch collection (single `url` column).
--
-- Run on BOTH local and upgrade (they exist on both). Since these are registered
-- collections, drop all three layers: the table + directus_fields + directus_collections
-- (a plain DROP TABLE would strand the Directus metadata). One transaction.
--
-- !!! BEFORE RUNNING: back up first, and confirm pages_back is disposable. !!!
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
--
-- Restart Directus afterward so the admin drops them from Data Model.
-- ============================================================================
