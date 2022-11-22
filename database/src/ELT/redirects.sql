CREATE SEQUENCE redirects_sequence
  start 1
  increment 1;

\copy redirects (status,user_created,date_created,user_updated,date_updated,old_url,new_url) FROM './static/csv/redirects.csv' WITH  DELIMITER ',' CSV HEADER;

\echo 'Insert into redirects'
INSERT INTO redirects
  (id,status,user_created,date_created,user_updated,date_updated,old_url,new_url)
VALUES
  (nextval('redirects_sequence'),status,user_created,date_created,user_updated,date_updated,old_url,new_url);

select * from redirects;
