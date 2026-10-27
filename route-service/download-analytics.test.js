const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const {
  classifyDownload,
  isOnsiteReferer,
  isLikelyBot,
  gaClientIdFromCookie,
  downloadAnalyticsMiddleware,
} = require('./download-analytics');

test('classifyDownload', () => {
  assert.equal(classifyDownload('/document/report').isDownload, true); // /document/* unconditional
  assert.deepEqual(classifyDownload('/press-releases/foo-2026.pdf'), { isDownload: true, file: 'foo-2026.pdf', ext: 'pdf' });
  assert.equal(classifyDownload('/unbundling/methodology.xlsx').isDownload, true);
  assert.equal(classifyDownload('/press-releases').isDownload, false); // bare (redirect target, not a file)
  assert.equal(classifyDownload('/press-releases/photo.jpg').isDownload, false); // not a document ext
  assert.equal(classifyDownload('/items/pages').isDownload, false); // JSON, not a file
  assert.equal(classifyDownload('/assets/abc123').isDownload, false); // inline image / dataset export
  assert.equal(classifyDownload('/how-revenue-works/coal').isDownload, false);
});

test('isOnsiteReferer', () => {
  const own = ['onrr.gov'];
  assert.equal(isOnsiteReferer('https://www.onrr.gov/about', own), true);
  assert.equal(isOnsiteReferer('https://onrr.gov/x', own), true);
  assert.equal(isOnsiteReferer('https://data.onrr.gov/x', own), true);
  assert.equal(isOnsiteReferer('https://www.google.com/', own), false);
  assert.equal(isOnsiteReferer('', own), false);
  assert.equal(isOnsiteReferer(undefined, own), false);
  assert.equal(isOnsiteReferer('not a url', own), false);
});

test('isLikelyBot', () => {
  assert.equal(isLikelyBot('Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/155 Safari/537.36'), false);
  assert.equal(isLikelyBot('Googlebot/2.1 (+http://www.google.com/bot.html)'), true);
  assert.equal(isLikelyBot('curl/8.4.0'), true);
  assert.equal(isLikelyBot('python-requests/2.31'), true);
  assert.equal(isLikelyBot(''), true); // no UA
  assert.equal(isLikelyBot(undefined), true);
});

test('gaClientIdFromCookie', () => {
  assert.equal(gaClientIdFromCookie('_ga=GA1.1.1234567890.1680000000; _gid=GA1.1.9.9'), '1234567890.1680000000');
  assert.equal(gaClientIdFromCookie('_gid=GA1.1.9.9; _ga=GA1.2.55.66'), '55.66');
  assert.equal(gaClientIdFromCookie('other=1'), null);
  assert.equal(gaClientIdFromCookie(''), null);
  assert.equal(gaClientIdFromCookie(undefined), null);
});

// --- middleware ---

function run(reqHeaders, { method = 'GET', url = '/press-releases/foo.pdf', status = 200, ga4 = true } = {}) {
  const sent = [];
  const logs = [];
  const mw = downloadAnalyticsMiddleware({
    salt: 'test-salt',
    measurementId: ga4 ? 'G-TEST' : undefined,
    apiSecret: ga4 ? 'secret' : undefined,
    ownHosts: ['onrr.gov'],
    log: (rec) => logs.push(rec),
    sendGa4: (payload) => sent.push(payload),
    now: () => 0,
  });
  const req = { method, originalUrl: url, headers: reqHeaders };
  const res = new EventEmitter();
  res.statusCode = status;
  let nexted = false;
  mw(req, res, () => { nexted = true; });
  res.emit('finish');
  return { sent, logs, nexted };
}

test('middleware: off-site, human, 200 -> GA4 sent with server source', () => {
  const { sent, logs } = run({
    'user-agent': 'Mozilla/5.0 Chrome/155',
    referer: 'https://www.google.com/',
    'x-forwarded-for': '203.0.113.9',
  });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].events[0].name, 'file_download');
  assert.equal(sent[0].events[0].params.measurement_source, 'server');
  assert.equal(sent[0].events[0].params.file_name, 'foo.pdf');
  assert.equal(logs[0].ga4, true);
});

test('middleware: uses the _ga cookie client id when present', () => {
  const { sent } = run({
    'user-agent': 'Mozilla/5.0 Chrome/155',
    referer: 'https://www.google.com/',
    cookie: '_ga=GA1.1.1234567890.1680000000',
    'x-forwarded-for': '203.0.113.9',
  });
  assert.equal(sent[0].client_id, '1234567890.1680000000');
});

test('middleware: on-site referer -> no GA4 (counted client-side)', () => {
  const { sent, logs } = run({
    'user-agent': 'Mozilla/5.0 Chrome/155',
    referer: 'https://www.onrr.gov/about/public-affairs',
  });
  assert.equal(sent.length, 0);
  assert.equal(logs[0].onsite, true);
  assert.equal(logs[0].ga4, false);
});

test('middleware: crawler -> no GA4 (but still logged)', () => {
  const { sent, logs } = run({ 'user-agent': 'Googlebot/2.1', referer: 'https://www.google.com/' });
  assert.equal(sent.length, 0);
  assert.equal(logs[0].bot, true);
  assert.equal(logs.length, 1);
});

test('middleware: non-2xx delivery -> nothing', () => {
  const { sent, logs } = run({ 'user-agent': 'Mozilla/5.0 Chrome/155', referer: 'https://www.google.com/' }, { status: 404 });
  assert.equal(sent.length, 0);
  assert.equal(logs.length, 0);
});

test('middleware: non-download path and non-GET pass through untouched', () => {
  assert.equal(run({}, { url: '/how-revenue-works/coal' }).logs.length, 0);
  assert.equal(run({}, { method: 'POST' }).logs.length, 0);
});

test('middleware: no GA4 config -> logs only, never sends', () => {
  const { sent, logs } = run({ 'user-agent': 'Mozilla/5.0 Chrome/155', referer: 'https://www.google.com/' }, { ga4: false });
  assert.equal(sent.length, 0);
  assert.equal(logs[0].ga4, false);
});
