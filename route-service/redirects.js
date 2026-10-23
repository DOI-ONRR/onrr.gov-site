// Directus redirect consumption for the route-service.
//
// The route-service proxies a fixed set of path prefixes (/assets, /items, /document,
// /press-releases, /reporter-letters, /unbundling) straight to the CMS. Those requests never
// reach a redirect-aware frontend, so any redirect whose old_url falls under one of them — e.g.
// the bare /press-releases (a dead page; the real PDFs live at /press-releases/<file>), or the
// legacy /unbundling/* paths — has to be enforced here, the only layer that sees them first.
//
// The match is intentionally EXACT (trailing-slash tolerant, with a case-insensitive fallback):
// bare /press-releases matches its redirect row, while /press-releases/report-2024.pdf has no
// row and so passes through to the CMS as before. This mirrors the Nuxt server-side matcher
// (frontend-nuxt/server/utils/redirects.js) so both layers behave identically; it is duplicated
// rather than shared because the two services deploy independently (CommonJS here, ESM there).

// Normalize a path for matching: strip query/hash, collapse a trailing slash (except root),
// guarantee a single leading slash. Case is preserved; the caller lowercases for the CI tier.
function normalizePath(input) {
  if (typeof input !== 'string' || input === '') return '/';
  let p = input;
  const cut = p.search(/[?#]/);
  if (cut !== -1) p = p.slice(0, cut);
  if (/^https?:\/\//i.test(p)) {
    try { p = new URL(p).pathname; } catch { /* keep as-is */ }
  }
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/\/{2,}/g, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

// Build the two lookup indexes from raw collection rows. First row wins on collision within a
// tier (legacy array-order semantics). Self-referential rows are dropped to prevent loops.
function buildRedirectIndex(rows) {
  const exact = new Map();
  const ci = new Map();
  const conflicts = [];
  for (const row of rows || []) {
    const oldUrl = row && typeof row.old_url === 'string' ? row.old_url : null;
    const newUrl = row && typeof row.new_url === 'string' ? row.new_url : null;
    if (!oldUrl || !newUrl) continue;

    const key = normalizePath(oldUrl);
    const destIsAbsolute = /^https?:\/\//i.test(newUrl);
    if (!destIsAbsolute && normalizePath(newUrl) === key) continue; // loop guard

    if (exact.has(key)) {
      if (exact.get(key) !== newUrl) conflicts.push({ key, kept: exact.get(key), ignored: newUrl });
    } else {
      exact.set(key, newUrl);
    }
    const ciKey = key.toLowerCase();
    if (!ci.has(ciKey)) ci.set(ciKey, newUrl);
  }
  return { exact, ci, conflicts };
}

// Resolve a request path against an index: exact (case-sensitive) first, then case-insensitive.
function resolveRedirect(index, pathname) {
  if (!index) return null;
  const key = normalizePath(pathname);
  if (index.exact.has(key)) return index.exact.get(key);
  const ciKey = key.toLowerCase();
  if (index.ci.has(ciKey)) return index.ci.get(ciKey);
  return null;
}

// Build the Location value. A target with its own query/hash is used verbatim; otherwise the
// incoming query is forwarded. Fragments are never seen server-side.
function buildLocation(newUrl, incomingSearch) {
  if (typeof newUrl !== 'string' || newUrl === '') return newUrl;
  if (newUrl.includes('?') || newUrl.includes('#')) return newUrl;
  const search = typeof incomingSearch === 'string' ? incomingSearch : '';
  if (search && search !== '?') return newUrl + (search.startsWith('?') ? search : '?' + search);
  return newUrl;
}

// A cached, self-refreshing view of the published redirects. The lookup can never stall a
// request: fresh cache is used directly; a stale cache is served while a single background
// refresh runs; a cold start waits at most coldWaitMs before proceeding with no match; and a
// failed load keeps the last good (or empty) index and retries sooner than the full TTL. The
// CMS call is bounded by fetchTimeoutMs. Mirrors the Nuxt middleware's freshness model.
function createRedirectStore(opts = {}) {
  const {
    cmsBaseUrl,
    ttlMs = 5 * 60 * 1000,
    retryMs = 30 * 1000,
    fetchTimeoutMs = 4000,
    coldWaitMs = 2000,
    fetchImpl = globalThis.fetch,
    log = console,
  } = opts;

  let cache = { index: null, loadedAt: 0 };
  let inFlight = null;

  async function fetchRows() {
    if (!cmsBaseUrl) return [];
    const url = `${cmsBaseUrl}/items/redirects?fields=old_url,new_url,status&filter[status][_eq]=published&limit=-1`;
    const res = await fetchImpl(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });
    if (!res.ok) throw new Error(`CMS responded ${res.status}`);
    const body = await res.json();
    return body && Array.isArray(body.data) ? body.data : [];
  }

  function refresh() {
    if (inFlight) return inFlight;
    inFlight = (async () => {
      try {
        const index = buildRedirectIndex(await fetchRows());
        cache = { index, loadedAt: Date.now() };
        if (index.conflicts.length) {
          log.warn(`[redirects] loaded ${index.exact.size} paths; ${index.conflicts.length} duplicate old_url(s) ignored (first row wins)`);
        }
        return index;
      } catch (err) {
        log.error('[redirects] failed to load from CMS:', err && err.message ? err.message : err);
        const kept = cache.index || buildRedirectIndex([]);
        cache = { index: kept, loadedAt: Date.now() - (ttlMs - retryMs) };
        return kept;
      } finally {
        inFlight = null;
      }
    })();
    return inFlight;
  }

  async function getIndex() {
    const age = Date.now() - cache.loadedAt;
    if (cache.index && age < ttlMs) return cache.index;
    if (cache.index) { refresh(); return cache.index; }
    return Promise.race([
      refresh(),
      new Promise((resolve) => setTimeout(() => resolve(buildRedirectIndex([])), coldWaitMs)),
    ]);
  }

  async function resolve(pathname) {
    return resolveRedirect(await getIndex(), pathname);
  }

  return { resolve, getIndex, refresh };
}

module.exports = { normalizePath, buildRedirectIndex, resolveRedirect, buildLocation, createRedirectStore };
