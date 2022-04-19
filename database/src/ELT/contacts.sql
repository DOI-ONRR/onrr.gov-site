CREATE SEQUENCE contacts_sequence
  start 1
  increment 1;

\copy contacts (status,sort,user_created,date_created,user_updated,date_updated,page,tab,accordion,company_yn,letter,header,company_name,operator_number,agency,primary_contact,primary_role,email,phone,fax,contact_2,role_2,email_2,phone_2,contact_3,role_3,email_3,phone_3,contact_4,role_4,email_4,phone_4,contact_5,role_5,email_5,phone_5,contact_6,role_6,email_6,phone_6) FROM './static/csv/contacts.csv' WITH DELIMITER ',' CSV HEADER;

\echo 'Insert into contacts'
INSERT INTO contacts 
  (id,status,sort,user_created,date_created,user_updated,date_updated,page,tab,accordion,company_yn,letter,header,company_name,operator_number,agency,primary_contact,primary_role,email,phone,fax,contact_2,role_2,email_2,phone_2,contact_3,role_3,email_3,phone_3,contact_4,role_4,email_4,phone_4,contact_5,role_5,email_5,phone_5,contact_6,role_6,email_6,phone_6)
VALUES 
  (nextval('contacts_sequence'),status,sort,user_created,date_created,user_updated,date_updated,page,tab,accordion,company_yn,letter,header,company_name,operator_number,agency,primary_contact,primary_role,email,phone,fax,contact_2,role_2,email_2,phone_2,contact_3,role_3,email_3,phone_3,contact_4,role_4,email_4,phone_4,contact_5,role_5,email_5,phone_5,contact_6,role_6,email_6,phone_6);

select * from contacts;