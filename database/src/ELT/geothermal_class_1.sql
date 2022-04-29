CREATE SEQUENCE geothermal_class_1_sequence
  start 1
  increment 1;

\copy geothermal_class_1 (status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url) FROM './static/csv/geothermal_class_1.csv' WITH DELIMITER ',' CSV HEADER;

\echo 'Insert into geothermal_class_1'
INSERT INTO geothermal_class_1 
  (id,status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url)
VALUES 
  (nextval('geothermal_class_1_sequence'),status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url);

select * from geothermal_class_1;