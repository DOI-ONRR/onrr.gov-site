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
select NEW.url;
RETURN NEW;
END;
$$
;

drop function function_page_link_upsert CASCADE;
create function function_page_link_upsert() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
BEGIN
IF NEW.status = 'published' THEN
insert into links(url, label, category,status, date_created) values (NEW.url, NEW.title, 'Pages', 'published',now() ); 
END IF;
RETURN NEW;
END;
$$

;



CREATE TRIGGER trigger_page_links AFTER INSERT OR UPDATE ON PAGES
FOR EACH ROW
EXECUTE PROCEDURE  function_page_link_upsert()
;


CREATE TRIGGER trigger_pages_url BEFORE INSERT OR UPDATE ON PAGES
FOR EACH ROW
EXECUTE PROCEDURE  function_page_url_update()
;
