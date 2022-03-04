drop function function_page_url_update CASCADE;
create function function_page_url_update() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
        parent_url  text;
BEGIN
select url into parent_url from pages where id=NEW.parent;
IF parent_url != '/' THEN
 NEW.url = concat(parent_url,'/', NEW.slug);
ELSE
 NEW.url = concat('/', NEW.slug);
END IF;
RETURN NEW;
END;
$$
;



CREATE TRIGGER trigger_pages_url BEFORE INSERT OR UPDATE ON PAGES
FOR EACH ROW
EXECUTE PROCEDURE  function_page_url_update()
;
