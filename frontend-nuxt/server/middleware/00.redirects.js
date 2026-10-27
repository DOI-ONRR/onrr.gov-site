// Nitro middleware: enforce the Directus `redirects` collection as real HTTP 301s before any
// page renders. See server/utils/redirects.js for the matching rules and rationale.
//
// The collection is read into an in-process index and reused. Freshness and availability are
// handled so the redirect lookup can NEVER stall a page:
//   - Fresh cache (< REDIRECT_TTL_MS): used directly, no network.
//   - Stale cache: served immediately while a single background refresh runs (stale-while-
//     revalidate) — requests never wait on the CMS once any index exists.
//   - Cold start (no index yet): the request waits for the first load, but only up to
//     COLD_WAIT_MS; past that it proceeds fail-open (no redirect) and the load finishes in the
//     background to serve the next request.
//   - The CMS call itself is bounded by FETCH_TIMEOUT_MS, and any failure keeps the last good
//     index (or an empty one) and retries sooner (RETRY_MS) instead of after the full TTL.
// Net effect: a slow or down CMS costs at most COLD_WAIT_MS on the very first request and
// nothing thereafter, and can never 500 the site.

import {
  buildRedirectIndex,
  resolveRedirect,
  buildLocation,
  normalizePath,
  isSkippablePath,
} from '../utils/redirects'

const REDIRECT_TTL_MS = 5 * 60 * 1000 // how long a loaded index is considered fresh
const RETRY_MS = 30 * 1000 // after a failed load, retry this soon rather than after the full TTL
const FETCH_TIMEOUT_MS = 4000 // hard bound on the CMS request
const COLD_WAIT_MS = 2000 // max a cold first request will block before proceeding fail-open

// Module-scoped cache shared across requests in this worker. `index` is null only before the
// first load attempt; after that it is always a usable (possibly empty) index.
let cache = { index: null, loadedAt: 0 }
let inFlight = null

// Load the redirect index from the CMS and replace the cache. Deduped via `inFlight` so
// concurrent/stale requests share one network call. Never throws: on error it keeps the last
// good index (or an empty one) and backdates `loadedAt` so the next attempt happens in RETRY_MS.
function refresh(event) {
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
        timeout: FETCH_TIMEOUT_MS,
      })
      const index = buildRedirectIndex(res?.data ?? [])
      cache = { index, loadedAt: Date.now() }
      if (index.conflicts.length) {
        console.warn(`[redirects] loaded ${index.exact.size} paths; ${index.conflicts.length} duplicate old_url(s) ignored (first row wins)`)
      }
      return index
    } catch (err) {
      console.error('[redirects] failed to load from CMS:', err?.message || err)
      // Keep what we had (or an empty index). Backdate loadedAt so this stale/empty index is
      // treated as fresh for only RETRY_MS, then a new attempt runs — avoids hammering a down
      // CMS on every request while still recovering quickly once it returns.
      const kept = cache.index || buildRedirectIndex([])
      cache = { index: kept, loadedAt: Date.now() - (REDIRECT_TTL_MS - RETRY_MS) }
      return kept
    } finally {
      inFlight = null
    }
  })()
  return inFlight
}

async function loadIndex(event) {
  const age = Date.now() - cache.loadedAt
  // Fresh (or within the post-failure retry backoff window): use it, no network.
  if (cache.index && age < REDIRECT_TTL_MS) return cache.index
  // Stale but usable: refresh in the background, serve the current index immediately.
  if (cache.index) {
    refresh(event) // fire-and-forget (deduped)
    return cache.index
  }
  // Truly cold (first request since boot): wait for the load, but never longer than COLD_WAIT_MS.
  return Promise.race([
    refresh(event),
    new Promise((resolve) => setTimeout(() => resolve(buildRedirectIndex([])), COLD_WAIT_MS)),
  ])
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
