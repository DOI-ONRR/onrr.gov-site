CREATE OR REPLACE FUNCTION function_directus_files_upsert() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  existing_url VARCHAR(255);
  related_page_id pages_files.pages_id%TYPE;
  related_page VARCHAR(255);
BEGIN
  SELECT url 
  INTO existing_url 
  FROM links 
  WHERE url = CONCAT('/document/', NEW.filename_download);
  
  SELECT pages_id 
  INTO related_page_id 
  FROM pages_files 
  WHERE directus_files_id = NEW.id;
  
  SELECT title 
  INTO related_page 
  FROM pages 
  WHERE id = related_page_id;

  IF ((NEW.filename_disk IS NOT NULL OR NEW.filename_disk != '') AND existing_url IS NULL) THEN
    INSERT INTO links(url, label, target, type, title, page_id, page, category, status, date_created, directus_files_id)
    VALUES (CONCAT('/document/', NEW.filename_download), NEW.title, NEW.filename_download, NEW.type, NEW.title, related_page_id, related_page, 'Documents', 'published', NOW(), NEW.id);
  ELSIF existing_url IS NOT NULL THEN
    UPDATE links
    SET label = NEW.title,
        target = NEW.filename_download,
        type = NEW.type,
        title = NEW.title
    WHERE url = existing_url;
  END IF;

  RETURN NEW;
END;
$$;


CREATE OR REPLACE TRIGGER trigger_directus_files_links
AFTER UPDATE ON DIRECTUS_FILES
FOR EACH ROW
EXECUTE PROCEDURE function_directus_files_upsert();


DROP FUNCTION function_pages_files_insert() CASCADE;

CREATE FUNCTION function_pages_files_insert() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  existing_url VARCHAR(255);
BEGIN
  SELECT url INTO existing_url FROM links JOIN directus_files USING(title) WHERE directus_files.id = NEW.directus_files_id;
  UPDATE links SET page_id = NEW.pages_id WHERE url = existing_url;

  RETURN NEW;
END;
$$;


CREATE TRIGGER trigger_pages_files_after_insert
AFTER INSERT ON PAGES_FILES
FOR EACH ROW
EXECUTE PROCEDURE function_pages_files_insert();


DROP FUNCTION function_pages_files_update() CASCADE;

CREATE FUNCTION function_pages_files_update() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  existing_url VARCHAR(255);
BEGIN
  IF (NEW.pages_id IS NULL) THEN
    RAISE NOTICE 'NEW is currently %', NEW.directus_files_id;
    DELETE FROM links WHERE directus_files_id = NEW.directus_files_id;
    DELETE FROM directus_files WHERE id = NEW.directus_files_id;
  END IF;

  RETURN NEW;
END;
$$;


CREATE TRIGGER trigger_pages_files_after_update
AFTER UPDATE ON PAGES_FILES
FOR EACH ROW
EXECUTE PROCEDURE function_pages_files_update();


DROP FUNCTION function_pages_files_delete() CASCADE;

CREATE FUNCTION function_pages_files_delete() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  existing_url VARCHAR(255);
BEGIN
  RAISE NOTICE 'OLD is currently %', OLD.directus_files_id;

  DELETE FROM links WHERE directus_files_id = OLD.directus_files_id;
  DELETE FROM directus_files WHERE id = OLD.directus_files_id;

  RETURN NULL;
END;
$$;


CREATE TRIGGER trigger_pages_files_delete
AFTER DELETE ON PAGES_FILES
FOR EACH ROW
EXECUTE PROCEDURE function_pages_files_delete();


DROP FUNCTION function_directus_files_delete() CASCADE;

CREATE FUNCTION function_directus_files_delete() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
  existing_url VARCHAR(255);
BEGIN
  RAISE NOTICE 'OLD is currently %', OLD.id;

  DELETE FROM links WHERE directus_files_id = OLD.id;

  RETURN NULL;
END;
$$;


CREATE TRIGGER trigger_directus_files_delete
AFTER DELETE ON DIRECTUS_FILES
FOR EACH ROW
EXECUTE PROCEDURE function_directus_files_delete();
