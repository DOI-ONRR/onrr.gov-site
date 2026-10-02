const { test } = require('node:test');
const assert = require('node:assert/strict');
const { securityHeaders, frameAncestors } = require('./security-headers');

const env = { FRAME_ANCESTORS: 'https://prod-onrr-cms.app.cloud.gov' };

test('keeps an upstream CSP and appends frame-ancestors (Directus /assets)', () => {
  const out = securityHeaders({ 'content-security-policy': "default-src 'none'", 'content-type': 'image/svg+xml' }, env);
  assert.equal(out['content-security-policy'], "default-src 'none'; frame-ancestors 'self' https://prod-onrr-cms.app.cloud.gov");
  assert.equal(out['content-type'], 'image/svg+xml');
});

test('does not duplicate a trailing semicolon', () => {
  const out = securityHeaders({ 'content-security-policy': "default-src 'none';" }, env);
  assert.equal(out['content-security-policy'], "default-src 'none'; frame-ancestors 'self' https://prod-onrr-cms.app.cloud.gov");
});

test('leaves an upstream frame-ancestors directive alone', () => {
  const csp = "default-src 'self'; frame-ancestors 'none'";
  assert.equal(securityHeaders({ 'content-security-policy': csp }, env)['content-security-policy'], csp);
});

test('sets frame-ancestors when upstream has no CSP (frontend pages)', () => {
  const out = securityHeaders({ 'content-type': 'text/html' }, env);
  assert.equal(out['content-security-policy'], "frame-ancestors 'self' https://prod-onrr-cms.app.cloud.gov");
  assert.equal(out['x-frame-options'], 'SAMEORIGIN');
});

test("defaults to 'self' only when FRAME_ANCESTORS is unset or blank", () => {
  assert.equal(frameAncestors({}), "'self'");
  assert.equal(frameAncestors({ FRAME_ANCESTORS: '  ' }), "'self'");
  assert.equal(securityHeaders({}, {})['content-security-policy'], "frame-ancestors 'self'");
});

test('does not treat a directive that merely contains the name as frame-ancestors', () => {
  const out = securityHeaders({ 'content-security-policy': "script-src 'self' https://x/frame-ancestors-test" }, env);
  assert.match(out['content-security-policy'], /; frame-ancestors 'self' https:\/\/prod-onrr-cms\.app\.cloud\.gov$/);
});

test('does not mutate the upstream headers object', () => {
  const upstream = { 'content-security-policy': "default-src 'none'" };
  securityHeaders(upstream, env);
  assert.deepEqual(upstream, { 'content-security-policy': "default-src 'none'" });
});
