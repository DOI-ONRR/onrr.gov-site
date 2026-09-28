/**
 * Harden the pages.url trigger against stray/duplicate slashes.
 *
 * `function_page_url_update()` (see database/ddl/trigger_page_url.sql) builds pages.url as
 * `concat(parent_url, '/', slug)`. It blindly inserted the separator, so a slug with a
 * leading slash — or a parent whose own url ended in '/' — produced doubled slashes like
 * `/revenue-data//how-revenue-works`. This replaces the function body to:
 *   - trim leading/trailing slashes off the slug,
 *   - collapse any run of slashes to one,
 *   - drop a trailing slash (but keep the home page at '/').
 *
 * The trigger only recomputes url on save, so existing rows keep their current url until
 * re-saved; this migration intentionally does not backfill.
 *
 * CREATE OR REPLACE for both objects so it applies whether or not the DDL was previously
 * loaded on the target environment (PG14+ supports CREATE OR REPLACE TRIGGER; we run 16).
 */
const HARDENED_FN = `
CREATE OR REPLACE FUNCTION function_page_url_update()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
DECLARE
        parent_url  text;
        clean_slug  text;
BEGIN
clean_slug := trim(both '/' from coalesce(NEW.slug, ''));
select url into parent_url from pages where id=NEW.parent;
IF parent_url IS NOT NULL AND parent_url != '/' THEN
 NEW.url = concat(parent_url,'/', clean_slug);
ELSE
 NEW.url = concat('/', clean_slug);
END IF;
NEW.url = regexp_replace(NEW.url, '/+', '/', 'g');
IF length(NEW.url) > 1 THEN
 NEW.url = rtrim(NEW.url, '/');
END IF;
RETURN NEW;
END;
$$;
`;

// Original (pre-hardening) body, for down().
const ORIGINAL_FN = `
CREATE OR REPLACE FUNCTION function_page_url_update()
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
$$;
`;

const TRIGGER = `
CREATE OR REPLACE TRIGGER trigger_pages_url
BEFORE INSERT OR UPDATE ON pages
FOR EACH ROW
EXECUTE PROCEDURE function_page_url_update();
`;

module.exports = {
  async up(knex) {
    await knex.raw(HARDENED_FN);
    await knex.raw(TRIGGER);
  },

  async down(knex) {
    await knex.raw(ORIGINAL_FN);
    await knex.raw(TRIGGER);
  },
};
