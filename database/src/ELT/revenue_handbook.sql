CREATE SEQUENCE revenue_handbook_sequence
  start 1
  increment 1;

\copy revenue_handbook (status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url) FROM './static/csv/revenue_handbook.csv' WITH DELIMITER ',' CSV HEADER;

\echo 'Insert into revenue_handbook'
INSERT INTO revenue_handbook 
  (id,status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url)
VALUES 
  (nextval('revenue_handbook_sequence'),status,sort,user_created,date_created,user_updated,date_updated,chapter,section,title,actual_page,toc_page,url);

select * from revenue_handbook;