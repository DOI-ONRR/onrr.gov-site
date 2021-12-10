
\copy press_releases (id, status,sort,user_created,date_created,user_updated,date_updated,title,date,file,link,excerpt) FROM './static/csv/onrr_press_releases.csv' WITH  DELIMITER ',' CSV HEADER;

\echo 'Insert into press_releases'
insert into press_releases (id, status,sort,user_created,date_created,user_updated,date_updated,title,date,file,link,excerpt)
select * from press_releases;