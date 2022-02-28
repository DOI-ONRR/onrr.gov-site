delete from links;

 alter table links add column title varchar(255);
 alter table links add column page_id integer;
 alter table links add column page varchar(255);
 alter table links add column keywords text;   


select 'published', null, null, now(), null, null, url, 'internal', null, null, url, slug,


insert into links ( status, sort, user_created, date_created, user_updated, date_updated,href,type,rel,target,url,label,category,title,page_id,page, keywords) 
 select 'published' as status, null as sort, null as user_created, now() as date_created, null as user_updated, now() as date_updated, url as href, 'internal' as type, null as rel, null as target, url, title as label, 'Pages' as category, title, id as page_id, title as page, title as keywords from pages
