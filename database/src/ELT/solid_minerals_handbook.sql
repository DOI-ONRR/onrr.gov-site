CREATE SEQUENCE solid_minerals_handbook_sequence
  start 1
  increment 1;

\copy solid_minerals_handbook (status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url) FROM './static/csv/solid_minerals_handbook.csv' WITH DELIMITER ',' CSV HEADER;

\echo 'Insert into solid_minerals_handbook'
INSERT INTO solid_minerals_handbook 
  (id,status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url)
VALUES 
  (nextval('solid_minerals_handbook_sequence'),status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url);

select * from solid_minerals_handbook;