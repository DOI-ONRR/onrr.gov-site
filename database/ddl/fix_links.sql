delete from links;

 alter table links add column title varchar(255);
 alter table links add column page_id integer;
 alter table links add column page varchar(255);
 alter table links add column keywords text;   
 alter table links add column directus_files_id uuid;


select 'published', null, null, now(), null, null, url, 'internal', null, null, url, slug,

delete from links;
delete  from directus_files df where id in (select df.id from directus_files df join  pages_files pf on (pf.directus_files_id = df.id));
delete  from pages_files pf where pages_id is null;
delete  from pages_files pf ;

update links set url=replace(url, 'assets', 'document'),  directus_files_id=substring(url, 9,36)::uuid  where url like '/assets%'
update links set url=concat(substring(url, 1, 10), target)  where url like '/document%';

insert into links ( status, sort, user_created, date_created, user_updated, date_updated,href,type,rel,target,url,label,category,title,page_id,page, keywords) 
 select 'published' as status, null as sort, null as user_created, now() as date_created, null as user_updated, now() as date_updated, url as href, 'applications/internal' as type, null as rel, null as target, url, title as label, 'Pages' as category, title, id as page_id, title as page, title as keywords from pages



update pages set slug = concat(slug,' ',now())   where status = 'archived'

create unique index on pages (slug);
