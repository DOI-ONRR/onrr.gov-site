const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const {
  classifyRequest,
  hashClient,
  buildLogRecord,
  buildGa4Payload,
  apiUsageMiddleware,
} = require('./api-analytics');

// --- classifyRequest ---------------------------------------------------------
test('classifies the data host (data.onrr.gov/<dataset>)', () => {
  assert.deepEqual(classifyRequest('data.onrr.gov', '/disbursements?limit=5'), {
    isDataApi: true, via: 'host', dataset: 'disbursements',
  });
});

test('classifies the /data alias on the main domain', () => {
  assert.deepEqual(classifyRequest('onrr.gov', '/data/revenue?sort=-year'), {
    isDataApi: true, via: 'alias', dataset: 'revenue',
  });
});

test('treats the API root as the index (empty dataset)', () => {
  assert.deepEqual(classifyRequest('data.onrr.gov', '/'), { isDataApi: true, via: 'host', dataset: '' });
  assert.deepEqual(classifyRequest('onrr.gov', '/data'), { isDataApi: true, via: 'alias', dataset: '' });
});

test('ignores a port in the Host header and is case-insensitive', () => {
  assert.equal(classifyRequest('DATA.onrr.gov:443', '/production').isDataApi, true);
});

test('non-data requests are not data-API', () => {
  assert.deepEqual(classifyRequest('onrr.gov', '/revenue-data/monthly-disbursements'), { isDataApi: false });
  assert.deepEqual(classifyRequest('onrr.gov', '/items/pages'), { isDataApi: false });
  assert.deepEqual(classifyRequest('onrr.gov', '/database'), { isDataApi: false }); // not /data or /data/
});

// --- hashClient --------------------------------------------------------------
test('hashClient is stable per (ip, salt) and differs across ips', () => {
  const a = hashClient('203.0.113.7', 's');
  assert.equal(a, hashClient('203.0.113.7', 's'));
  assert.notEqual(a, hashClient('203.0.113.8', 's'));
  assert.notEqual(a, hashClient('203.0.113.7', 'other-salt'));
});

test('hashClient uses the first X-Forwarded-For hop and returns unknown when absent', () => {
  assert.equal(hashClient('203.0.113.7, 10.0.0.1', 's'), hashClient('203.0.113.7', 's'));
  assert.equal(hashClient('', 's'), 'unknown');
  assert.equal(hashClient(undefined, 's'), 'unknown');
});

test('hashClient never emits the raw ip', () => {
  const ip = '198.51.100.42';
  const h = hashClient(ip, 'salt');
  assert.ok(!h.includes(ip));
  assert.match(h, /^[0-9a-f]{12}$/);
});

// --- buildLogRecord / buildGa4Payload ----------------------------------------
test('buildLogRecord shapes the record and labels the index', () => {
  const rec = buildLogRecord({
    now: 0, dataset: '', via: 'host', method: 'GET', status: 200,
    durationMs: 12, bytes: 345, query: 'limit=5', ua: 'curl/8', client: 'abc123',
  });
  assert.equal(rec.evt, 'data_api');
  assert.equal(rec.dataset, '(index)');
  assert.equal(rec.ts, '1970-01-01T00:00:00.000Z');
  assert.equal(rec.status, 200);
  assert.equal(rec.duration_ms, 12);
  assert.equal(rec.bytes, 345);
  assert.equal(rec.query, 'limit=5');
});

test('buildGa4Payload keeps params low-cardinality and maps unknown client', () => {
  const p = buildGa4Payload({ client: 'unknown', dataset: 'revenue', via: 'alias', method: 'GET', status: 404 });
  assert.equal(p.client_id, 'anonymous');
  assert.equal(p.events[0].name, 'api_request');
  assert.deepEqual(p.events[0].params, { dataset: 'revenue', via: 'alias', method: 'GET', status: '404' });
  assert.equal('query' in p.events[0].params, false); // never send the raw query to GA4
});

// --- middleware --------------------------------------------------------------
function fakeReqRes({ host, url, method = 'GET', xff, ua }) {
  const req = { headers: { host, 'x-forwarded-for': xff, 'user-agent': ua }, originalUrl: url, method };
  const res = new EventEmitter();
  res.statusCode = 200;
  res.write = () => true;
  res.end = () => true;
  return { req, res };
}

test('middleware passes through non-data requests without logging', () => {
  const logs = [];
  const mw = apiUsageMiddleware({ log: (r) => logs.push(r), salt: 's' });
  const { req, res } = fakeReqRes({ host: 'onrr.gov', url: '/about' });
  let nexted = false;
  mw(req, res, () => { nexted = true; });
  res.emit('finish');
  assert.equal(nexted, true);
  assert.equal(logs.length, 0);
});

test('middleware logs one record on finish for a data-API request', () => {
  const logs = [];
  let clock = 1000;
  const mw = apiUsageMiddleware({ log: (r) => logs.push(r), salt: 's', now: () => clock });
  const { req, res } = fakeReqRes({ host: 'data.onrr.gov', url: '/disbursements?limit=5', xff: '203.0.113.7', ua: 'curl/8' });
  mw(req, res, () => {});
  // response writes some bytes, then finishes 40ms later
  res.write('hello');       // 5 bytes
  res.end('!');             // +1 byte
  clock = 1040;
  res.statusCode = 200;
  res.emit('finish');
  assert.equal(logs.length, 1);
  const rec = logs[0];
  assert.equal(rec.dataset, 'disbursements');
  assert.equal(rec.via, 'host');
  assert.equal(rec.status, 200);
  assert.equal(rec.duration_ms, 40);
  assert.equal(rec.bytes, 6);
  assert.equal(rec.query, 'limit=5');
  assert.equal(rec.client, hashClient('203.0.113.7', 's'));
});

test('middleware fires GA4 only when configured', () => {
  const sent = [];
  const sendGa4 = (payload) => { sent.push(payload); return Promise.resolve(); };

  // not configured -> no GA4 call
  const mwOff = apiUsageMiddleware({ log: () => {}, sendGa4, salt: 's' });
  const a = fakeReqRes({ host: 'data.onrr.gov', url: '/revenue' });
  mwOff(a.req, a.res, () => {});
  a.res.emit('finish');
  assert.equal(sent.length, 0);

  // configured -> one GA4 call
  const mwOn = apiUsageMiddleware({ log: () => {}, sendGa4, salt: 's', measurementId: 'G-X', apiSecret: 'secret' });
  const b = fakeReqRes({ host: 'data.onrr.gov', url: '/revenue' });
  b.res.statusCode = 200;
  mwOn(b.req, b.res, () => {});
  b.res.emit('finish');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].events[0].params.dataset, 'revenue');
});

test('a throwing log sink never breaks the response path', () => {
  const mw = apiUsageMiddleware({ log: () => { throw new Error('sink down'); }, salt: 's' });
  const { req, res } = fakeReqRes({ host: 'data.onrr.gov', url: '/production' });
  mw(req, res, () => {});
  assert.doesNotThrow(() => res.emit('finish'));
});
