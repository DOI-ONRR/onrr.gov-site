-- find-table-modifier-classes.sql
--
-- READ-ONLY scan. Lists every stored HTML value whose <table> carries a USWDS table
-- MODIFIER class (`usa-table--*` — e.g. usa-table--borderless, usa-table--compact,
-- usa-table--striped, usa-table--stacked, usa-table--stacked-header) — i.e. a class
-- BEYOND the bare `usa-table`. Use it to find CMS tables that still pin an explicit
-- variant now that the project restyles plain `.usa-table` to the borderless/violet
-- look, so those redundant/conflicting modifiers can be cleaned up.
--
-- Nothing is written: no transaction, safe to run against any environment (local,
-- upgrade, dev, prod). It enumerates the same columns as the button scan: every
-- text/varchar column of a non-`directus_` table that has an `id` column.
--
-- RUN IT:
--   local   :  docker exec -i database psql -U directus -d directus \
--                < cms/scripts/find-table-modifier-classes.sql
--   upgrade :  psql "$UPGRADE_DATABASE_URL" \
--                -f cms/scripts/find-table-modifier-classes.sql

-- One row per offending <table> opening tag (a row/column may appear more than once
-- if it holds multiple modifier tables).
DROP TABLE IF EXISTS tmp_table_modifier_classes;
CREATE TEMP TABLE tmp_table_modifier_classes (tbl text, col text, row_id text, table_tag text);

DO $$
DECLARE
  r    record;
  -- Capture a full opening <table ...> tag whose class attribute includes a
  -- `usa-table--` modifier. \y = Postgres word boundary (NOT \b); [^>]* keeps the
  -- match inside the single tag (never crosses the closing `>`).
  tag  text := '(<table\y[^>]*\yusa-table--[^>]*>)';
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type IN ('text', 'character varying')
      AND c.table_name NOT LIKE 'directus\_%'
      AND EXISTS (SELECT 1 FROM information_schema.columns i
                  WHERE i.table_schema = 'public'
                    AND i.table_name = c.table_name
                    AND i.column_name = 'id')
  LOOP
    -- LATERAL regexp_matches(..., 'gi') yields one row per matching tag and drops
    -- rows with no match, so no extra WHERE gate is needed.
    EXECUTE format(
      'INSERT INTO tmp_table_modifier_classes
         SELECT %L, %L, t.id::text, m[1]
         FROM %I t, LATERAL regexp_matches(t.%I, %L, ''gi'') AS m',
      r.table_name, r.column_name, r.table_name, r.column_name, tag);
  END LOOP;
END $$;

-- 1. Breakdown: which modifier classes are in use, and how many tags carry each.
--    (A single tag with two modifiers counts once per modifier.)
SELECT m[1] AS modifier_class, count(*) AS tag_occurrences
FROM tmp_table_modifier_classes,
     LATERAL regexp_matches(table_tag, 'usa-table--[A-Za-z-]+', 'g') AS m
GROUP BY m[1]
ORDER BY tag_occurrences DESC, modifier_class;

-- 2. Detail: every offending table tag, with its table/column/row so the item can be
--    opened in Directus. table_tag is the raw opening <table ...> markup.
SELECT tbl, col, row_id, table_tag
FROM tmp_table_modifier_classes
ORDER BY tbl, col, row_id;
