CREATE SEQUENCE production_handbook_sequence
  start 1
  increment 1;

\copy production_handbook (status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url) FROM './static/csv/production_handbook.csv' WITH DELIMITER ',' CSV HEADER;

\echo 'Insert into production_handbook'
INSERT INTO production_handbook 
  (id,status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url)
VALUES 
  (nextval('production_handbook_sequence'),status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url);

select * from production_handbook;