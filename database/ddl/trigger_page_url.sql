drop function function_page_url_update CASCADE;
create function function_page_url_update()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
        parent_url  text;
        clean_slug  text;
BEGIN
-- Normalize the slug: strip any leading/trailing slashes the editor may have typed
-- so a value like '/how-revenue-works' or 'how-revenue-works/' can't inject a stray slash.
clean_slug := trim(both '/' from coalesce(NEW.slug, ''));
select url into parent_url from pages where id=NEW.parent;
IF parent_url IS NOT NULL AND parent_url != '/' THEN
 NEW.url = concat(parent_url,'/', clean_slug);
ELSE
 NEW.url = concat('/', clean_slug);
END IF;
-- Collapse any duplicate slashes (e.g. a parent url that itself ends in '/') and drop a
-- trailing slash, but never shrink the home page's url below '/'.
NEW.url = regexp_replace(NEW.url, '/+', '/', 'g');
IF length(NEW.url) > 1 THEN
 NEW.url = rtrim(NEW.url, '/');
END IF;
RETURN NEW;
END;
$$
;



CREATE TRIGGER trigger_pages_url BEFORE INSERT OR UPDATE ON PAGES
FOR EACH ROW
EXECUTE PROCEDURE  function_page_url_update()
;
