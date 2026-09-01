-- ============================================================================
-- order-contacts-by-role.sql — set contacts_person.sort so each contact's people
-- list orders by role. Requested spine:
--   1. Primary Contact Federal   2. Supervisor Federal
--   3. Primary Contact Indian    4. Supervisor Indian
--
-- Data shape (verified): every person's Federal/Indian jurisdiction is carried by
-- role_type for PRIMARIES (role_type = 'federal' | 'indian') but only by the free
-- `role` string for SUPERVISORS (role_type is always 'supervisor'; the role reads
-- "Supervisor Federal" / "Supervisor Indian" / plain "Supervisor"). So the ranking
-- keys off role_type AND role. Roles beyond the four named (plain Supervisor,
-- Manager, Backup Contact, anything else) trail the spine — each on its own CASE
-- rung, so reordering them is a one-line edit.
--
-- Scope: only people attached to a contact (contacts_id IS NOT NULL). sort is set
-- per contact group (1-based), which is exactly Directus's O2M sort semantics.
-- Data-only (writes the `sort` column) — NOT a schema change, so no re-snapshot.
--
-- !!! BEFORE RUNNING !!!
--   1. Back up first (local: pg_dump; upgrade: cg-manage-rds export).
--   2. Optional: run the PREVIEW query at the bottom to eyeball the resulting order
--      before committing the UPDATE.
--   3. Apply on LOCAL, then on UPGRADE (identical data on both).
-- One transaction — all or nothing.
-- ============================================================================

BEGIN;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY contacts_id
      ORDER BY
        CASE
          WHEN role_type = 'federal'                               THEN 1  -- Primary Contact Federal
          WHEN role_type = 'supervisor' AND role ILIKE '%federal%' THEN 2  -- Supervisor Federal
          WHEN role_type = 'indian'                                THEN 3  -- Primary Contact Indian
          WHEN role_type = 'supervisor' AND role ILIKE '%indian%'  THEN 4  -- Supervisor Indian
          WHEN role_type = 'supervisor'                            THEN 5  -- Supervisor (no jurisdiction in role)
          WHEN role_type = 'manager'                               THEN 6  -- Manager
          WHEN role_type = 'backup'                                THEN 7  -- Backup Contact
          ELSE                                                          8  -- anything else
        END,
        lower(coalesce(name, '')),  -- stable, deterministic tiebreak within a rung
        id
    ) AS new_sort
  FROM contacts_person
  WHERE contacts_id IS NOT NULL
)
UPDATE contacts_person p
   SET sort = r.new_sort
  FROM ranked r
 WHERE p.id = r.id
   AND p.sort IS DISTINCT FROM r.new_sort;

COMMIT;

-- ============================================================================
-- PREVIEW (run against an un-updated DB, or after — read-only): the resulting
-- order for a few contact groups.
--   SELECT contacts_id,
--          string_agg(role_type || ':' || coalesce(role,'-'), '  >  ' ORDER BY sort)
--            AS ordered_roster
--     FROM contacts_person
--    WHERE contacts_id IS NOT NULL
--    GROUP BY contacts_id
--    LIMIT 10;
--
-- VERIFY every attached person now has a sort (should return 0):
--   SELECT count(*) FROM contacts_person WHERE contacts_id IS NOT NULL AND sort IS NULL;
-- ============================================================================
