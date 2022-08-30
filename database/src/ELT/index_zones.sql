CREATE SEQUENCE index_zones_sequence
  start 1
  increment 1;

\copy index_zones (status,sort,user_created,date_created,user_updated,date_updated,spreadsheet,date,index_zones) FROM './static/csv/index_zones.csv' WITH DELIMITER ',' CSV HEADER;
2
\echo 'Insert into index_zones'
INSERT INTO index_zones 
  (id,status,sort,user_created,date_created,user_updated,date_updated,spreadsheet,date,index_zones)
VALUES 
  (nextval('index_zones_sequence'),status,sort,user_created,date_created,user_updated,date_updated,spreadsheet,date,index_zones);

select * from index_zones;