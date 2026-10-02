import { HTML_INTERFACES, sanitizePayload } from './sanitize-fields.js'

// Server-side HTML sanitizing for CMS content. The rich-text editor filters
// markup in the browser, but anyone with write access can bypass it by calling
// the API directly; this hook cleans rich-text (HTML) fields on every item
// create/update, whatever the source (Data Studio, REST, GraphQL,
// imports, flows, content-version promotion).

// Which fields hold HTML is read from directus_fields (by interface) and
// cached. Field changes on this instance clear the cache immediately; the TTL
// covers changes made on another instance (prod runs two).
const CACHE_TTL_MS = 60 * 1000

export default ({ filter, action }, { database, logger }) => {
  let cache = null

  async function fieldsFor(collection) {
    if (!cache || Date.now() - cache.loadedAt > CACHE_TTL_MS) {
      const rows = await database('directus_fields')
        .select('collection', 'field')
        .whereIn('interface', HTML_INTERFACES)

      const byCollection = new Map()
      for (const { collection: c, field } of rows) {
        if (!byCollection.has(c)) byCollection.set(c, new Set())
        byCollection.get(c).add(field)
      }
      cache = { loadedAt: Date.now(), byCollection }
    }
    return cache.byCollection.get(collection)
  }

  const clearCache = () => { cache = null }
  action('fields.create', clearCache)
  action('fields.update', clearCache)
  action('fields.delete', clearCache)

  const sanitizeItem = async (payload, meta, context) => {
    const fields = await fieldsFor(meta.collection)
    if (!fields) return payload

    const flagged = sanitizePayload(payload, fields)
    if (flagged.length > 0) {
      logger.warn(
        `[html-sanitizer] removed unsafe markup from ${meta.collection} ` +
        `(${flagged.join(', ')})` +
        (meta.keys ? ` keys=${JSON.stringify(meta.keys)}` : '') +
        ` user=${context?.accountability?.user ?? 'unknown'}`
      )
    }
    return payload
  }

  filter('items.create', sanitizeItem)
  filter('items.update', sanitizeItem)
}
