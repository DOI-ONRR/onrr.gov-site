// Server-side redirect resolution for the redesign go-live.
//
// Ports (and improves on) the legacy Vue2 client-side router guard
// (frontend/src/router/index.js): instead of a JS/meta-refresh after the SPA boots, Nitro
// issues a real HTTP 301 before any page renders — correct for SEO, no content flash, and it
// also covers deep links and crawlers that never ran the old client guard.
//
// Source of truth is the Directus `redirects` collection (public-readable: old_url, new_url,
// status). These helpers are pure so they can be unit-tested; the middleware
// (server/middleware/00.redirects.js) owns the fetch, the in-memory cache, and sendRedirect.
//
// Matching is two-tier, chosen from the real prod data (3,876 rows):
//   1. EXACT — case-sensitive, but tolerant of a trailing slash and any query/hash on the
//      stored old_url. This reproduces the legacy `old_url === path` semantics (first row wins
//      on duplicate old_urls, matching GraphQL array order) for the ~3,526 distinct paths.
//   2. CASE-INSENSITIVE fallback — consulted only when EXACT misses, so a link whose only
//      problem is letter-case still resolves. We do NOT fold case into a single index because
//      doing so would merge 471 path pairs whose case variants legitimately point at different
//      targets; the exact tier must win whenever an exact row exists.
//
// Unmatched paths are deliberately left alone (returned as no-match) so the app's normal page
// resolution / 404 still happens. The agreed "unmapped old URL -> /revenue-data" behavior is
// encoded as explicit rows in the collection, never as catch-all logic here, so this layer can
// never swallow a legitimate page request.

// Normalize a path for matching: strip query/hash, collapse a trailing slash (except root),
// guarantee a single leading slash. Case is preserved; the caller lowercases for the CI tier.
export function normalizePath(input) {
  if (typeof input !== 'string' || input === '') return '/'
  let p = input
  // Drop query string and fragment — the server never sees a fragment, and old_url rows that
  // carry one should still match on their path.
  const cut = p.search(/[?#]/)
  if (cut !== -1) p = p.slice(0, cut)
  // An absolute URL stored as old_url (one row does this) — reduce to its path.
  if (/^https?:\/\//i.test(p)) {
    try { p = new URL(p).pathname } catch { /* keep as-is */ }
  }
  if (!p.startsWith('/')) p = '/' + p
  // Collapse duplicate slashes and a single trailing slash, but keep root "/".
  p = p.replace(/\/{2,}/g, '/')
  if (p.length > 1) p = p.replace(/\/+$/, '')
  return p || '/'
}

// Build the two lookup indexes from raw collection rows. First row wins on collision within a
// tier (preserving legacy array-order semantics). Self-referential rows (old resolves to the
// same path as new) are dropped to prevent redirect loops. Returns { exact, ci, conflicts }.
export function buildRedirectIndex(rows) {
  const exact = new Map()
  const ci = new Map()
  const conflicts = []
  for (const row of rows || []) {
    const oldUrl = row && typeof row.old_url === 'string' ? row.old_url : null
    const newUrl = row && typeof row.new_url === 'string' ? row.new_url : null
    if (!oldUrl || !newUrl) continue

    const key = normalizePath(oldUrl)
    // Loop guard: if the destination's path equals the source path, this row is a no-op/loop.
    const destPath = normalizePath(newUrl)
    const destIsAbsolute = /^https?:\/\//i.test(newUrl)
    if (!destIsAbsolute && destPath === key) continue

    if (exact.has(key)) {
      if (exact.get(key) !== newUrl) conflicts.push({ key, kept: exact.get(key), ignored: newUrl })
    } else {
      exact.set(key, newUrl)
    }

    const ciKey = key.toLowerCase()
    if (!ci.has(ciKey)) ci.set(ciKey, newUrl)
  }
  return { exact, ci, conflicts }
}

// Resolve a request path against an index. Returns the raw new_url string, or null for no match.
export function resolveRedirect(index, pathname) {
  if (!index) return null
  const key = normalizePath(pathname)
  if (index.exact.has(key)) return index.exact.get(key)
  const ciKey = key.toLowerCase()
  if (index.ci.has(ciKey)) return index.ci.get(ciKey)
  return null
}

// Build the Location header value. If the stored new_url already carries its own query, use it
// verbatim; otherwise forward the incoming request's query string (e.g. ?location=WY on an
// explore link). Fragments are never seen server-side, so they can't be forwarded.
export function buildLocation(newUrl, incomingSearch) {
  if (typeof newUrl !== 'string' || newUrl === '') return newUrl
  if (newUrl.includes('?') || newUrl.includes('#')) return newUrl
  const search = typeof incomingSearch === 'string' ? incomingSearch : ''
  if (search && search !== '?') return newUrl + (search.startsWith('?') ? search : '?' + search)
  return newUrl
}

// Request paths this layer must never touch: Nuxt build assets, API/server routes, the sitemap,
// and the paths the route-service proxies to the CMS rather than to this app.
const SKIP_PREFIXES = [
  '/_nuxt/', '/__nuxt', '/api/', '/__sitemap__',
  '/assets/', '/items/', '/document/', '/press-releases/', '/reporter-letters/', '/unbundling/',
  '/graphql',
]
const SKIP_EXACT = new Set(['/favicon.ico', '/robots.txt', '/sitemap.xml'])

export function isSkippablePath(pathname) {
  if (SKIP_EXACT.has(pathname)) return true
  return SKIP_PREFIXES.some((pre) => pathname === pre || pathname.startsWith(pre))
}
