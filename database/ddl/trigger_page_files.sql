

drop function function_directus_files_upsert() CASCADE;
create function function_directus_files_upsert() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
DECLARE

existing_url varchar(255);
related_page_id integer;
related_page varchar(255);

BEGIN
select url into existing_url from links where url=concat('/document/',NEW.filename_download);
select pages_id into related_page_id from pages_files where directus_files_id=NEW.id;
select title into related_page from pages where id=related_page_id;

IF ((NEW.filename_disk != null or NEW.filename_disk != '') and  existing_url is null) THEN
insert into links(url, label, target, type, title,  page_id, page,  category,status, date_created, directus_files_id) values (concat('/document/',NEW.filename_download),NEW.title, NEW.filename_download, NEW.type, NEW.title, related_page_id, related_page, 'Documents', 'published',now(), NEW.id );
ELSIF existing_url is not null THEN
update links set label=NEW.title, target=NEW.filename_download, type=NEW.type, title=NEW.title where url=existing_url;
ELSE 
END IF;
RETURN NEW;
END;
$$
;


CREATE TRIGGER trigger_directus_files_links AFTER UPDATE ON DIRECTUS_FILES
FOR EACH ROW
EXECUTE PROCEDURE  function_directus_files_upsert() 
;



drop function function_pages_files_insert() CASCADE;
create function function_pages_files_insert() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
DECLARE

existing_url varchar(255);
related_page_id integer;

BEGIN

select url into existing_url from links join directus_files using(title) where directus_files.id=NEW.directus_files_id;
update links set  page_id=NEW.pages_id where url=existing_url;
RETURN NEW;
END;
$$
;


CREATE TRIGGER trigger_pages_files_after_insert AFTER INSERT  ON PAGES_FILES
FOR EACH ROW
EXECUTE PROCEDURE  function_pages_files_insert() 
;

drop function function_pages_files_update() CASCADE;
create function function_pages_files_update() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
DECLARE

existing_url varchar(255);
related_page_id integer;

BEGIN
IF (NEW.pages_id is NULL) THEN
RAISE NOTICE 'NEW is currently %', NEW.directus_files_id;
delete from  links where directus_files_id=NEW.directus_files_id;
delete from directus_files where id = NEW.directus_files_id;
END IF;
RETURN NEW;
END;

$$
;


CREATE TRIGGER trigger_pages_files_after_update AFTER UPDATE  ON PAGES_FILES
FOR EACH ROW
EXECUTE PROCEDURE  function_pages_files_update() 
;

;



drop function function_pages_files_delete() CASCADE;
create function function_pages_files_delete() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
DECLARE

existing_url varchar(255);
related_page_id integer;

BEGIN
RAISE NOTICE 'OLD is currently %', OLD.directus_files_id;

delete from  links where directus_files_id=OLD.directus_files_id;
delete from directus_files where id = OLD.directus_files_id;
RETURN NULL;
END;
$$
;


CREATE TRIGGER trigger_pages_files_delete AFTER DELETE  ON PAGES_FILES
FOR EACH ROW
EXECUTE PROCEDURE  function_pages_files_delete() 
;

 drop function function_directus_files_delete() CASCADE;
create function function_directus_files_delete() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
DECLARE

existing_url varchar(255);
related_page_id integer;

BEGIN
RAISE NOTICE 'OLD is currently %', OLD.id;

delete from  links where directus_files_id=OLD.id;
RETURN NULL;
END;
$$
;


CREATE TRIGGER trigger_directus_files_delete AFTER DELETE  ON DIRECTUS_FILES
FOR EACH ROW
EXECUTE PROCEDURE  function_directus_files_delete() 
;
