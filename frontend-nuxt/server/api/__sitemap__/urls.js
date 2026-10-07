// Sitemap URL source for @nuxtjs/sitemap: the published CMS pages.
//
// Returns one entry per page from Directus. The public read policy restricts /items/pages
// to published rows and allow-listed fields (the same policy the GraphQL page queries rely
// on), so a plain `fields=url` read yields exactly the public, indexable URL set — no
// status filter needed here, matching how the app itself resolves pages. `url` is the
// precomputed path Directus stores for each page (e.g. /revenue-data/monthly-disbursements).
//
// The module merges these with the static file-based routes it auto-discovers and dedupes.
// On any CMS error we return an empty list so /sitemap.xml still renders (with just the
// static routes) rather than 500-ing.
export default defineEventHandler(async (event) => {
  const { apiUrl } = useRuntimeConfig(event).public

  try {
    const res = await $fetch(`${apiUrl}/items/pages`, {
      params: { fields: 'url', limit: -1 },
    })

    const paths = (res?.data ?? [])
      .map((p) => p?.url)
      // Only root-relative paths; the module resolves them against `site.url`.
      .filter((u) => typeof u === 'string' && u.startsWith('/'))

    // Home ('/') is served by index.vue and may not be a CMS page url; ensure it's present.
    // Dedupe so a CMS page that mirrors a static route isn't listed twice.
    const locs = [...new Set(['/', ...paths])]

    return locs.map((loc) => ({ loc }))
  } catch (err) {
    console.error('[sitemap] failed to load CMS page URLs:', err?.message || err)
    return []
  }
})
