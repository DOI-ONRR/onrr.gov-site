-- seed-fy-disbursements-dictionary.sql — data_dictionary content for the Fiscal Year
-- disbursements dataset. The dictionary is identical to the Monthly disbursements
-- dataset (same columns/definitions), so rather than duplicate the content this copies
-- it from the Monthly dataset to the FY dataset, generating fresh ids.
--
-- Datasets are resolved BY NAME (both share source_collection='disbursement', so that's
-- no longer unique). Re-running clears + re-copies the FY dictionary. The one FY-specific
-- tweak: the leading "Date" field is reworded from a month to a fiscal year.
--
-- Run: psql "$DB_URL" -f cms/seed/seed-fy-disbursements-dictionary.sql
BEGIN;

-- Clear any existing FY dictionary first (values cascade via FK).
DELETE FROM data_dictionary_fields
WHERE dataset = (SELECT id FROM dataset_metadata WHERE name = 'Fiscal year disbursements' LIMIT 1);

-- Map each Monthly field to a new id for the FY copy.
CREATE TEMP TABLE dd_field_map ON COMMIT DROP AS
SELECT f.id AS old_id, gen_random_uuid() AS new_id
FROM data_dictionary_fields f
WHERE f.dataset = (SELECT id FROM dataset_metadata WHERE name = 'Monthly disbursements' LIMIT 1);

-- Copy fields to the FY dataset with the new ids.
INSERT INTO data_dictionary_fields (id, dataset, sort, field_name, definition, value_style)
SELECT m.new_id,
       (SELECT id FROM dataset_metadata WHERE name = 'Fiscal year disbursements' LIMIT 1),
       f.sort, f.field_name, f.definition, f.value_style
FROM data_dictionary_fields f
JOIN dd_field_map m ON m.old_id = f.id;

-- Copy the values, remapping to the new field ids (fresh value ids).
INSERT INTO data_dictionary_values (id, field, sort, term, definition)
SELECT gen_random_uuid(), m.new_id, v.sort, v.term, v.definition
FROM data_dictionary_values v
JOIN dd_field_map m ON m.old_id = v.field;

-- FY-specific wording for the leading period field.
UPDATE data_dictionary_fields
SET definition = 'The fiscal year in which the disbursement occurred.'
WHERE dataset = (SELECT id FROM dataset_metadata WHERE name = 'Fiscal year disbursements' LIMIT 1)
  AND field_name = 'Date';

COMMIT;
