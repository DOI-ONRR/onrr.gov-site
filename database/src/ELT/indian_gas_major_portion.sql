CREATE SEQUENCE indian_gas_major_portion_sequence
  start 1
  increment 1;

\copy indian_gas_major_portion (status,sort,user_created,date_created,user_updated,date_updated,spreadsheet,date,index_zones) FROM './static/csv/indian_gas_major_portion.csv' WITH DELIMITER ',' CSV HEADER;

\echo 'Insert into indian_gas_major_portion'
INSERT INTO indian_gas_major_portion 
  (id,status,sort,user_created,date_created,user_updated,date_updated,spreadsheet,date,index_zones)
VALUES 
  (nextval('indian_gas_major_portion_sequence'),status,sort,user_created,date_created,user_updated,date_updated,spreadsheet,date,index_zones);

select * from indian_gas_major_portion;