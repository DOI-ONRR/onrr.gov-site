CREATE SEQUENCE press_releases_sequence
  start 1
  increment 1;

\copy press_releases (status,sort,user_created,date_created,user_updated,date_updated,title,date,file,link,excerpt) FROM './static/csv/onrr_press_releases.csv' WITH  DELIMITER ',' CSV HEADER;

\echo 'Insert into press_releases'
INSERT INTO press_releases 
  (id,status,sort,user_created,date_created,user_updated,date_updated,title,date,file,link,excerpt)
VALUES 
  (nextval('press_releases_sequence')status,sort,user_created,date_created,user_updated,date_updated,title,date,file,link,excerpt);

select * from press_releases;
