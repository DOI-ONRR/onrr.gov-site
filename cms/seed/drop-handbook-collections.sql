-- ============================================================================
-- drop-handbook-collections.sql — remove the five legacy per-handbook TOC
-- collections that export-handbook-toc.py folded into `handbook_toc`:
--   revenue_handbook, production_handbook, solid_minerals_handbook,
--   geothermal_class_1, geothermal_class_2_3
--
-- Nothing in code, no FK, and no directus_relation references them. Their TOC
-- data lives in handbook_toc. The only lingering references are five orphaned
-- collection_blocks (one per collection) that render nothing on the frontend —
-- this script removes those blocks (and their page-block junction rows) too.
--
-- !!! BEFORE RUNNING !!!
--   1. Back up first (local: pg_dump; upgrade: cg-manage-rds export).
--   2. VERIFY handbook_toc fully represents the data: the five collections total
--      521 rows vs handbook_toc's 517 — confirm the 4-row gap is intended dedup,
--      not lost TOC entries, before deleting the originals.
--   3. Rehearse on LOCAL, then run on UPGRADE (they exist on both).
--
-- AFTER RUNNING:
--   1. Restart Directus (drops the collections from the admin Data Model).
--   2. RE-SNAPSHOT: these are registered collections in cms/snapshots/current.yaml,
--      so re-run `directus schema snapshot` -> current.yaml and commit the removal.
--   3. Remove the five names from the collection_blocks.collection dropdown choices
--      (Settings -> Data Model -> collection_blocks -> collection field).
--   4. Optional: trim the five names from the Flow collection-watch list in
--      cms/configuration/flows.json (harmless stale entries otherwise).
-- One transaction — all or nothing.
-- ============================================================================

BEGIN;

-- 1. Remove the orphaned collection_blocks that point at these collections, from
--    every M2A junction that can hold a collection_blocks item, then the blocks.
DO $$
DECLARE
  ids text[];
  j text;
BEGIN
  SELECT array_agg(id::text) INTO ids FROM collection_blocks
   WHERE collection IN ('revenue_handbook','production_handbook','solid_minerals_handbook',
                        'geothermal_class_1','geothermal_class_2_3');

  IF ids IS NOT NULL THEN
    FOREACH j IN ARRAY ARRAY[
      'pages_page_blocks','pages_sidebar_blocks','card_blocks_card_content_blocks',
      'expansion_panels_expansion_panel_blocks','tab_blocks_tab_blocks'
    ] LOOP
      EXECUTE format('DELETE FROM %I WHERE collection=''collection_blocks'' AND item = ANY($1)', j) USING ids;
    END LOOP;
    DELETE FROM collection_blocks WHERE id::text = ANY(ids);
  END IF;
END $$;

-- 2. Drop the five legacy collections (table + all Directus metadata).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'revenue_handbook','production_handbook','solid_minerals_handbook',
    'geothermal_class_1','geothermal_class_2_3'
  ] LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', t);
    DELETE FROM directus_relations   WHERE many_collection = t OR one_collection = t;
    DELETE FROM directus_fields      WHERE collection = t;
    DELETE FROM directus_presets     WHERE collection = t;
    DELETE FROM directus_permissions WHERE collection = t;
    DELETE FROM directus_collections WHERE collection = t;
  END LOOP;
END $$;

COMMIT;

-- VERIFY (each should return 0 rows):
--   SELECT collection FROM directus_collections WHERE collection IN
--     ('revenue_handbook','production_handbook','solid_minerals_handbook','geothermal_class_1','geothermal_class_2_3');
--   SELECT collection FROM collection_blocks WHERE collection IN
--     ('revenue_handbook','production_handbook','solid_minerals_handbook','geothermal_class_1','geothermal_class_2_3');
-- ============================================================================
