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
