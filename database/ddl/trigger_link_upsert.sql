drop function function_page_link_upsert CASCADE;
create function function_page_link_upsert() 
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$ 
BEGIN
IF NEW.status = 'published' and length(NEW.url) > 0 THEN


insert into links ( status, sort, user_created, date_created, user_updated, date_updated,href,type,rel,target,url,label,category,title,page_id, keywords) values ('published', null, null, now(), null, now(), NEW.url, 'application/internal', null, null, NEW.url, NEW.title, 'Pages', NEW.title, NEW.id, NEW.title);

-- insert into links(url, label, category,status, date_created) values (NEW.url, NEW.title, 'Pages', 'published',now() ); 
END IF;
RETURN NEW;
END;
$$
;



CREATE TRIGGER trigger_page_links AFTER INSERT OR UPDATE ON PAGES
FOR EACH ROW
EXECUTE PROCEDURE  function_page_link_upsert()
;

