-- seed-federal-revenue-by-company-dictionary.sql — data_dictionary content for the
-- Federal Revenue by Company dataset. Idempotent-ish: the DELETE re-seeds cleanly.
-- Resolves the dataset by source_collection so it's portable across instances
-- (the migrate-dataset.py script deliberately does NOT carry the data_dictionary).
-- Run: psql "$DB_URL" -f this-file.sql
BEGIN;

-- Intro shown above the dictionary (scalar on dataset_metadata; migrate-dataset.py carries
-- this, but set it here too so the seed fully establishes the dictionary on any instance).
UPDATE dataset_metadata
   SET data_dictionary_intro = 'Definitions for the fields in the Federal Revenue by Company dataset. Revenue is reported by company (corporate name) and calendar year.'
 WHERE source_collection = 'federal_revenue_by_company';

-- Clear any existing dictionary for this dataset first. The values -> fields FK is set-null on
-- delete (not cascade), so remove the values BEFORE the fields — otherwise the old values linger
-- (orphaned, field = null) and collide with the fixed-id re-insert below.
DELETE FROM data_dictionary_values
 WHERE field IN (SELECT id FROM data_dictionary_fields WHERE dataset = (SELECT id FROM dataset_metadata WHERE source_collection='federal_revenue_by_company' LIMIT 1));
DELETE FROM data_dictionary_fields WHERE dataset = (SELECT id FROM dataset_metadata WHERE source_collection='federal_revenue_by_company' LIMIT 1);

INSERT INTO data_dictionary_fields (id, dataset, sort, field_name, definition, value_style) VALUES ('75dc682d-55ae-4f65-9270-7405ccf37c04', (SELECT id FROM dataset_metadata WHERE source_collection='federal_revenue_by_company' LIMIT 1), 1, 'Calendar Year', 'The calendar year in which ONRR received the revenue.', 'rows');

INSERT INTO data_dictionary_fields (id, dataset, sort, field_name, definition, value_style) VALUES ('c01b9415-6f10-4c6b-bfe1-26d9d1068804', (SELECT id FROM dataset_metadata WHERE source_collection='federal_revenue_by_company' LIMIT 1), 2, 'Corporate Name', 'The name of the company that reported and paid the revenue to ONRR.', 'rows');

INSERT INTO data_dictionary_fields (id, dataset, sort, field_name, definition, value_style) VALUES ('9287a323-c7b8-41fe-84ff-48109ef506c0', (SELECT id FROM dataset_metadata WHERE source_collection='federal_revenue_by_company' LIMIT 1), 3, 'Revenue Agency', 'The agency responsible for the leased lands or waters that generated the revenue. For this dataset the revenue is reported to the Federal government.', 'rows');

INSERT INTO data_dictionary_fields (id, dataset, sort, field_name, definition, value_style) VALUES ('15c14d2b-12b6-4151-b4e4-684a2a9feb2e', (SELECT id FROM dataset_metadata WHERE source_collection='federal_revenue_by_company' LIMIT 1), 4, 'Revenue Type', 'The category of payment companies make for the right to explore, develop, and produce natural resources on federal lands and waters.', 'rows');
INSERT INTO data_dictionary_values (id, field, sort, term, definition) VALUES ('75c483da-cbd6-4a81-abe7-91e519dcac2d', '15c14d2b-12b6-4151-b4e4-684a2a9feb2e', 1, 'Royalties', 'Payments for extracted natural resources, determined by a percentage of the resources'' production value.');
INSERT INTO data_dictionary_values (id, field, sort, term, definition) VALUES ('97672d00-b153-4408-b20c-a38a068f29b3', '15c14d2b-12b6-4151-b4e4-684a2a9feb2e', 2, 'Rents', 'The annual payment for leasing lands or waters before production starts.');
INSERT INTO data_dictionary_values (id, field, sort, term, definition) VALUES ('faeb4847-cab7-4735-a963-1f6cf8382485', '15c14d2b-12b6-4151-b4e4-684a2a9feb2e', 3, 'Bonus', 'The amount paid by the highest bidder for a natural resource lease.');

INSERT INTO data_dictionary_fields (id, dataset, sort, field_name, definition, value_style) VALUES ('3434b120-6e6c-45a8-85e5-d64fdbbb4ec5', (SELECT id FROM dataset_metadata WHERE source_collection='federal_revenue_by_company' LIMIT 1), 5, 'Commodity', 'The commodity that generated the revenue. In the pre-production (bonus and rent) phases, oil and gas are combined and listed as "Oil & Gas (pre-production)" since it is not yet known whether a lease will produce oil, gas, or both.', 'tags');
INSERT INTO data_dictionary_values (id, field, sort, term, definition) VALUES ('778f4bd4-48b3-425c-ad63-b55008dc2515', '3434b120-6e6c-45a8-85e5-d64fdbbb4ec5', 1, 'Oil', NULL);
INSERT INTO data_dictionary_values (id, field, sort, term, definition) VALUES ('f5d76fe8-f956-4d29-8cb2-5a9732422cd3', '3434b120-6e6c-45a8-85e5-d64fdbbb4ec5', 2, 'Gas', NULL);
INSERT INTO data_dictionary_values (id, field, sort, term, definition) VALUES ('e70b38e2-e98d-43df-ac98-ca5ddb83c2ba', '3434b120-6e6c-45a8-85e5-d64fdbbb4ec5', 3, 'NGL', NULL);
INSERT INTO data_dictionary_values (id, field, sort, term, definition) VALUES ('44309d3d-f75a-4b98-9017-9ac6a60b7ad6', '3434b120-6e6c-45a8-85e5-d64fdbbb4ec5', 4, 'Oil & Gas (pre-production)', NULL);
INSERT INTO data_dictionary_values (id, field, sort, term, definition) VALUES ('743022ec-923a-478a-9e2f-62171c894d00', '3434b120-6e6c-45a8-85e5-d64fdbbb4ec5', 5, 'Coal', NULL);

INSERT INTO data_dictionary_fields (id, dataset, sort, field_name, definition, value_style) VALUES ('f19fc6e2-e8fc-4721-97da-bfb9f941f5d4', (SELECT id FROM dataset_metadata WHERE source_collection='federal_revenue_by_company' LIMIT 1), 6, 'Revenue', 'The revenue amount, in dollars. Values can be negative to reflect adjustments to previously reported amounts.', 'rows');

COMMIT;
