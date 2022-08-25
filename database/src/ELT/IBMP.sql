CREATE SEQUENCE ibmp_sequence
  start 1
  increment 1;

\copy ibmp (status,sort,user_created,date_created,user_updated,date_updated,date,spreadsheet,ibmp_line_items) FROM './static/csv/ibmp.csv' WITH DELIMITER ',' CSV HEADER;

\echo 'Insert into ibmp'
INSERT INTO ibmp 
  (id,status,sort,user_created,date_created,user_updated,date_updated,date,spreadsheet,ibmp_line_items)
VALUES 
  (nextval('ibmp_sequence'),status,sort,user_created,date_created,user_updated,date_updated,date,spreadsheet,ibmp_line_items);

select * from ibmp;