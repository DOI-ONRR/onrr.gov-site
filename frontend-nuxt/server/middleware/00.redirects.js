// Nitro middleware: enforce the Directus `redirects` collection as real HTTP 301s before any
// page renders. See server/utils/redirects.js for the matching rules and rationale.
//
// The collection is read once and cached in-process (REDIRECT_TTL_MS). The index is small
// (a couple of Maps of strings) and the data changes rarely, so a short TTL keeps the CMS load
// negligible while picking up edits within minutes. A fetch failure keeps the last good index
// (or an empty one on first load) so a CMS blip can never 500 the whole site.

import {
  buildRedirectIndex,
  resolveRedirect,
  buildLocation,
  normalizePath,
  isSkippablePath,
} from '../utils/redirects'

const REDIRECT_TTL_MS = 5 * 60 * 1000

// Module-scoped cache shared across requests in this worker.
let cache = { index: null, loadedAt: 0 }
let inFlight = null

async function loadIndex(event) {
  const now = Date.now()
  if (cache.index && now - cache.loadedAt < REDIRECT_TTL_MS) return cache.index
  if (inFlight) return inFlight

  const { apiUrl } = useRuntimeConfig(event).public
  inFlight = (async () => {
    try {
      const res = await $fetch(`${apiUrl}/items/redirects`, {
        params: {
          fields: 'old_url,new_url,status',
          'filter[status][_eq]': 'published',
          limit: -1,
        },
      })
      const rows = res?.data ?? []
      const index = buildRedirectIndex(rows)
      cache = { index, loadedAt: Date.now() }
      if (index.conflicts.length) {
        console.warn(`[redirects] loaded ${index.exact.size} paths; ${index.conflicts.length} duplicate old_url(s) ignored (first row wins)`)
      }
      return index
    } catch (err) {
      console.error('[redirects] failed to load from CMS:', err?.message || err)
      // Fall back to the last good index, or an empty one so matching is simply a no-op.
      return cache.index || buildRedirectIndex([])
    } finally {
      inFlight = null
    }
  })()
  return inFlight
}

export default defineEventHandler(async (event) => {
  const method = event.method
  if (method !== 'GET' && method !== 'HEAD') return

  const url = getRequestURL(event)
  let pathname
  try {
    pathname = decodeURI(url.pathname)
  } catch {
    pathname = url.pathname
  }
  if (isSkippablePath(pathname)) return

  const index = await loadIndex(event)
  const target = resolveRedirect(index, pathname)
  if (!target) return

  // Guard against redirecting a path onto itself (query-only differences included).
  const location = buildLocation(target, url.search)
  const targetIsAbsolute = /^https?:\/\//i.test(target)
  if (!targetIsAbsolute && normalizePath(target) === normalizePath(pathname)) return

  // 301 Moved Permanently: these are deliberate content moves, best for SEO link equity and
  // crawler reindexing. GET/HEAD only (filtered above), so method-preservation (308) is moot.
  await sendRedirect(event, location, 301)
})
