-- add-inline-block-to-button-external-links.sql
--
-- Appends the USWDS `display-inline-block` utility class to every <a> that carries
-- BOTH `usa-button` and `usa-link--external`, across all content columns in the
-- Directus DB. This keeps the external-link treatment from usa-link--external while
-- forcing the anchor to shrink-wrap (inline-block) instead of stretching like a block
-- button. Companion to the detection scan (same column enumeration / class pattern).
--
-- Safe to run: wrapped in a transaction, and idempotent — a trailing duplicate
-- `display-inline-block` created by a re-run is collapsed back to one.
--
-- RUN IT:
--   local   :  docker exec -i database psql -U directus -d directus \
--                < cms/scripts/add-inline-block-to-button-external-links.sql
--   upgrade :  psql "$UPGRADE_DATABASE_URL" \
--                -f cms/scripts/add-inline-block-to-button-external-links.sql
--
-- Back up / snapshot the target DB first (or test on local), since this mutates stored
-- content. Watch the NOTICE output: the per-column counts should sum to your 26, and
-- the verification block must report 0 remaining. If not, run ROLLBACK (see end).

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Update: add display-inline-block to button+external anchors everywhere.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r        record;
  n        integer;
  total    integer := 0;
  -- The class value, in each order the two classes can appear. \y = Postgres word
  -- boundary (NOT \b). Groups: 1 = `<a ... class="`, 2 = the class value, 3 = `"`.
  pat_a    text := '(<a\y[^>]*class=")([^"]*\yusa-button\y[^"]*\yusa-link--external\y[^"]*)(")';
  pat_b    text := '(<a\y[^>]*class=")([^"]*\yusa-link--external\y[^"]*\yusa-button\y[^"]*)(")';
  repl     text := '\1\2 display-inline-block\3';
  -- Collapse an adjacent duplicate the util could pick up on a re-run.
  dedup    text := '(display-inline-block)(\s+display-inline-block)+';
  -- Row gate: the opening <a> tag has both classes (either order).
  gate     text := '<a\y[^>]*(\yusa-button\y[^>]*\yusa-link--external\y|\yusa-link--external\y[^>]*\yusa-button\y)[^>]*>';
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
             regexp_replace(%I, %L, %L, ''gi''),
           %L, %L, ''gi''),
         %L, %L, ''gi'')
       WHERE %I ~* %L',
      r.table_name, r.column_name,
      r.column_name, pat_a, repl,   -- pass 1: usa-button ... usa-link--external
                     pat_b, repl,   -- pass 2: usa-link--external ... usa-button
                     dedup, '\1',   -- pass 3: de-dup adjacent util
      r.column_name, gate);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n > 0 THEN
      total := total + n;
      RAISE NOTICE '  updated %.% : % row(s)', r.table_name, r.column_name, n;
    END IF;
  END LOOP;
  RAISE NOTICE 'display-inline-block added across % row(s) total', total;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Verify: list any content that still has a button+external anchor but no
--    display-inline-block. This table MUST come back empty.
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS tmp_button_external_remaining;
CREATE TEMP TABLE tmp_button_external_remaining (tbl text, col text, row_id text, snippet text);

DO $$
DECLARE
  r     record;
  gate  text := '<a\y[^>]*(\yusa-button\y[^>]*\yusa-link--external\y|\yusa-link--external\y[^>]*\yusa-button\y)[^>]*>';
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
    -- A row with the anchor pattern but NO display-inline-block anywhere still needs
    -- fixing. (The UPDATE rewrites every match in a row, so no mixed-state rows.)
    EXECUTE format(
      'INSERT INTO tmp_button_external_remaining
         SELECT %L, %L, id::text, regexp_replace(left(%I, 400), ''\s+'', '' '', ''g'')
         FROM %I
         WHERE %I ~* %L AND %I !~* ''display-inline-block''',
      r.table_name, r.column_name, r.column_name,
      r.table_name, r.column_name, gate, r.column_name);
  END LOOP;
END $$;

SELECT * FROM tmp_button_external_remaining ORDER BY tbl, col, row_id;

COMMIT;
-- If the NOTICE total is wrong or the verification returned rows, replace COMMIT
-- with ROLLBACK above and investigate before re-running.
