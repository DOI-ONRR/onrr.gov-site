drop function function_pages_update() CASCADE;
create function function_pages_update()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
DECLARE

archived_slug varchar(255);

BEGIN

IF (NEW.status = 'archived') THEN
select concat(NEW.slug,' ', now()) into archived_slug from pages where id=NEW.id;
NEW.slug=archived_slug;
END IF;
RETURN NEW;
END;
$$
;


CREATE TRIGGER trigger_pages_update BEFORE UPDATE ON PAGES
FOR EACH ROW
EXECUTE PROCEDURE  function_pages_update();
;

