drop function function_reporter_letters_insert() CASCADE;

create function function_reporter_letters_insert()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
DECLARE
existing_url varchar(255);
BEGIN

insert into links ( type, target, url, label, category, title, directus_files_id)  select   'application/reporter-letters' as type,   filename_download as target,  concat('/reporter-letters/', filename_download) as url,  NEW.title as label, 'Reporter Letters' as category, NEW.title as title, NEW.file as directus_files_id  from directus_files where directus_files.id=NEW.file;
RETURN NEW;
END;
$$
;


CREATE TRIGGER trigger_reporter_letters_insert AFTER INSERT ON reporter_letters
FOR EACH ROW
EXECUTE PROCEDURE  function_reporter_letters_insert() 
;


