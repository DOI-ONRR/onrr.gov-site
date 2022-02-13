

drop function function_directus_files_upsert() CASCADE;
create function function_directus_files_upsert() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
BEGIN

insert into links(url, label, category,status, date_created) values (concat('/assets/',NEW.filename_disk), NEW.filename_download, 'Documents', 'published',now() ); 
RETURN NEW;
END;
$$

;



CREATE TRIGGER trigger_page_links AFTER INSERT OR UPDATE ON DIRECTUS_FILES
FOR EACH ROW
EXECUTE PROCEDURE  function_directus_files_upsert() 
;



