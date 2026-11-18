-- remove-table-modifier-classes.sql
--
-- Strips the USWDS table MODIFIER classes `usa-table--borderless`, `usa-table--striped`,
-- and `usa-table--compact` from every stored HTML value, leaving the bare `usa-table`
-- (and any other classes such as `text-center` / `width-full` intact). The project now
-- restyles plain `.usa-table` with the borderless + violet-rule look, so these explicit
-- modifiers are redundant and the native `--striped` shading fights the project styles.
--
-- Companion to the read-only scan `find-table-modifier-classes.sql` (same column
-- enumeration). Verified on the data that these three tokens ONLY ever appear inside
-- `<table>` class attributes (0 occurrences outside a <table> tag), so removing them by
-- token is safe for prose.
--
-- Safe to run: wrapped in a transaction and idempotent — a re-run finds nothing to strip
-- and the whitespace cleanups are no-ops.
--
-- RUN IT:
--   local   :  docker exec -i database psql -U directus -d directus \
--                < cms/scripts/remove-table-modifier-classes.sql
--   upgrade :  psql "$UPGRADE_DATABASE_URL" \
--                -f cms/scripts/remove-table-modifier-classes.sql
--
-- Back up / snapshot the target DB first (or test on local). Watch the NOTICE output:
-- the per-column counts are rows changed, and the verification block must report 0
-- remaining. If anything looks wrong, replace COMMIT with ROLLBACK (see end).

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Strip the three modifier classes everywhere, then tidy the class attribute.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r      record;
  n      integer;
  total  integer := 0;
  -- \y = Postgres word boundary (NOT \b). Pass 1 removes a modifier token together
  -- with ONE preceding whitespace char, so `a usa-table--striped b` collapses to
  -- `a b` with a single space (no double space left behind).
  strip  text := '\s*\yusa-table--(borderless|striped|compact)\y';
  -- Passes 2 & 3 clean a class value that lost its first/last token: trim whitespace
  -- just inside the opening `class="` and just before its closing `"`. [^"]* keeps the
  -- trim inside the one attribute.
  ltrim  text := '(class=")\s+';
  rtrim  text := '(class="[^"]*?)\s+(")';
  -- Row gate: a <table> opening tag that still carries one of the three modifiers.
  gate   text := '<table\y[^>]*\yusa-table--(borderless|striped|compact)\y';
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
    EXECUTE format(
      'UPDATE %I SET %I =
         regexp_replace(
           regexp_replace(
             regexp_replace(%I, %L, '''', ''gi''),
           %L, ''\1'', ''gi''),
         %L, ''\1\2'', ''gi'')
       WHERE %I ~* %L',
      r.table_name, r.column_name,
      r.column_name, strip,   -- pass 1: remove the modifier tokens
                     ltrim,   -- pass 2: trim leading space inside class="
                     rtrim,   -- pass 3: trim trailing space before closing "
      r.column_name, gate);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN
      total := total + n;
      RAISE NOTICE '  updated %.% : % row(s)', r.table_name, r.column_name, n;
    END IF;
  END LOOP;
  RAISE NOTICE 'modifier classes stripped from % row(s) total', total;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Verify: no stored value still carries any of the three modifier classes.
--    This table MUST come back empty.
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS tmp_table_modifier_remaining;
CREATE TEMP TABLE tmp_table_modifier_remaining (tbl text, col text, row_id text, snippet text);

DO $$
DECLARE
  r     record;
  tok   text := 'usa-table--(borderless|striped|compact)';
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
    EXECUTE format(
      'INSERT INTO tmp_table_modifier_remaining
         SELECT %L, %L, id::text, regexp_replace(left(%I, 400), ''\s+'', '' '', ''g'')
         FROM %I WHERE %I ~* %L',
      r.table_name, r.column_name, r.column_name,
      r.table_name, r.column_name, tok);
  END LOOP;
END $$;

SELECT * FROM tmp_table_modifier_remaining ORDER BY tbl, col, row_id;

COMMIT;
-- If the verification returned rows (or the NOTICE totals look wrong), replace COMMIT
-- with ROLLBACK above and investigate before re-running.
