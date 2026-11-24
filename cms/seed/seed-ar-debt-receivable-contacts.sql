-- seed-ar-debt-receivable-contacts.sql
-- Backfill the Accounts-Receivable / Debt-Collection contacts that live in PROD but were
-- absent from the upgrade instance when the contacts model conversion ran (page/tab ->
-- topics+section, _n columns -> contacts_person). Sourced from prod-onrr-cms (old model),
-- transformed to the new model here. 26 contacts / 58 people across 3 topics:
--   Federal Accounts Receivable (12 company buckets; the 5 'type' rows already exist),
--   Indian Accounts Receivable (7), Debt Collection (7).
-- role_type reuses the conversion heuristic: Supervisor->supervisor, Backup Contact->backup,
-- 'Primary Contact'-> indian (Indian AR tab) / federal (FAR + Debt Collection).
-- Deterministic uuid5 ids + ON CONFLICT/NOT EXISTS => idempotent & re-runnable (local, then
-- upgrade). Data-only: no schema snapshot needed. Run order-contacts-by-role.sql afterward
-- to normalize per-card person sort. Run: psql "$DB_URL" -f cms/seed/seed-ar-debt-receivable-contacts.sql

BEGIN;

-- === Debt Collection -> debt-collection-contacts ===
INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('9819c782-94e6-5a07-bf3d-e0e23ab2f1a1', 'published', 'Companies starting with: A,N,S,X,Y,T and Q', 'Debt Collection', true, 'A,N,S,X,Y,T and Q', 'Companies starting with: A,N,S,X,Y,T and Q', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('5c2c3b13-dbfa-5dd4-a950-7f34bd4f812f', '9819c782-94e6-5a07-bf3d-e0e23ab2f1a1', 'Charles Carver', 'Primary Contact', 'federal', 'charles.carver@onrr.gov', '303-231-3834', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('9f23a03c-400b-5373-bd37-8e8abdf6ca5e', '9819c782-94e6-5a07-bf3d-e0e23ab2f1a1', 'Chris Davis', 'Supervisor', 'supervisor', 'christopher.davis@onrr.gov', '303-231-3977', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '9819c782-94e6-5a07-bf3d-e0e23ab2f1a1'::uuid, 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '9819c782-94e6-5a07-bf3d-e0e23ab2f1a1'::uuid AND contact_topics_id = 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('0d6e78a4-cec9-5111-be1d-a5306eaf1d9b', 'published', 'Companies starting with: B,H,K,L,R,M and 1-9', 'Debt Collection', true, 'B,H,K,L,R,M and 1-9', 'Companies starting with: B,H,K,L,R,M and 1-9', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('629829a5-e4dd-5b5d-98b0-0696e751b464', '0d6e78a4-cec9-5111-be1d-a5306eaf1d9b', 'Tami Longmeyer', 'Primary Contact', 'federal', 'tami.longmeyer@onrr.gov', '303-231-3967', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('719ebbc2-e0a0-5b69-8943-c2f9d6694557', '0d6e78a4-cec9-5111-be1d-a5306eaf1d9b', 'Darrel Redford', 'Supervisor', 'supervisor', 'darrel.redford@onrr.gov', '303-231-3316', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '0d6e78a4-cec9-5111-be1d-a5306eaf1d9b'::uuid, 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '0d6e78a4-cec9-5111-be1d-a5306eaf1d9b'::uuid AND contact_topics_id = 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('38944fa1-2cad-5836-848f-c52305508a15', 'published', 'Companies starting with: C,G,I,U,D and E', 'Debt Collection', true, 'C,G,I,U,D and E', 'Companies starting with: C,G,I,U,D and E', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('216976fa-b2f4-589d-a71d-8de3f4d05ff3', '38944fa1-2cad-5836-848f-c52305508a15', 'Julie Quinn', 'Primary Contact', 'federal', 'julie.quinn@onrr.gov', '303-231-3327', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('c7887747-e27e-50d5-b538-34f5a98d0835', '38944fa1-2cad-5836-848f-c52305508a15', 'Cara Hills', 'Supervisor', 'supervisor', 'cara.hills@onrr.gov', '303-231-3745', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '38944fa1-2cad-5836-848f-c52305508a15'::uuid, 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '38944fa1-2cad-5836-848f-c52305508a15'::uuid AND contact_topics_id = 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('a49d017f-5dd7-5af1-ab83-08829973f2a8', 'published', 'Companies starting with: F,J,P and V', 'Debt Collection', true, 'F,J,P and V', 'Companies starting with: F,J,P and V', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('cd252cc3-875a-50bc-b8e9-ac7b41ee4dc9', 'a49d017f-5dd7-5af1-ab83-08829973f2a8', 'Christina Garcia', 'Primary Contact', 'federal', 'christina.garcia@onrr.gov', '303-231-3404', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('fbb1e3e5-3339-5a0f-8072-7b49d98b27be', 'a49d017f-5dd7-5af1-ab83-08829973f2a8', 'Darrel Redford', 'Supervisor', 'supervisor', 'darrel.redford@onrr.gov', '303-231-3316', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT 'a49d017f-5dd7-5af1-ab83-08829973f2a8'::uuid, 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = 'a49d017f-5dd7-5af1-ab83-08829973f2a8'::uuid AND contact_topics_id = 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('c285cf93-0ed5-5e97-a8d3-1b8338b3eace', 'published', 'Companies starting with: W and O', 'Debt Collection', true, 'W and O', 'Companies starting with: W and O', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('06fb8163-96b0-5829-9339-f816441923d4', 'c285cf93-0ed5-5e97-a8d3-1b8338b3eace', 'Chris Davis', 'Primary Contact', 'federal', 'christopher.davis@onrr.gov', '303-231-3977', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('30de4891-94e7-5b6d-9fe9-77cb73a628fe', 'c285cf93-0ed5-5e97-a8d3-1b8338b3eace', 'Tom Anthony', 'Supervisor', 'supervisor', 'thomas.anthony@onrr.gov', '303-231-3708', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT 'c285cf93-0ed5-5e97-a8d3-1b8338b3eace'::uuid, 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = 'c285cf93-0ed5-5e97-a8d3-1b8338b3eace'::uuid AND contact_topics_id = 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('7c122d56-ed50-5d46-a5d0-a9c61e20a949', 'published', 'Solid Minerals', 'Debt Collection', true, NULL, 'Solid Minerals', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('00cf8035-3079-5552-a727-6015253db0fb', '7c122d56-ed50-5d46-a5d0-a9c61e20a949', 'Tiffany Mamayev', 'Primary Contact', 'federal', 'tiffany.mamayev@onrr.gov', '303-231-3758', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('f2614631-274d-5ad2-8764-d9cb95f877a5', '7c122d56-ed50-5d46-a5d0-a9c61e20a949', 'Darrel Redford', 'Supervisor', 'supervisor', 'darrel.redford@onrr.gov', '303-231-3316', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '7c122d56-ed50-5d46-a5d0-a9c61e20a949'::uuid, 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '7c122d56-ed50-5d46-a5d0-a9c61e20a949'::uuid AND contact_topics_id = 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('573c490f-db5c-5fce-9532-3214bb5ed96b', 'published', 'Treasury Referrals', 'Debt Collection', false, NULL, NULL, NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('0668f47f-1697-532c-abe3-de875fec6aac', '573c490f-db5c-5fce-9532-3214bb5ed96b', 'Jessica Polacek', 'Primary Contact', 'federal', 'jessica.polacek@onrr.gov', '303-231-3070', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('66816f09-f166-5374-bd87-58c1ce591a5f', '573c490f-db5c-5fce-9532-3214bb5ed96b', 'Tom Anthony', 'Supervisor', 'supervisor', 'thomas.anthony@onrr.gov', '303-231-3708', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '573c490f-db5c-5fce-9532-3214bb5ed96b'::uuid, 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '573c490f-db5c-5fce-9532-3214bb5ed96b'::uuid AND contact_topics_id = 'c5ad25af-8803-4f60-83be-ab8e3171faef'::uuid);

-- === Federal Accounts Receivable -> federal-accounts-receivable-contacts ===
INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('e6ff6a59-fc1d-5314-92e7-f5a4c6f31c31', 'published', 'Companies starting with: 1 through ANSB', 'Federal Accounts Receivable', NULL, '#,A', 'Companies starting with: 1 through ANSB', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('8b7c468d-8b98-5772-888d-723fd206ec7a', 'e6ff6a59-fc1d-5314-92e7-f5a4c6f31c31', 'Jonathan Nash', 'Primary Contact', 'federal', 'Jonathan.Nash@onrr.gov', '(720) 235-0085', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('5d52cb22-1ddb-5469-a550-f71718605e7e', 'e6ff6a59-fc1d-5314-92e7-f5a4c6f31c31', 'Cara Hills', 'Supervisor', 'supervisor', 'cara.hills@onrr.gov', '(303) 231-3745', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT 'e6ff6a59-fc1d-5314-92e7-f5a4c6f31c31'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = 'e6ff6a59-fc1d-5314-92e7-f5a4c6f31c31'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('7954788d-9c03-53e7-acac-ed597c078ca6', 'published', 'Companies starting with: ANSC through BV', 'Federal Accounts Receivable', NULL, 'A,B', 'Companies starting with: ANSC through BV', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('ad28b243-6067-5a58-bc44-c6e0395e8b61', '7954788d-9c03-53e7-acac-ed597c078ca6', 'Kristina Woolums', 'Primary Contact', 'federal', 'Kristina.Woolums@onrr.gov', '(303) 231-3197', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('866fa898-dc7c-5b9b-aec1-c227742d4587', '7954788d-9c03-53e7-acac-ed597c078ca6', 'Cara Hills', 'Supervisor', 'supervisor', 'cara.hills@onrr.gov', '(303) 231-3745', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '7954788d-9c03-53e7-acac-ed597c078ca6'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '7954788d-9c03-53e7-acac-ed597c078ca6'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('d3d6eed5-0b3b-5459-9c32-dd4b8e00c7ca', 'published', 'Companies starting with: BW through CONO', 'Federal Accounts Receivable', NULL, 'B,C', 'Companies starting with: BW through CONO', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('880c77b7-1bde-5930-91e4-968635086d50', 'd3d6eed5-0b3b-5459-9c32-dd4b8e00c7ca', 'Jessica Sheets', 'Primary Contact', 'federal', 'jessica.sheets@onrr.gov', '(303) 231-3573', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('68304290-6d88-5869-a641-fa7402ed93c0', 'd3d6eed5-0b3b-5459-9c32-dd4b8e00c7ca', 'Tom Anthony', 'Supervisor', 'supervisor', 'thomas.anthony@onrr.gov', '(303) 231-3708', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT 'd3d6eed5-0b3b-5459-9c32-dd4b8e00c7ca'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = 'd3d6eed5-0b3b-5459-9c32-dd4b8e00c7ca'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('e5377c82-6750-5ba0-a339-95bc195fb548', 'published', 'Companies starting with: CONP - EMO', 'Federal Accounts Receivable', NULL, 'C,D,E', 'Companies starting with: CONP - EMO', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('ac8ed517-47ec-58d8-a531-c5a01e964bd4', 'e5377c82-6750-5ba0-a339-95bc195fb548', 'John Elges', 'Primary Contact', 'federal', 'john.elges@onrr.gov', '(303) 231-3158', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('6e75a13d-e0fa-5988-9ce0-be97e99f9293', 'e5377c82-6750-5ba0-a339-95bc195fb548', 'Cara Hills', 'Supervisor', 'supervisor', 'cara.hills@onrr.gov', '303-231-3745', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT 'e5377c82-6750-5ba0-a339-95bc195fb548'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = 'e5377c82-6750-5ba0-a339-95bc195fb548'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('bd311a07-25d6-5987-b0e0-e3a7142c2096', 'published', 'Companies starting with: EMP through GoMex', 'Federal Accounts Receivable', NULL, 'E,F,G', 'Companies starting with: EMP through GoMex', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('36ae7558-b9fd-5bcb-89ea-ed2ba8be7d9c', 'bd311a07-25d6-5987-b0e0-e3a7142c2096', 'Tom Anthony', 'Primary Contact', 'federal', 'thomas.anthony@onrr.gov', '(303) 231-3708', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT 'bd311a07-25d6-5987-b0e0-e3a7142c2096'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = 'bd311a07-25d6-5987-b0e0-e3a7142c2096'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('49227d90-66c7-571b-889b-fbd8eeb7bae1', 'published', 'Companies starting with: GOMEZ through Kerrx', 'Federal Accounts Receivable', NULL, 'G,H,I,J,K', 'Companies starting with: GOMEZ through Kerrx', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('11d6f0ba-2ce6-5a91-b862-511ae3398df3', '49227d90-66c7-571b-889b-fbd8eeb7bae1', 'Cara Hills', 'Primary Contact', 'federal', 'cara.hills@onrr.gov', '(303) 231-3745', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('4cfd3545-85f9-5feb-99b0-61a89de318b6', '49227d90-66c7-571b-889b-fbd8eeb7bae1', 'Cara Hills', 'Supervisor', 'supervisor', 'cara.hills@onrr.gov', '(303) 231-3745', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '49227d90-66c7-571b-889b-fbd8eeb7bae1'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '49227d90-66c7-571b-889b-fbd8eeb7bae1'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('9678bf58-2c8a-5dc2-877b-7b6d298c9eec', 'published', 'Companies starting with: Kerry through MEWA', 'Federal Accounts Receivable', NULL, 'K,L,M', 'Companies starting with: Kerry through MEWA', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('31bd8731-6b84-5adb-8203-5ca227c4e598', '9678bf58-2c8a-5dc2-877b-7b6d298c9eec', 'Edmond Osei', 'Primary Contact', 'federal', 'Edmond.Osei@onrr.gov', '(303) 231-3359', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('5194712c-41f9-5be1-8139-28883d15b976', '9678bf58-2c8a-5dc2-877b-7b6d298c9eec', 'Cara Hills', 'Supervisor', 'supervisor', 'cara.hills@onrr.gov', '(303) 231-3745', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '9678bf58-2c8a-5dc2-877b-7b6d298c9eec'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '9678bf58-2c8a-5dc2-877b-7b6d298c9eec'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('6265ab2b-6b8e-548c-9caf-c01f23bab73d', 'published', 'Companies starting with: MEWB through OXX', 'Federal Accounts Receivable', NULL, 'M,N,O', 'Companies starting with: MEWB through OXX', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('059f1d15-514e-5e17-bdcc-db237fe149d2', '6265ab2b-6b8e-548c-9caf-c01f23bab73d', 'John O''Donoghue', 'Primary Contact', 'federal', 'John.O''Donoghue@onrr.gov', '(303) 231-3122', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('93a16ba9-bb28-5e1b-b57b-c8f39441d44f', '6265ab2b-6b8e-548c-9caf-c01f23bab73d', 'Darrel Redford', 'Supervisor', 'supervisor', 'Darrel.Redford@onrr.gov', '(303) 231-3316', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '6265ab2b-6b8e-548c-9caf-c01f23bab73d'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '6265ab2b-6b8e-548c-9caf-c01f23bab73d'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('4a9235e5-6968-555d-96c3-32d269a9e3bf', 'published', 'Companies starting with: OXY through Resource Q', 'Federal Accounts Receivable', NULL, 'O,P,Q,R', 'Companies starting with: OXY through Resource Q', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('460a7b6b-f0f4-562d-b3dd-b79cc4ca0762', '4a9235e5-6968-555d-96c3-32d269a9e3bf', 'Darrel Redford', 'Primary Contact', 'federal', 'Darrel.Redford@onrr.gov', '(303) 231-3316', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('57f0bf36-6b85-542a-bf37-48631264e80c', '4a9235e5-6968-555d-96c3-32d269a9e3bf', 'Darrel Redford', 'Supervisor', 'supervisor', 'Darrel.Redford@onrr.gov', '(303) 231-3316', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '4a9235e5-6968-555d-96c3-32d269a9e3bf'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '4a9235e5-6968-555d-96c3-32d269a9e3bf'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('ecc43abb-ad21-5ff7-9d3e-dff0743293b5', 'published', 'Companies starting with: Resource R through SNN', 'Federal Accounts Receivable', NULL, 'R,S', 'Companies starting with: Resource R through SNN', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('740a6227-863b-5bfc-b8ee-714d086bb5cc', 'ecc43abb-ad21-5ff7-9d3e-dff0743293b5', 'Rossio Payan', 'Primary Contact', 'federal', 'Rossio.Payan@onrr.gov', '(303) 231-3938', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('cfb63459-49a1-5408-82f0-bf3d746c31c3', 'ecc43abb-ad21-5ff7-9d3e-dff0743293b5', 'Cara Hills', 'Supervisor', 'supervisor', 'cara.hills@onrr.gov', '(303) 231-3745', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT 'ecc43abb-ad21-5ff7-9d3e-dff0743293b5'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = 'ecc43abb-ad21-5ff7-9d3e-dff0743293b5'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('552d9ce1-65be-5c6e-aded-12c5e24f1ff8', 'published', 'Companies starting with: Snow through US', 'Federal Accounts Receivable', NULL, 'S,T,U', 'Companies starting with: Snow through US', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('06147268-0dc3-5c03-9abc-655493092286', '552d9ce1-65be-5c6e-aded-12c5e24f1ff8', 'Mark Moreno', 'Primary Contact', 'federal', 'Mark.Moreno@onrr.gov', '(303) 231-3325', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('3403c276-d2cf-57b9-bf56-f7b09dac721c', '552d9ce1-65be-5c6e-aded-12c5e24f1ff8', 'Darrel Redford', 'Supervisor', 'supervisor', 'Darrel.Redford@onrr.gov', '(303) 231-3316', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '552d9ce1-65be-5c6e-aded-12c5e24f1ff8'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '552d9ce1-65be-5c6e-aded-12c5e24f1ff8'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('b4b60755-fe9b-50b1-99de-aed80f2ff84a', 'published', 'Companies starting with: USA through Z', 'Federal Accounts Receivable', NULL, 'U,V,W,X,Y,Z', 'Companies starting with: USA through Z', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('e9ec8474-55f4-5218-a9cc-26ba94a83798', 'b4b60755-fe9b-50b1-99de-aed80f2ff84a', 'Bethany Hartman', 'Primary Contact', 'federal', 'Bethany.Hartman@onrr.gov', '(303) 231-3021', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('41ae3543-36a7-59c6-bc1f-4813a6c7d4ed', 'b4b60755-fe9b-50b1-99de-aed80f2ff84a', 'Darrel Redford', 'Supervisor', 'supervisor', 'Darrel.Redford@onrr.gov', '(303) 231-3316', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT 'b4b60755-fe9b-50b1-99de-aed80f2ff84a'::uuid, '26137df2-f5e6-4565-a130-4760777d3664'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = 'b4b60755-fe9b-50b1-99de-aed80f2ff84a'::uuid AND contact_topics_id = '26137df2-f5e6-4565-a130-4760777d3664'::uuid);

-- === Indian Accounts Receivable -> indian-accounts-receivable-contacts ===
INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('1bd329a3-3042-53d8-8716-2c4023477eba', 'published', 'Companies starting with: 1-DA', 'Indian Accounts Receivable', true, '#, A, B, C, D', 'Companies starting with: 1-DA', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('339678e3-e822-5745-9a35-9602b507346e', '1bd329a3-3042-53d8-8716-2c4023477eba', 'Marcus Johnson', 'Primary Contact', 'indian', 'marcus.johnson@onrr.gov', '303-231-3957', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('e56db2a2-95eb-5ec7-9582-7a2493963ecf', '1bd329a3-3042-53d8-8716-2c4023477eba', 'John Ellis', 'Backup Contact', 'backup', 'john.ellis@onrr.gov', '303-231-3307', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('a109923c-faf1-5e8e-ad92-f7ff9bd314bc', '1bd329a3-3042-53d8-8716-2c4023477eba', 'Chris Davis', 'Supervisor', 'supervisor', 'christopher.davis@onrr.gov', '303-231-3977', NULL, false, 3, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '1bd329a3-3042-53d8-8716-2c4023477eba'::uuid, '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '1bd329a3-3042-53d8-8716-2c4023477eba'::uuid AND contact_topics_id = '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('479855a1-6ceb-5e78-8269-7eb021615a67', 'published', 'Companies starting with: Db-Fw', 'Indian Accounts Receivable', true, 'D, E, F', 'Companies starting with: Db-Fw', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('761e6932-122b-5ed5-bd0c-956586361a4d', '479855a1-6ceb-5e78-8269-7eb021615a67', 'RonKisha McCree', 'Primary Contact', 'indian', 'ronkisha.mccree@onrr.gov', '303-231-3816', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('b77b0704-35e3-5345-8701-f8fd06f34f5c', '479855a1-6ceb-5e78-8269-7eb021615a67', 'John Ellis', 'Backup Contact', 'backup', 'john.ellis@onrr.gov', '303-231-3307', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('09a8d830-5d89-52f3-95fc-fedf3fdd1de9', '479855a1-6ceb-5e78-8269-7eb021615a67', 'Chris Davis', 'Supervisor', 'supervisor', 'christopher.davis@onrr.gov', '303-231-3977', NULL, false, 3, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '479855a1-6ceb-5e78-8269-7eb021615a67'::uuid, '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '479855a1-6ceb-5e78-8269-7eb021615a67'::uuid AND contact_topics_id = '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('0574fbdc-9e7f-5ca6-9052-7f1b6544ed7c', 'published', 'Companies starting with: Fx-Mara', 'Indian Accounts Receivable', true, 'F, G, H, I, J, K, L, M', 'Companies starting with: Fx-Mara', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('c7299c8f-7f3b-5569-be60-b03e9a2d1028', '0574fbdc-9e7f-5ca6-9052-7f1b6544ed7c', 'Sabrina Tran', 'Primary Contact', 'indian', 'sabrina.tran@onrr.gov', '303-231-3541', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('b251698d-21c1-50d4-a807-91033439e8f8', '0574fbdc-9e7f-5ca6-9052-7f1b6544ed7c', 'Ashley Lacoste', 'Backup Contact', 'backup', 'ashley.lacoste@onrr.gov', '303-231-3869', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('82062adf-9b37-54f0-a34a-44d369943f3f', '0574fbdc-9e7f-5ca6-9052-7f1b6544ed7c', 'Chris Davis', 'Supervisor', 'supervisor', 'christopher.davis@onrr.gov', '303-231-3977', NULL, false, 3, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '0574fbdc-9e7f-5ca6-9052-7f1b6544ed7c'::uuid, '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '0574fbdc-9e7f-5ca6-9052-7f1b6544ed7c'::uuid AND contact_topics_id = '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('5e02c546-74b0-51d3-9a04-9c805e2f40de', 'published', 'Companies starting with: Marb-Pip', 'Indian Accounts Receivable', true, 'M, N, O, P', 'Companies starting with: Marb-Pip', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('4f2b6013-a0c2-5d0c-8c3f-590c25cef73c', '5e02c546-74b0-51d3-9a04-9c805e2f40de', 'John Ellis, Jr.', 'Primary Contact', 'indian', 'john.ellis@onrr.gov', '303-231-3307', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('fd48dd74-46e1-5b1e-be66-36d65944c591', '5e02c546-74b0-51d3-9a04-9c805e2f40de', 'RonKisha McCree', 'Backup Contact', 'backup', 'ronkisha.mccree@onrr.gov', '303-231-3816', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('b047548f-bf82-5ba7-8aa0-56f03e3cd9dd', '5e02c546-74b0-51d3-9a04-9c805e2f40de', 'Chris Davis', 'Supervisor', 'supervisor', 'christopher.davis@onrr.gov', '303-231-3977', NULL, false, 3, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '5e02c546-74b0-51d3-9a04-9c805e2f40de'::uuid, '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '5e02c546-74b0-51d3-9a04-9c805e2f40de'::uuid AND contact_topics_id = '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('6e81a742-1451-5628-b86b-f02a17a392fe', 'published', 'Companies starting with: Piq-Sim', 'Indian Accounts Receivable', true, 'P, Q, R, S', 'Companies starting with: Piq-Sim', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('c660c89a-5d94-5939-b9fa-5fbbfa6ea9ff', '6e81a742-1451-5628-b86b-f02a17a392fe', 'Chris Davis', 'Primary Contact', 'indian', 'christopher.davis@onrr.gov', '303-231-3977', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('e8941338-63cf-5fc3-8466-f8df61f883b8', '6e81a742-1451-5628-b86b-f02a17a392fe', 'Sabrina Tran', 'Backup Contact', 'backup', 'sabrina.tran@onrr.gov', '303-231-3541', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('d22d6951-ca12-5f5b-8f21-29ca75aeb670', '6e81a742-1451-5628-b86b-f02a17a392fe', 'Chris Davis', 'Supervisor', 'supervisor', 'christopher.davis@onrr.gov', '303-231-3977', NULL, false, 3, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '6e81a742-1451-5628-b86b-f02a17a392fe'::uuid, '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '6e81a742-1451-5628-b86b-f02a17a392fe'::uuid AND contact_topics_id = '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('a0fe8546-ea4f-5a8b-a324-ca31e067f388', 'published', 'Companies starting with: Sin-Z', 'Indian Accounts Receivable', true, 'S, T, U, V, W, X, Y, Z', 'Companies starting with: Sin-Z', NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('8ed46c17-8609-5456-8924-cdaa76dc0cd7', 'a0fe8546-ea4f-5a8b-a324-ca31e067f388', 'Ashley Lacoste', 'Primary Contact', 'indian', 'ashley.lacoste@onrr.gov', '303-231-3869', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('ed923286-62a7-5359-8bd4-16ef0b8a2941', 'a0fe8546-ea4f-5a8b-a324-ca31e067f388', 'Marcus Johnson', 'Backup Contact', 'backup', 'marcus.johnson@onrr.gov', '303-231-3957', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('a4bb5029-ba91-5f9f-92e8-ac57e1d263e7', 'a0fe8546-ea4f-5a8b-a324-ca31e067f388', 'Chris Davis', 'Supervisor', 'supervisor', 'christopher.davis@onrr.gov', '303-231-3977', NULL, false, 3, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT 'a0fe8546-ea4f-5a8b-a324-ca31e067f388'::uuid, '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = 'a0fe8546-ea4f-5a8b-a324-ca31e067f388'::uuid AND contact_topics_id = '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid);

INSERT INTO contacts (id, status, header, section, company_yn, letter, company_name, operator_number, agency, date_created) VALUES
  ('1391abe6-9384-54d5-89e0-d95929e20155', 'published', 'Solid Minerals', 'Indian Accounts Receivable', false, NULL, NULL, NULL, NULL, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('23ebdc29-e144-5c24-98e3-e03989189c44', '1391abe6-9384-54d5-89e0-d95929e20155', 'Chris Davis', 'Primary Contact', 'indian', 'christopher.davis@onrr.gov', '303-231-3977', NULL, true, 1, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('d2856cc3-026e-5fd9-96d4-642372dcc190', '1391abe6-9384-54d5-89e0-d95929e20155', 'Sabrina Tran', 'Backup Contact', 'backup', 'sabrina.tran@onrr.gov', '303-231-3541', NULL, false, 2, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_person (id, contacts_id, name, role, role_type, email, phone, fax, is_primary, sort, date_created) VALUES
  ('8c48c491-f22c-5240-91e2-73285eb994e7', '1391abe6-9384-54d5-89e0-d95929e20155', 'Chris Davis', 'Supervisor', 'supervisor', 'christopher.davis@onrr.gov', '303-231-3977', NULL, false, 3, now())
  ON CONFLICT (id) DO NOTHING;
INSERT INTO contacts_contact_topics (contacts_id, contact_topics_id, sort)
  SELECT '1391abe6-9384-54d5-89e0-d95929e20155'::uuid, '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid, 1
  WHERE NOT EXISTS (SELECT 1 FROM contacts_contact_topics WHERE contacts_id = '1391abe6-9384-54d5-89e0-d95929e20155'::uuid AND contact_topics_id = '0f9379f5-79a8-49d2-972f-1241ecb105cb'::uuid);

-- Verification (expect: federal +12, indian +7, debt +7; people +58 total)
SELECT ct.slug, count(DISTINCT c.id) AS contacts, count(p.id) AS people
  FROM contact_topics ct
  JOIN contacts_contact_topics j ON j.contact_topics_id = ct.id
  JOIN contacts c ON c.id = j.contacts_id AND c.status='published'
  LEFT JOIN contacts_person p ON p.contacts_id = c.id
  WHERE ct.slug IN ('federal-accounts-receivable-contacts','indian-accounts-receivable-contacts','debt-collection-contacts')
  GROUP BY ct.slug ORDER BY ct.slug;

COMMIT;
