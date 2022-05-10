CREATE SEQUENCE plant_specific_ucas_sequence
  start 1
  increment 1;

\copy plant_specific_ucas (status,sort,user_created,date_created,user_updated,date_updated,transportation_system_or_gas_plant,file,type,operator,location,doc_date) FROM './static/csv/plant_specific_ucas.csv' WITH DELIMITER ',' CSV HEADER;
2
\echo 'Insert into plant_specific_ucas'
INSERT INTO plant_specific_ucas 
  (id,status,sort,user_created,date_created,user_updated,date_updated,transportation_system_or_gas_plant,file,type,operator,location,doc_date)
VALUES 
  (nextval('plant_specific_ucas_sequence'),status,sort,user_created,date_created,user_updated,date_updated,transportation_system_or_gas_plant,file,type,operator,location,doc_date);

select * from plant_specific_ucas;