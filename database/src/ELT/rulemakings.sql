CREATE SEQUENCE rulemakings_sequence
  start 1
  increment 1;

\copy rulemakings (status,sort,user_created,date_created,user_updated,date_updated,final_publication_date,rin,rule_title,informal_title,commodity_subject_matter,webpage_link) FROM './static/csv/rulemakings.csv' WITH DELIMITER ',' CSV HEADER;

\echo 'Insert into rulemakings'
INSERT INTO rulemakings 
  (id,status,sort,user_created,date_created,user_updated,date_updated,final_publication_date,rin,rule_title,informal_title,commodity_subject_matter,webpage_link)
VALUES 
  (nextval('rulemakings_sequence'),status,sort,user_created,date_created,user_updated,date_updated,final_publication_date,rin,rule_title,informal_title,commodity_subject_matter,webpage_link);

select * from rulemakings;