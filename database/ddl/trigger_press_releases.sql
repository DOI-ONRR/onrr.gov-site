drop function function_press_releases_insert() CASCADE;

create function function_press_releases_insert()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
DECLARE

existing_url varchar(255);
BEGIN
insert into links ( type, target, url, label, category, title, directus_files_id)  select   'application/press-releases' as type,   filename_download as target,  concat('/press-releases/', filename_download) as url,  press_releases.title as label, 'Reporter Letters' as category, press_releases.title as title, press_releases.file as directus_files_id  from directus_files where directus_files.id=NEW.file;

RETURN NEW;
END;
$$
;


CREATE TRIGGER trigger_press_releases_insert AFTER INSERT ON press_releases
FOR EACH ROW
EXECUTE PROCEDURE  function_press_releases_insert() 
;
