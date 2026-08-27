-- ============================================================================
-- convert-pk-to-uuid.sql — one-time conversion of group-1 content collections
-- from serial (integer) PKs to UUID PKs, preserving data and Directus field
-- config. The snapshot taken afterward carries UUID PKs; at cutover the target
-- drops the old integer versions, recreates them from the snapshot, and imports
-- UUID content cleanly.
--
-- THREE PATTERNS (a collection can only need one):
--   A. standalone     — no inbound references. Simple column swap.
--   B. FK-referenced  — real FK columns point at it; remap them (contacts, menus).
--   C. M2A-target     — page/block junctions store its id as a STRING `item`;
--                       remap those strings (layout_column_blocks).
--
-- !!! REHEARSE ON LOCAL FIRST, THEN RUN ON UPGRADE !!!
--   0. Back up first — local: pg_dump; upgrade: cg-manage-rds export.
--   1. Run on LOCAL, straight against its Postgres (no tunnel):
--         psql "$LOCAL_DB_URL" -f cms/seed/convert-pk-to-uuid.sql
--      Local is the safe rehearsal AND keeps your workbench aligned with the
--      new UUID snapshot (an integer-PK local would diverge from it).
--   2. Verify on local (queries at the bottom): every group-1 id is uuid;
--      restart Directus; create a row -> a UUID is generated; contacts M2M +
--      menus still resolve; the admin renders the id fields.
--   3. ONLY if local is clean, run on UPGRADE through the cf connect-to-service
--      tunnel — same file.
--   4. Restart Directus on upgrade, then re-run `directus schema snapshot`
--      -> current.yaml (now UUID) and commit.
--
--   Before running on either: confirm the constraint/sequence names below match
--   your DB (discovery query at the bottom). One transaction — all or nothing.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- PATTERN A — standalone collections (no inbound FK, not an M2A target).
-- ---------------------------------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'events','press_releases','announcements','reporter_letters','rulemakings',
    'redirects','revenue_handbook','production_handbook','solid_minerals_handbook'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN id__uuid uuid NOT NULL DEFAULT gen_random_uuid()', t);
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', t, t || '_pkey');
    EXECUTE format('ALTER TABLE %I DROP COLUMN id', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN id__uuid TO id', t);
    EXECUTE format('ALTER TABLE %I ADD PRIMARY KEY (id)', t);
    EXECUTE format('DROP SEQUENCE IF EXISTS %I', t || '_id_seq');
    UPDATE directus_fields SET special = 'uuid' WHERE collection = t AND field = 'id';
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- PATTERN C — layout_column_blocks: an M2A target (item stored as string in
-- pages_page_blocks and tab_blocks_tab_blocks). Remap those strings, then swap.
-- ---------------------------------------------------------------------------
ALTER TABLE layout_column_blocks ADD COLUMN id__uuid uuid NOT NULL DEFAULT gen_random_uuid();

UPDATE pages_page_blocks j SET item = l.id__uuid::text
  FROM layout_column_blocks l
  WHERE j.collection = 'layout_column_blocks' AND j.item = l.id::text;
UPDATE tab_blocks_tab_blocks j SET item = l.id__uuid::text
  FROM layout_column_blocks l
  WHERE j.collection = 'layout_column_blocks' AND j.item = l.id::text;

ALTER TABLE layout_column_blocks DROP CONSTRAINT layout_column_blocks_pkey;
ALTER TABLE layout_column_blocks DROP COLUMN id;
ALTER TABLE layout_column_blocks RENAME COLUMN id__uuid TO id;
ALTER TABLE layout_column_blocks ADD PRIMARY KEY (id);
DROP SEQUENCE IF EXISTS layout_column_blocks_id_seq;
UPDATE directus_fields SET special = 'uuid' WHERE collection = 'layout_column_blocks' AND field = 'id';

-- ---------------------------------------------------------------------------
-- PATTERN B — contacts: FK-referenced by contacts_person.contacts_id and
-- contacts_contact_topics.contacts_id. Remap those columns, preserve linkage.
-- (Confirm the FK constraint names + ON DELETE rules against your DB first.)
-- ---------------------------------------------------------------------------
ALTER TABLE contacts ADD COLUMN id__uuid uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE contacts_person ADD COLUMN contacts_id__uuid uuid;
UPDATE contacts_person cp SET contacts_id__uuid = c.id__uuid
  FROM contacts c WHERE cp.contacts_id = c.id;

ALTER TABLE contacts_contact_topics ADD COLUMN contacts_id__uuid uuid;
UPDATE contacts_contact_topics j SET contacts_id__uuid = c.id__uuid
  FROM contacts c WHERE j.contacts_id = c.id;

ALTER TABLE contacts_person          DROP CONSTRAINT contacts_person_contacts_id_foreign;
ALTER TABLE contacts_contact_topics  DROP CONSTRAINT contacts_contact_topics_contacts_id_foreign;

ALTER TABLE contacts DROP CONSTRAINT contacts_pkey;
ALTER TABLE contacts DROP COLUMN id;
ALTER TABLE contacts RENAME COLUMN id__uuid TO id;
ALTER TABLE contacts ADD PRIMARY KEY (id);
DROP SEQUENCE IF EXISTS contacts_id_seq;

ALTER TABLE contacts_person DROP COLUMN contacts_id;
ALTER TABLE contacts_person RENAME COLUMN contacts_id__uuid TO contacts_id;
ALTER TABLE contacts_person ADD CONSTRAINT contacts_person_contacts_id_foreign
  FOREIGN KEY (contacts_id) REFERENCES contacts(id) ON DELETE SET NULL;

ALTER TABLE contacts_contact_topics DROP COLUMN contacts_id;
ALTER TABLE contacts_contact_topics RENAME COLUMN contacts_id__uuid TO contacts_id;
ALTER TABLE contacts_contact_topics ALTER COLUMN contacts_id SET NOT NULL;
ALTER TABLE contacts_contact_topics ADD CONSTRAINT contacts_contact_topics_contacts_id_foreign
  FOREIGN KEY (contacts_id) REFERENCES contacts(id) ON DELETE CASCADE;

UPDATE directus_fields SET special = 'uuid' WHERE collection = 'contacts' AND field = 'id';

-- ---------------------------------------------------------------------------
-- PATTERN B — menus: FK-referenced by menus_pages.menus_id.
-- ---------------------------------------------------------------------------
ALTER TABLE menus ADD COLUMN id__uuid uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE menus_pages ADD COLUMN menus_id__uuid uuid;
UPDATE menus_pages mp SET menus_id__uuid = m.id__uuid
  FROM menus m WHERE mp.menus_id = m.id;

ALTER TABLE menus_pages DROP CONSTRAINT menus_pages_menus_id_foreign;

ALTER TABLE menus DROP CONSTRAINT menus_pkey;
ALTER TABLE menus DROP COLUMN id;
ALTER TABLE menus RENAME COLUMN id__uuid TO id;
ALTER TABLE menus ADD PRIMARY KEY (id);
DROP SEQUENCE IF EXISTS menus_id_seq;

ALTER TABLE menus_pages DROP COLUMN menus_id;
ALTER TABLE menus_pages RENAME COLUMN menus_id__uuid TO menus_id;
ALTER TABLE menus_pages ADD CONSTRAINT menus_pages_menus_id_foreign
  FOREIGN KEY (menus_id) REFERENCES menus(id) ON DELETE CASCADE;

UPDATE directus_fields SET special = 'uuid' WHERE collection = 'menus' AND field = 'id';

COMMIT;

-- ============================================================================
-- VERIFY (run these AFTER, then restart Directus + re-snapshot):
--
--   -- all group-1 PKs should now report udt_name = uuid:
--   SELECT table_name, udt_name FROM information_schema.columns
--    WHERE column_name='id' AND table_name IN
--     ('events','press_releases','announcements','reporter_letters','rulemakings',
--      'redirects','revenue_handbook','production_handbook','solid_minerals_handbook',
--      'layout_column_blocks','contacts','menus');
--
--   -- no orphaned junction items for the remapped M2A collection:
--   SELECT count(*) FROM pages_page_blocks
--    WHERE collection='layout_column_blocks'
--      AND item NOT IN (SELECT id::text FROM layout_column_blocks);
--
-- DISCOVER constraint/sequence names if the defaults above don't match:
--   SELECT conname, conrelid::regclass FROM pg_constraint
--    WHERE conrelid IN ('contacts'::regclass,'menus'::regclass,
--                       'contacts_person'::regclass,'contacts_contact_topics'::regclass,
--                       'menus_pages'::regclass);
-- ============================================================================
