const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizePath,
  buildRedirectIndex,
  resolveRedirect,
  buildLocation,
  createRedirectStore,
} = require('./redirects');

test('normalizePath', () => {
  assert.equal(normalizePath('/foo/'), '/foo');
  assert.equal(normalizePath('/'), '/');
  assert.equal(normalizePath(''), '/');
  assert.equal(normalizePath('foo'), '/foo');
  assert.equal(normalizePath('/a/b?x=1'), '/a/b');
  assert.equal(normalizePath('/a//b///c'), '/a/b/c');
  assert.equal(normalizePath('https://onrr.gov/a/b/'), '/a/b');
  assert.equal(normalizePath('/Press-Releases'), '/Press-Releases'); // case preserved
});

test('buildRedirectIndex: first row wins, loop guard, null target skipped', () => {
  const idx = buildRedirectIndex([
    { old_url: '/dup', new_url: '/first', status: 'published' },
    { old_url: '/dup', new_url: '/second', status: 'published' },
    { old_url: '/loop/', new_url: '/loop', status: 'published' },
    { old_url: '/bad', new_url: null },
  ]);
  assert.equal(idx.exact.get('/dup'), '/first');
  assert.ok(!idx.exact.has('/loop'));
  assert.ok(!idx.exact.has('/bad'));
  assert.equal(idx.conflicts.length, 1);
});

test('resolveRedirect: exact first, trailing-slash tolerant, case-insensitive fallback', () => {
  const idx = buildRedirectIndex([
    { old_url: '/press-releases', new_url: '/about/public-affairs', status: 'published' },
  ]);
  assert.equal(resolveRedirect(idx, '/press-releases'), '/about/public-affairs');
  assert.equal(resolveRedirect(idx, '/press-releases/'), '/about/public-affairs');
  assert.equal(resolveRedirect(idx, '/Press-Releases'), '/about/public-affairs'); // CI fallback
  // A real proxied file under the same prefix has no row -> no match -> proxies as before.
  assert.equal(resolveRedirect(idx, '/press-releases/report-2024.pdf'), null);
});

test('buildLocation', () => {
  assert.equal(buildLocation('/about/public-affairs', ''), '/about/public-affairs');
  assert.equal(buildLocation('/about/public-affairs', '?x=1'), '/about/public-affairs?x=1');
  assert.equal(buildLocation('/explore?location=WY', '?x=1'), '/explore?location=WY');
});

// --- store: the press-releases scenario, caching, and fail-open ---

function fakeFetch(rows, counter) {
  return async () => {
    if (counter) counter.n++;
    return { ok: true, status: 200, json: async () => ({ data: rows }) };
  };
}

test('store: bare /press-releases redirects; the PDF path does not', async () => {
  const store = createRedirectStore({
    cmsBaseUrl: 'https://cms.test',
    fetchImpl: fakeFetch([{ old_url: '/press-releases', new_url: '/about/public-affairs', status: 'published' }]),
    log: { warn() {}, error() {} },
  });
  assert.equal(await store.resolve('/press-releases'), '/about/public-affairs');
  assert.equal(await store.resolve('/press-releases/report-2024.pdf'), null);
});

test('store: the index is cached across lookups (one fetch within TTL)', async () => {
  const counter = { n: 0 };
  const store = createRedirectStore({
    cmsBaseUrl: 'https://cms.test',
    fetchImpl: fakeFetch([{ old_url: '/unbundling/methodology.htm', new_url: '/references/valuation', status: 'published' }], counter),
    log: { warn() {}, error() {} },
  });
  await store.resolve('/unbundling/methodology.htm');
  await store.resolve('/unbundling/other');
  assert.equal(counter.n, 1);
});

test('store: fails open to no-match when the CMS errors', async () => {
  const store = createRedirectStore({
    cmsBaseUrl: 'https://cms.test',
    coldWaitMs: 50,
    fetchImpl: async () => { throw new Error('boom'); },
    log: { warn() {}, error() {} },
  });
  assert.equal(await store.resolve('/press-releases'), null);
});
