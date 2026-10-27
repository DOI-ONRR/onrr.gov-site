// Unit tests for the server-side redirect helpers. Pure functions, no Nuxt/Nitro runtime, so
// they run on Node's built-in test runner with no extra dependency:
//   node --test server/utils/redirects.test.mjs   (or `npm run test:unit`)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizePath,
  buildRedirectIndex,
  resolveRedirect,
  buildLocation,
  isSkippablePath,
} from './redirects.js'

test('normalizePath', () => {
  assert.equal(normalizePath('/foo/'), '/foo')
  assert.equal(normalizePath('/'), '/')
  assert.equal(normalizePath(''), '/')
  assert.equal(normalizePath(undefined), '/')
  assert.equal(normalizePath('foo'), '/foo')
  assert.equal(normalizePath('/a/b?x=1'), '/a/b')
  assert.equal(normalizePath('/a/b#frag'), '/a/b')
  assert.equal(normalizePath('/a//b///c'), '/a/b/c')
  assert.equal(normalizePath('/a/b/'), '/a/b')
  assert.equal(normalizePath('https://onrr.gov/a/b/'), '/a/b')
  // Case is preserved (the exact tier is case-sensitive).
  assert.equal(normalizePath('/About/Foo'), '/About/Foo')
})

test('buildRedirectIndex: first row wins, loop guard, case index', () => {
  const idx = buildRedirectIndex([
    { old_url: '/Old-Page', new_url: '/new-page', status: 'published' },
    { old_url: '/old-page', new_url: '/different', status: 'published' }, // case variant, diff target
    { old_url: '/dup', new_url: '/first', status: 'published' },
    { old_url: '/dup', new_url: '/second', status: 'published' }, // duplicate old_url -> ignored
    { old_url: '/loop/', new_url: '/loop', status: 'published' }, // self-loop after normalize -> dropped
    { old_url: '/bad', new_url: null }, // missing target -> skipped
  ])
  assert.equal(idx.exact.get('/Old-Page'), '/new-page')
  assert.equal(idx.exact.get('/old-page'), '/different') // both case variants kept in exact tier
  assert.equal(idx.exact.get('/dup'), '/first') // first row wins
  assert.ok(!idx.exact.has('/loop')) // loop dropped
  assert.ok(!idx.exact.has('/bad')) // null target skipped
  assert.equal(idx.conflicts.length, 1) // only the /dup conflict is reported
  assert.equal(idx.conflicts[0].key, '/dup')
})

test('resolveRedirect: exact tier wins, then case-insensitive fallback', () => {
  const idx = buildRedirectIndex([
    { old_url: '/About/MOUs.htm', new_url: '/about/interagency', status: 'published' },
  ])
  // Exact (case-sensitive) hit.
  assert.equal(resolveRedirect(idx, '/About/MOUs.htm'), '/about/interagency')
  // Trailing slash tolerated.
  assert.equal(resolveRedirect(idx, '/About/MOUs.htm/'), '/about/interagency')
  // Wrong case still resolves via the CI fallback tier.
  assert.equal(resolveRedirect(idx, '/about/mous.htm'), '/about/interagency')
  // Unknown path -> no match.
  assert.equal(resolveRedirect(idx, '/nope'), null)
})

test('resolveRedirect: exact row beats a case-variant with a different target', () => {
  // When an exact row exists, it must win over the CI tier even if a different-cased row maps
  // elsewhere — this is why case is not folded into a single index.
  const idx = buildRedirectIndex([
    { old_url: '/Page', new_url: '/upper-target', status: 'published' },
    { old_url: '/page', new_url: '/lower-target', status: 'published' },
  ])
  assert.equal(resolveRedirect(idx, '/Page'), '/upper-target')
  assert.equal(resolveRedirect(idx, '/page'), '/lower-target')
})

test('buildLocation', () => {
  assert.equal(buildLocation('/explore?location=WY', '?foo=1'), '/explore?location=WY')
  assert.equal(buildLocation('/revenue-data', '?foo=1'), '/revenue-data?foo=1')
  assert.equal(buildLocation('/revenue-data', ''), '/revenue-data')
  assert.equal(buildLocation('/revenue-data', '?'), '/revenue-data')
  // An incoming query is forwarded onto a bare target even when absolute/external (harmless,
  // and consistent with "forward when the target carries none"); a target with its own query
  // is left untouched.
  assert.equal(buildLocation('https://blog.onrr.gov/post', '?x=1'), 'https://blog.onrr.gov/post?x=1')
  assert.equal(buildLocation('https://blog.onrr.gov/post?a=1', '?x=1'), 'https://blog.onrr.gov/post?a=1')
})

test('isSkippablePath', () => {
  assert.equal(isSkippablePath('/_nuxt/entry.js'), true)
  assert.equal(isSkippablePath('/api/foo'), true)
  assert.equal(isSkippablePath('/sitemap.xml'), true)
  assert.equal(isSkippablePath('/favicon.ico'), true)
  assert.equal(isSkippablePath('/assets/img.png'), true)
  assert.equal(isSkippablePath('/how-revenue-works'), false)
  assert.equal(isSkippablePath('/revenue-data/monthly-disbursements'), false)
})
