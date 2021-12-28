CREATE SEQUENCE reporter_letters_sequence
  start 1
  increment 1;

\copy reporter_letters (status,sort,user_created,date_created,user_updated,date_updated,title,date,file,link,accessible_file) FROM './static/csv/reporter_letters.csv' WITH  DELIMITER ',' CSV HEADER;

\echo 'Insert into reporter_letters'
INSERT INTO reporter_letters 
  (id,status,sort,user_created,date_created,user_updated,date_updated,title,date,file,link,accessible_file)
VALUES 
  (nextval('reporter_letters_sequence'),status,sort,user_created,date_created,user_updated,date_updated,title,date,file,link,accessible_file);

select * from reporter_letters;